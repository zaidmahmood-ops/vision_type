# pvp.py
import asyncio
import random
from typing import Dict, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

MAX_PLAYERS_PER_ROOM = 4
MAX_ROUNDS = 25
COUNTDOWN_SECONDS = 5
ROUND_GRACE_SECONDS = 30  # after the first finisher, wait this long for stragglers

active_rooms: Dict[str, dict] = {}

DEFAULT_CONFIG = {"dataset_key": "english-200", "test_mode": "words", "test_limit": 35, "rounds": 3}


def new_room(host: str) -> dict:
    return {
        "host": host,
        "max_players": MAX_PLAYERS_PER_ROOM,
        "status": "waiting",   # waiting | playing (used for join checks)
        "phase": "lobby",      # lobby | readying | countdown | racing | intermission
        "config": dict(DEFAULT_CONFIG),
        "current_round": 0,
        "ready": set(),
        "finished": {},        # username -> result for the current round
        "scores": {},          # username -> rounds won
        "players": [],
    }


def _clamp_int(value, lo, hi, fallback):
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return fallback


def _clamp_float(value, lo, hi):
    try:
        return max(lo, min(hi, float(value)))
    except (TypeError, ValueError):
        return lo


def sanitize_config(raw: dict, current: dict) -> dict:
    mode = raw.get("test_mode", current["test_mode"])
    if mode not in ("time", "words"):
        mode = current["test_mode"]
    return {
        "dataset_key": str(raw.get("dataset_key", current["dataset_key"]))[:60],
        "test_mode": mode,
        "test_limit": _clamp_int(raw.get("test_limit"), 1, 500, current["test_limit"]),
        "rounds": _clamp_int(raw.get("rounds"), 1, MAX_ROUNDS, current["rounds"]),
    }


async def broadcast_to_room(room_id: str, message: dict, exclude: Optional[str] = None):
    room = active_rooms.get(room_id)
    if not room:
        return
    for player in list(room["players"]):
        if player["username"] == exclude:
            continue
        try:
            await player["websocket"].send_json(message)
        except Exception as e:
            print(f"Error broadcasting to player: {e}")


@router.websocket("/ws/pvp/{room_id}")
async def pvp_websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    username: str = "Anonymous",
    action: str = "join",
):
    await websocket.accept()
    room_id = room_id.upper()

    if action == "join" and room_id not in active_rooms:
        await websocket.send_json({"error": "Room does not exist. Check the code or create a new room."})
        await websocket.close(code=4004)
        return

    if action == "create" and room_id in active_rooms:
        await websocket.send_json({"error": "Room code already taken. Try a different code."})
        await websocket.close(code=4005)
        return

    if room_id not in active_rooms:
        active_rooms[room_id] = new_room(username)

    room = active_rooms[room_id]

    if len(room["players"]) >= room["max_players"]:
        await websocket.send_json({"error": f"Room is full (Max {room['max_players']} players allowed)"})
        await websocket.close(code=4000)
        return

    if room["status"] != "waiting":
        await websocket.send_json({"error": "Match has already started."})
        await websocket.close(code=4001)
        return

    # Identity is the username, so duplicates would break host/finish tracking
    if any(p["username"] == username for p in room["players"]):
        await websocket.send_json({"error": "That username is already in this room."})
        await websocket.close(code=4002)
        return

    player_info = {"username": username, "websocket": websocket}
    room["players"].append(player_info)
    print(f"Player {username} joined room {room_id}. Total: {len(room['players'])}/{room['max_players']}")

    await broadcast_to_room(room_id, {
        "event": "player_joined",
        "username": username,
        "host": room["host"],
        "total_players": len(room["players"]),
        "max_players": room["max_players"],
        "config": room["config"],
    })

    try:
        while True:
            data = await websocket.receive_json()
            await handle_event(room_id, room, username, data.get("event", "message"), data)
    except WebSocketDisconnect:
        await handle_disconnect(room_id, room, username, player_info)


async def handle_event(room_id: str, room: dict, username: str, event: str, data: dict):
    is_host = room["host"] == username

    if event == "update_config" and is_host and room["phase"] == "lobby":
        room["config"] = sanitize_config(data, room["config"])
        await broadcast_to_room(room_id, {"event": "config_updated", "config": room["config"]})

    elif event == "start_game" and is_host and room["phase"] == "lobby":
        room["status"] = "playing"
        room["phase"] = "readying"
        room["current_round"] = 0
        room["ready"].clear()
        room["scores"] = {p["username"]: 0 for p in room["players"]}
        print(f"Room {room_id} match started by host {username}.")
        await broadcast_to_room(room_id, {
            "event": "start_game",
            "config": room["config"],
            "players": [p["username"] for p in room["players"]],
        })

    elif event == "player_ready" and room["phase"] == "readying":
        room["ready"].add(username)
        await broadcast_to_room(room_id, {
            "event": "ready_update",
            "ready": len(room["ready"]),
            "total": len(room["players"]),
        })
        await maybe_start_countdown(room_id, room)

    elif event == "progress" and room["phase"] == "racing" and username not in room["finished"]:
        await broadcast_to_room(room_id, {
            "event": "progress",
            "username": username,
            "progress": _clamp_float(data.get("progress"), 0, 1),
            "wpm": _clamp_float(data.get("wpm"), 0, 400),
        }, exclude=username)  # the sender already updated their own bar locally

    elif event == "finish" and room["phase"] == "racing" and username not in room["finished"]:
        result = {
            "wpm": _clamp_float(data.get("wpm"), 0, 400),
            "accuracy": _clamp_float(data.get("accuracy"), 0, 100),
            "time": _clamp_float(data.get("time"), 0, 3600),
            "place": len(room["finished"]) + 1,
        }
        room["finished"][username] = result
        await broadcast_to_room(room_id, {"event": "player_finished", "username": username, **result})
        if len(room["finished"]) == 1:
            asyncio.create_task(_round_grace_timeout(room_id, room, room["current_round"]))
        await maybe_end_round(room_id, room)


async def maybe_start_countdown(room_id: str, room: dict):
    names = {p["username"] for p in room["players"]}
    if room["phase"] != "readying" or not names or not names.issubset(room["ready"]):
        return

    room["phase"] = "countdown"
    room["current_round"] += 1
    room["finished"] = {}
    seed = random.randint(1, 2**31 - 1)  # clients build identical words from this

    await broadcast_to_room(room_id, {
        "event": "start_countdown",
        "seconds": COUNTDOWN_SECONDS,
        "seed": seed,
        "round": room["current_round"],
        "total_rounds": room["config"]["rounds"],
    })
    asyncio.create_task(_finish_countdown(room_id, room, room["current_round"]))


async def _finish_countdown(room_id: str, room: dict, round_no: int):
    # Flip slightly early so a legit first message after "GO" is never rejected
    await asyncio.sleep(COUNTDOWN_SECONDS - 0.5)
    if active_rooms.get(room_id) is room and room["phase"] == "countdown" and room["current_round"] == round_no:
        room["phase"] = "racing"


async def _round_grace_timeout(room_id: str, room: dict, round_no: int):
    await asyncio.sleep(ROUND_GRACE_SECONDS)
    if active_rooms.get(room_id) is room and room["phase"] == "racing" and room["current_round"] == round_no:
        await maybe_end_round(room_id, room, force=True)


async def maybe_end_round(room_id: str, room: dict, force: bool = False):
    if room["phase"] != "racing":
        return
    names = [p["username"] for p in room["players"]]
    if not names:
        return
    if not force and not all(n in room["finished"] for n in names):
        return

    room["phase"] = "intermission"

    results = [{"username": u, **r} for u, r in room["finished"].items()]
    if room["config"]["test_mode"] == "time":
        results.sort(key=lambda r: -r["wpm"])      # same clock for everyone: rank by speed
    else:
        results.sort(key=lambda r: r["place"])     # words mode: first across the line
    for i, r in enumerate(results):
        r["place"] = i + 1
    for n in names:
        if n not in room["finished"]:
            results.append({"username": n, "dnf": True, "wpm": 0, "accuracy": 0, "time": 0, "place": None})

    if results and not results[0].get("dnf"):
        winner = results[0]["username"]
        room["scores"][winner] = room["scores"].get(winner, 0) + 1

    match_over = room["current_round"] >= room["config"]["rounds"]
    await broadcast_to_room(room_id, {
        "event": "round_end",
        "round": room["current_round"],
        "total_rounds": room["config"]["rounds"],
        "results": results,
        "scores": room["scores"],
        "match_over": match_over,
    })

    room["ready"].clear()
    if match_over:
        room["status"] = "waiting"
        room["phase"] = "lobby"
        room["current_round"] = 0
    else:
        room["phase"] = "readying"  # clients send player_ready again after the intermission


async def handle_disconnect(room_id: str, room: dict, username: str, player_info: dict):
    if player_info in room["players"]:
        room["players"].remove(player_info)
    room["ready"].discard(username)
    print(f"Player {username} left room {room_id}.")

    if not room["players"]:
        if active_rooms.get(room_id) is room:
            del active_rooms[room_id]
            print(f"Room {room_id} is empty and has been destroyed.")
        return

    if room["host"] == username:
        room["host"] = room["players"][0]["username"]

    await broadcast_to_room(room_id, {
        "event": "player_left",
        "username": username,
        "new_host": room["host"],
        "host": room["host"],
        "total_players": len(room["players"]),
        "max_players": room["max_players"],
    })

    # The leaver may have been the last player we were waiting on
    await maybe_start_countdown(room_id, room)
    await maybe_end_round(room_id, room)