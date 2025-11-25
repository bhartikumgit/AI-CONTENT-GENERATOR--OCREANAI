from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Vercel specific: Use /tmp for SQLite because other dirs are read-only
if os.getenv("VERCEL"):
    DATABASE_URL = "sqlite:////tmp/app.db"

# Ensure directory exists
if "sqlite" in DATABASE_URL:
    db_path = DATABASE_URL.replace("sqlite:///", "")
    # Handle absolute paths (start with /)
    if db_path.startswith("/"):
        db_path = db_path  # It's already absolute
    else:
        db_path = os.path.abspath(db_path)
    
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
