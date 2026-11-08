from datetime import datetime, timezone
from sqlalchemy import Float, ForeignKey, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

   # --- Global Profile Aggregates (Powered by Screenshot 3) ---
    tests_started: Mapped[int] = mapped_column(Integer, default=0)
    completed_tests: Mapped[int] = mapped_column(Integer, default=0)
    time_typing: Mapped[float] = mapped_column(Float, default=0.0)  # Total seconds typed
    
    highest_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    highest_raw_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    highest_acc: Mapped[float] = mapped_column(Float, default=0.0)
    highest_consistency: Mapped[float] = mapped_column(Float, default=0.0)

  # --- Mode-Specific Cached PBs: Time Modes (WPM, Raw, Acc, Consistency) ---
    pb_time_10_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_10_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_10_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_10_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    
    pb_time_20_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_20_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_20_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_20_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    
    pb_time_60_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_60_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_60_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_60_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    
    pb_time_100_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_100_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_100_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_time_100_consistency: Mapped[float] = mapped_column(Float, default=0.0)

    # --- Mode-Specific Cached PBs: Word Modes (WPM, Raw, Acc, Consistency) ---
    pb_words_10_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_10_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_10_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_10_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    
    pb_words_35_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_35_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_35_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_35_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    
    pb_words_70_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_70_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_70_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_70_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    
    pb_words_100_wpm: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_100_raw: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_100_acc: Mapped[float] = mapped_column(Float, default=0.0)
    pb_words_100_consistency: Mapped[float] = mapped_column(Float, default=0.0)
    # Relationship: One user has many scores (with cascading deletes)
    scores: Mapped[list["TypingScore"]] = relationship("TypingScore", back_populates="user", cascade="all, delete-orphan")


class TypingScore(Base):
    __tablename__ = "typing_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # --- Core Performance Telemetry (Powered by Screenshot 3) ---
    wpm: Mapped[float] = mapped_column(Float, nullable=False)
    raw_wpm: Mapped[float] = mapped_column(Float, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    consistency: Mapped[float] = mapped_column(Float, nullable=True)
    time_elapsed: Mapped[float] = mapped_column(Float, nullable=False)
    
    # --- Detailed Character Breakdown (Powered by Screenshot 3's "chars" column) ---
    chars_correct: Mapped[int] = mapped_column(Integer, default=0)
    chars_incorrect: Mapped[int] = mapped_column(Integer, default=0)
    chars_extra: Mapped[int] = mapped_column(Integer, default=0)
    chars_missed: Mapped[int] = mapped_column(Integer, default=0)

    # --- Test Configuration & Leaderboard Filters (Powered by Screenshots 1 & 4) ---
    dataset: Mapped[str] = mapped_column(String(100), nullable=False, default="default", index=True)  # e.g., "default", "custom"
    language: Mapped[str] = mapped_column(String(50), nullable=False, default="english", index=True)  # e.g., english, spanish
    mode: Mapped[str] = mapped_column(String(50), nullable=False, index=True)                         # e.g., "time", "words"
    mode_info: Mapped[str] = mapped_column(String(50), nullable=False, index=True)                    # e.g., "10", "60", "100"
    tags: Mapped[str | None] = mapped_column(String(100), nullable=True)                            # e.g., custom tags[cite: 3]

    # Timestamp with index for activity heatmaps and leaderboard date filtering
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    # Relationship: Each score belongs to one user
    user: Mapped["User"] = relationship("User", back_populates="scores")