# userprofile.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone, timedelta
from models import User, TypingScore
from db import get_db

router = APIRouter(prefix="/api/users", tags=["Profile"])

@router.get("/{username}/profile")
def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Completion Rate calculation
    completion_rate = 0
    if user.tests_started > 0:
        completion_rate = round((user.completed_tests / user.tests_started) * 100)

    # 2. Estimated Words Typed Calculation
    # Formula: total correct characters across all scores / 5
    estimated_words = db.query(func.coalesce(func.sum(TypingScore.chars_correct), 0))\
                        .filter(TypingScore.user_id == user.id).scalar() // 5

    # 3. All-Time Averages
    avg_stats = db.query(
        func.avg(TypingScore.wpm),
        func.avg(TypingScore.raw_wpm),
        func.avg(TypingScore.accuracy),
        func.avg(TypingScore.consistency)
    ).filter(TypingScore.user_id == user.id).first()

    avg_wpm = round(avg_stats[0] or 0)
    avg_raw = round(avg_stats[1] or 0)
    avg_acc = round(avg_stats[2] or 0)
    avg_cons = round(avg_stats[3] or 0)

    # 4. Recent 10 Tests Averages
    recent_scores = db.query(TypingScore)\
                      .filter(TypingScore.user_id == user.id)\
                      .order_by(desc(TypingScore.created_at))\
                      .limit(10).all()

    if recent_scores:
        recent_wpm = round(sum(s.wpm for s in recent_scores) / len(recent_scores))
        recent_raw = round(sum(s.raw_wpm for s in recent_scores) / len(recent_scores))
        recent_acc = round(sum(s.accuracy for s in recent_scores) / len(recent_scores))
        recent_cons = round(sum(s.consistency or 0 for s in recent_scores) / len(recent_scores))
    else:
        recent_wpm = recent_raw = recent_acc = recent_cons = 0

    # 5. Helper for Rank & Percentile calculation
    def get_rank_and_percentile(column_attr, user_val):
        if not user_val or user_val <= 0:
            return "-", "-"
        better_count = db.query(func.count(User.id)).filter(column_attr > user_val).scalar()
        total_users = db.query(func.count(User.id)).filter(column_attr > 0).scalar() or 1
        rank = better_count + 1
        pct = (rank / total_users) * 100
        
        suffix = "th" if 11 <= rank <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(rank % 10, "th")
        return f"{rank}{suffix}", f"Top {pct:.2f}%"

    # 6. PB Grids (Time & Word modes)
    time_modes = [10, 20, 60, 100]
    time_pbs = {}
    for sec in time_modes:
        wpm = getattr(user, f"pb_time_{sec}_wpm", 0.0) if hasattr(user, f"pb_time_{sec}_wpm") else 0.0
        raw = getattr(user, f"pb_time_{sec}_raw", 0.0) if hasattr(user, f"pb_time_{sec}_raw") else 0.0
        acc = getattr(user, f"pb_time_{sec}_acc", 0.0) if hasattr(user, f"pb_time_{sec}_acc") else 0.0
        cons = getattr(user, f"pb_time_{sec}_consistency", 0.0) if hasattr(user, f"pb_time_{sec}_consistency") else 0.0
        
        col = getattr(User, f"pb_time_{sec}_wpm", None)
        rank, pct = get_rank_and_percentile(col, wpm) if col else ("-", "-")
        time_pbs[sec] = {"wpm": wpm, "raw": raw, "acc": acc, "consistency": cons, "rank": rank, "percentile": pct}

    word_modes = [10, 35, 70, 100]
    word_pbs = {}
    for count in word_modes:
        wpm = getattr(user, f"pb_words_{count}_wpm", 0.0) if hasattr(user, f"pb_words_{count}_wpm") else 0.0
        raw = getattr(user, f"pb_words_{count}_raw", 0.0) if hasattr(user, f"pb_words_{count}_raw") else 0.0
        acc = getattr(user, f"pb_words_{count}_acc", 0.0) if hasattr(user, f"pb_words_{count}_acc") else 0.0
        cons = getattr(user, f"pb_words_{count}_consistency", 0.0) if hasattr(user, f"pb_words_{count}_consistency") else 0.0
        
        col = getattr(User, f"pb_words_{count}_wpm", None)
        rank, pct = get_rank_and_percentile(col, wpm) if col else ("-", "-")
        word_pbs[count] = {"wpm": wpm, "raw": raw, "acc": acc, "consistency": cons, "rank": rank, "percentile": pct}

    # 7. Heatmap logs
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=60)
    scores = db.query(TypingScore).filter(TypingScore.user_id == user.id, TypingScore.created_at >= thirty_days_ago).all()
    activity_map = {}
    for s in scores:
        d = s.created_at.strftime("%Y-%m-%d")
        activity_map[d] = activity_map.get(d, 0) + 1
    activity_days = [{"date": d, "tests_count": c} for d, c in activity_map.items()]

    return {
        "username": user.username,
        "created_at": user.created_at,
        "tests_started": user.tests_started,
        "completed_tests": user.completed_tests,
        "completion_rate": completion_rate,
        "time_typing": user.time_typing,
        "estimated_words_typed": estimated_words,
        "highest_wpm": round(user.highest_wpm),
        "highest_raw_wpm": round(user.highest_raw_wpm),
        "highest_acc": round(user.highest_acc),
        "highest_consistency": round(user.highest_consistency),
        "avg_wpm": avg_wpm,
        "avg_raw_wpm": avg_raw,
        "avg_acc": avg_acc,
        "avg_consistency": avg_cons,
        "recent_10_avg_wpm": recent_wpm,
        "recent_10_avg_raw": recent_raw,
        "recent_10_avg_acc": recent_acc,
        "recent_10_avg_cons": recent_cons,
        "pbs": {
            "time": time_pbs,
            "words": word_pbs
        },
        "activity_days": activity_days
    }