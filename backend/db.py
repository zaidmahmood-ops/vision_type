import os
from dotenv import  load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from the .env file

load_dotenv()

# Grab the database URL from the environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine configured for your Neon pooled connection
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Use NullPool for Neon pooled connections
)

# Create a session instance factory for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for your ORM models to inherit from
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 