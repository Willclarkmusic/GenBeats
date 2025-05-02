from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import os
from enum import Enum
from typing import Optional

from app.models.music_requests import MusicGenerationRequest, MusicGenerationResponse
from app.services.music_generator import MusicGeneratorService


class ModelSize(str, Enum):
    small = "small"
    medium = "medium"
    large = "large"


# Initialize with medium model, can be changed via API endpoint
model_size = "medium"
music_generator = MusicGeneratorService(model_size=model_size)

router = APIRouter()


@router.post("/generate", response_model=MusicGenerationResponse)
async def generate_music(request: MusicGenerationRequest):
    """
    Generate music based on a prompt and parameters
    """
    try:
        audio_path = music_generator.generate_music(
            prompt=request.prompt,
            duration=request.duration,
            temperature=request.temperature
        )

        # Extract just the filename for the response
        filename = os.path.basename(audio_path)

        return MusicGenerationResponse(
            audio_path=filename,
            prompt=request.prompt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Retrieve a generated audio file
    """
    file_path = os.path.join("audio_output", filename)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(
        path=file_path,
        media_type="audio/wav",
        filename=filename
    )


@router.post("/set-model")
async def set_model_size(size: ModelSize):
    """
    Change the model size (requires reloading the model)
    """
    global music_generator
    global model_size

    try:
        # Only create a new instance if we're changing the model
        if size.value != model_size:
            print(f"Changing model from {model_size} to {size.value}")
            model_size = size.value
            music_generator = MusicGeneratorService(model_size=model_size)

        return {"status": "success", "model": size.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error setting model size: {str(e)}")