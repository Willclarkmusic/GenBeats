from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.endpoints import router as music_router

# Create FastAPI app
app = FastAPI(
    title="Music Generator API",
    description="API for generating music using MusicGen via HuggingFace Transformers",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(music_router, prefix="/api")

# Serve audio files statically 
os.makedirs("audio_output", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_output"), name="audio")


@app.get("/")
async def root():
    return {"message": "Welcome to the Music Generator API", "status": "online"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)