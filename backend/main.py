
import time
from datetime import datetime, timezone
from sqlalchemy import select
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from security import SECRET_KEY, ALGORITHM
import jwt  # 👈 Add this line to the top imports of main.py
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pvp import router as pvp_router
from userprofile import router as profile_router


from db import engine, get_db
import models, schemas
from security import hash_password, verify_password, create_access_token

# Automatically create database tables if they don't exist yet 
# (Note: In larger production setups, Alembic migrations are typically used, but this handles quick bootstrapping)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisionType API",
    description="Professional high-performance typing test SPA backend",
    version="1.0.0"
)

app.include_router(pvp_router)
app.include_router(profile_router)
# ==========================================
# CORS CONFIGURATION (Vercel & Localhost)
# ==========================================
origins = [
    "http://localhost:5173",          # Local Vite frontend dev server
    "https://vision-type.vercel.app",   # Your future Vercel deployment URL (update this later!)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Explicitly allows your frontend domains
    allow_credentials=True,
    allow_methods=["*"],               # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],               # Allows all headers (Authorization, Content-Type, etc.)
)

# ==========================================
# ROOT HEALTH CHECK ENDPOINT
# ==========================================
@app.get("/")
def read_root():
    return {"status": "online", "message": "Welcome to the VisionType API!"}


# ==========================================
# 1. USER REGISTRATION ENDPOINT
# ==========================================
@app.post("/api/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if a user with this email or username already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user_in.email) | (models.User.username == user_in.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username or email already exists."
        )

    # TODO: Hash password securely using passlib/bcrypt before saving!
    # For now, we simulate a secure placeholder hash string:
    hashed_password_placeholder = f"hashed_{user_in.password}"

    # Create new user model instance
    db_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password_placeholder
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Pydantic's UserResponse schema automatically serializes the database object to JSON
    return db_user

# ==========================================
# 1.5. USER LOGIN ENDPOINT
# ==========================================

@app.post("/api/login")
def login_user(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Look up user by matching either email or username against the input
    user = db.query(models.User).filter(
        (models.User.email == form_data.email) | (models.User.username == form_data.email)
    ).first()

    if not user or user.hashed_password != f"hashed_{form_data.password}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a JWT access token for the user session
    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }


# ==========================================
# 2. TYPING TEST SCORE TELEMETRY ENDPOINT
# ==========================================

security_scheme = HTTPBearer()

# 1. Define the dependency function first
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/scores", response_model=schemas.ScoreResponse, status_code=status.HTTP_201_CREATED)
def submit_score(
    score_in: schemas.ScoreCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # This is already a live database user model!
):
    # 1. Create new score model instance
    db_score = models.TypingScore(
        user_id=current_user.id,  # Assigns the true database user ID
        wpm=score_in.wpm,
        raw_wpm=score_in.raw_wpm,
        accuracy=score_in.accuracy,
        consistency=score_in.consistency,
        dataset=score_in.dataset,
        time_elapsed=score_in.time_elapsed,
        chars_correct=score_in.chars_correct,
        chars_incorrect=score_in.chars_incorrect,
        chars_extra=score_in.chars_extra,
        chars_missed=score_in.chars_missed,
        language=score_in.language,
        mode=score_in.mode,
        mode_info=score_in.mode_info,
        tags=score_in.tags
    )

    db.add(db_score)

    # 2. UPDATE THE USER PROFILE DIRECTLY (SQLAlchemy watches these changes automatically!)
    current_user.completed_tests += 1
    current_user.time_typing += score_in.time_elapsed

    # Update global lifetime records
    if score_in.wpm > current_user.highest_wpm:
        current_user.highest_wpm = float(score_in.wpm)
    if score_in.raw_wpm > current_user.highest_raw_wpm:
        current_user.highest_raw_wpm = float(score_in.raw_wpm)
    if score_in.accuracy > current_user.highest_acc:
        current_user.highest_acc = float(score_in.accuracy)
    if score_in.consistency > current_user.highest_consistency:
        current_user.highest_consistency = float(score_in.consistency)

    # 3. DYNAMICALLY UPDATE MODE-SPECIFIC PERSONAL BESTS
    valid_time_limits = ['10', '20', '60', '100']
    valid_word_limits = ['10', '35', '70', '100']

    mode_type = score_in.mode       # e.g., "time" or "words"
    limit = score_in.mode_info      # e.g., integer 60

    is_valid_time = (mode_type == "time" and limit in valid_time_limits)
    is_valid_words = (mode_type == "words" and limit in valid_word_limits)

    if is_valid_time or is_valid_words:
        prefix = f"pb_{mode_type}_{limit}"
        
        wpm_attr = f"{prefix}_wpm"
        raw_attr = f"{prefix}_raw"
        acc_attr = f"{prefix}_acc"
        cons_attr = f"{prefix}_consistency"

        current_pb_wpm = getattr(current_user, wpm_attr, 0.0)

        if score_in.wpm > current_pb_wpm:
            setattr(current_user, wpm_attr, float(score_in.wpm))
            setattr(current_user, raw_attr, float(score_in.raw_wpm))
            setattr(current_user, acc_attr, float(score_in.accuracy))
            setattr(current_user, cons_attr, float(score_in.consistency))

    # 4. Commit everything together (saves both the new score AND the updated user profile)
    db.commit()
    db.refresh(db_score)
    db.refresh(current_user)
    
    return db_score

# ==========================================
# 4. LEADERBOARD ENDPOINT (USING USER PB COLUMNS)
# ==========================================

LEADERBOARD_CACHE = {}
CACHE_TTL_SECONDS = 300

@app.get("/api/leaderboard", response_model=List[schemas.LeaderboardEntryResponse])
def get_leaderboard(
    mode: str = Query("time", description="Category: 'time' or 'words'"),
    mode_info: str = Query("60", description="Duration or word count"),
    db: Session = Depends(get_db)
):
    current_time = time.time()
    cache_key = (mode, mode_info)

    # 1. Check server-side cache
    if cache_key in LEADERBOARD_CACHE:
        last_fetched, cached_data = LEADERBOARD_CACHE[cache_key]
        if current_time - last_fetched < CACHE_TTL_SECONDS:
            return cached_data

    # 2. Dynamically construct the column name based on frontend filters
    # e.g., "pb_time_60_wpm", "pb_words_35_wpm"
    wpm_column_name = f"pb_{mode}_{mode_info}_wpm"
    acc_column_name = f"pb_{mode}_{mode_info}_acc"

    # Ensure the column actually exists on the User model to prevent crashes
    if not hasattr(models.User, wpm_column_name):
        raise HTTPException(status_code=400, detail="Invalid mode or mode_info combination")

    wpm_column = getattr(models.User, wpm_column_name)
    acc_column = getattr(models.User, acc_column_name)

    # 3. Query the User table directly! 
    # We only want users who actually have a score greater than 0 for this mode
    stmt = (
        select(
            models.User.id.label("user_id"),
            models.User.username,
            wpm_column.label("wpm"),
            acc_column.label("accuracy"),
            models.User.updated_at.label("created_at") # or last active timestamp
        )
        .where(wpm_column > 0.0)
        .order_by(wpm_column.desc())
        .limit(100)
    )

    results = db.execute(stmt).all()

    formatted_leaderboard = [
        {
            "user_id": row.user_id,
            "username": row.username,
            "wpm": round(row.wpm, 1),
            "accuracy": round(row.accuracy, 1),
            "created_at": row.created_at or datetime.utcnow()
        }
        for row in results
    ]

    # 4. Save to cache
    LEADERBOARD_CACHE[cache_key] = (current_time, formatted_leaderboard)

    return formatted_leaderboard