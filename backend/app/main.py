from dotenv import load_dotenv
import os

# Load environment variables first
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, projects, generate, export

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {"status": "ok", "vercel": os.getenv("VERCEL"), "db_url": str(engine.url)}

# Initialize FastAPI app
app = FastAPI(
    title="AI Document Generation API",
    description="API for generating and refining Word and PowerPoint documents using AI",
    version="1.0.0",
    root_path="/api" if os.getenv("VERCEL") else ""
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(generate.router)
app.include_router(export.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Document Generation API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
