from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Dict, Any, List, Optional

# ==========================================
# 1. User Authentication & Registration Schemas
# ==========================================

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username for leaderboards")
    email: EmailStr = Field(..., description="Valid email address for account recovery")
    password: str = Field(..., min_length=6, description="Plaintext password to be hashed")

class UserLogin(BaseModel):
    email: str
    password: str

# ==========================================
# 2. User Profile & Response Schema
# ==========================================

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    # Global Aggregates
    tests_started: int
    completed_tests: int
    time_typing: float
    highest_wpm: float
    highest_raw_wpm: float
    highest_acc: float
    highest_consistency: float

    # Mode-Specific Cached PBs (Time Modes)
    pb_time_10_wpm: float
    pb_time_10_raw: float
    pb_time_10_acc: float
    pb_time_10_consistency: float
    
    pb_time_20_wpm: float
    pb_time_20_raw: float
    pb_time_20_acc: float
    pb_time_20_consistency: float
    
    pb_time_60_wpm: float
    pb_time_60_raw: float
    pb_time_60_acc: float
    pb_time_60_consistency: float
    
    pb_time_100_wpm: float
    pb_time_100_raw: float
    pb_time_100_acc: float
    pb_time_100_consistency: float

    # Mode-Specific Cached PBs (Word Modes)
    pb_words_10_wpm: float
    pb_words_10_raw: float
    pb_words_10_acc: float
    pb_words_10_consistency: float
    
    pb_words_35_wpm: float
    pb_words_35_raw: float
    pb_words_35_acc: float
    pb_words_35_consistency: float
    
    pb_words_70_wpm: float
    pb_words_70_raw: float
    pb_words_70_acc: float
    pb_words_70_consistency: float
    
    pb_words_100_wpm: float
    pb_words_100_raw: float
    pb_words_100_acc: float
    pb_words_100_consistency: float

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. Typing Test Score Telemetry Schemas
# ==========================================

class ScoreCreate(BaseModel):
    model_config = ConfigDict(coerce_numbers_to_str=True)

    wpm: float = Field(..., ge=0.0, description="Words per minute")
    raw_wpm: float = Field(..., ge=0.0, description="Raw words per minute without error penalties")
    accuracy: float = Field(..., ge=0.0, le=100.0, description="Accuracy percentage (0-100)")
    consistency: float | None = Field(None, ge=0.0, le=100.0, description="Consistency metric")
    time_elapsed: float = Field(..., ge=0.0, description="Time elapsed during the test in seconds")
    
    # Character breakdown
    chars_correct: int = Field(..., ge=0)
    chars_incorrect: int = Field(..., ge=0)
    chars_extra: int = Field(..., ge=0)
    chars_missed: int = Field(..., ge=0)
    
    # Configuration metadata
    dataset: str = Field(..., max_length=100, description="Dataset used for the typing test")
    language: str = Field(default="english", max_length=50)
    mode: str = Field(..., max_length=50, description="e.g., 'time', 'words'")
    mode_info: str = Field(..., max_length=50, description="e.g., '10', '60', '100'")
    tags: str | None = Field(None, max_length=100)

class ScoreResponse(ScoreCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeaderboardEntryResponse(BaseModel):
    user_id: int
    username: str
    wpm: float
    accuracy: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. User Dashboard Profile Schemas
# ==========================================

class StatDetail(BaseModel):
    wpm: float
    raw: float
    acc: float
    consistency: float
    rank: str
    percentile: str

class ActivityDay(BaseModel):
    date: str
    tests_count: int

class UserProfileResponse(BaseModel):
    username: str
    created_at: datetime
    tests_started: int
    completed_tests: int
    time_typing: float
    pbs: Dict[str, Dict[int, StatDetail]]
    activity_days: List[ActivityDay]

    model_config = ConfigDict(from_attributes=True)