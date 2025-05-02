from pydantic import BaseModel, Field


class MusicGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt describing the music to generate")
    duration: float = Field(default=5.0, description="Duration of music in seconds", ge=1.0, le=30.0)
    temperature: float = Field(default=1.0, description="Sampling temperature", ge=0.0, le=2.0)


class MusicGenerationResponse(BaseModel):
    audio_path: str = Field(..., description="Path to the generated audio file")
    prompt: str = Field(..., description="Original prompt used for generation")