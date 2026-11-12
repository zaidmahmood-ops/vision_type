# pvp.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

MAX_PLAYERS_PER_ROOM = 6

# In-memory room storage dictionary
# Structure: { 
#   "ROOM123": {
#       "host": "Alice",
#       "max_players": 6,
#       "status": "waiting", # "waiting" or "playing"
#       "players": [ {"username": "Alice", "websocket": ws_obj}, ... ]
#   } 
# }
active_rooms: Dict[str, dict] = {}

@router.websocket("/ws/pvp/{room_id}")
async def pvp_websocket_endpoint(
    websocket: WebSocket, 
    room_id: str, 
    username: str = "Anonymous", 
    action: str = "join"
):
    await websocket.accept()
    room_id = room_id.upper()

    # 1. STRICT VALIDATION: Joining a room that doesn't exist
    if action == "join" and room_id not in active_rooms:
        await websocket.send_json({"error": "Room does not exist. Check the code or create a new room."})
        await websocket.close(code=4004)
        return

    # 2. STRICT VALIDATION: Creating a room code that's already taken
    if action == "create" and room_id in active_rooms:
        await websocket.send_json({"error": "Room code already taken. Try a different code."})
        await websocket.close(code=4005)
        return

    # Initialize room if it's being newly created
    if room_id not in active_rooms:
        active_rooms[room_id] = {
            "host": username,
            "max_players": MAX_PLAYERS_PER_ROOM,
            "status": "waiting",
            "players": []
        }

    room = active_rooms[room_id]

    # 3. CAPACITY CHECK (Strictly capped at 6 players)
    if len(room["players"]) >= room["max_players"]:
        await websocket.send_json({"error": f"Room is full (Max {room['max_players']} players allowed)"})
        await websocket.close(code=4000)
        return

    # 4. MATCH STATE CHECK (Prevent joining ongoing games)
    if room["status"] != "waiting":
        await websocket.send_json({"error": "Match has already started."})
        await websocket.close(code=4001)
        return

    # Add player to room session
    player_info = {"username": username, "websocket": websocket}
    room["players"].append(player_info)

    print(f"Player {username} joined room {room_id}. Total: {len(room['players'])}/{room['max_players']}")

    # Broadcast player joined event with current host and max capacity info
    await broadcast_to_room(room_id, {
        "event": "player_joined",
        "username": username,
        "host": room["host"],
        "total_players": len(room["players"]),
        "max_players": room["max_players"]
    })

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event", "message")

            # If host triggers the start of the game
            if event_type == "start_game" and room["host"] == username:
                room["status"] = "playing"
                print(f"Room {room_id} match started by host {username}.")

            # Broadcast incoming message/event to everyone in the room
            await broadcast_to_room(room_id, {
                "event": event_type,
                "username": username,
                **data
            })
            
    except WebSocketDisconnect:
        room["players"].remove(player_info)
        print(f"Player {username} left room {room_id}.")

        if len(room["players"]) == 0:
            del active_rooms[room_id]
            print(f"Room {room_id} is empty and has been destroyed.")
        else:
            # Reassign host if the leaving player was the host
            if room["host"] == username:
                room["host"] = room["players"][0]["username"]

            await broadcast_to_room(room_id, {
                "event": "player_left",
                "username": username,
                "new_host": room["host"],
                "total_players": len(room["players"]),
                "max_players": room["max_players"]
            })

async def broadcast_to_room(room_id: str, message: dict):
    if room_id in active_rooms:
        for player in active_rooms[room_id]["players"]:
            try:
                await player["websocket"].send_json(message)
            except Exception as e:
                print(f"Error broadcasting to player: {e}")