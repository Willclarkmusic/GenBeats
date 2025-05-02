import os
import uuid
import torch
import numpy as np
import subprocess
from transformers import AutoProcessor, MusicgenForConditionalGeneration

# Create output directory if it doesn't exist
AUDIO_OUTPUT_DIR = "audio_output"
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)


class MusicGeneratorService:
    def __init__(self, model_size="medium"):
        """
        Initialize the MusicGen model service

        Args:
            model_size: Size of MusicGen model to use ('small', 'medium', or 'large')
        """
        # Choose model based on size parameter
        model_map = {
            "small": "facebook/musicgen-small",
            "medium": "facebook/musicgen-medium",
            "large": "facebook/musicgen-large"
        }

        model_name = model_map.get(model_size, "facebook/musicgen-medium")

        # Check for GPU availability
        if torch.cuda.is_available():
            self.device = "cuda"
            print(f"Using GPU: {torch.cuda.get_device_name()}")
            # Print available GPU memory
            total_mem = torch.cuda.get_device_properties(0).total_memory / 1024 ** 3  # in GB
            print(f"Total GPU memory: {total_mem:.2f} GB")
        else:
            self.device = "cpu"
            print("No GPU detected, using CPU (generation will be slow)")

        # Load the MusicGen model through transformers
        print(f"Loading MusicGen {model_size} model... this might take a moment on first run")

        # For large models, use lower precision to fit in GPU memory
        if model_size == "large" and self.device == "cuda":
            print("Using float16 precision for large model")
            self.model = MusicgenForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"  # Auto-optimize memory usage
            )
        else:
            self.model = MusicgenForConditionalGeneration.from_pretrained(model_name)
            self.model.to(self.device)

        self.processor = AutoProcessor.from_pretrained(model_name)
        self.sample_rate = 32000  # MusicGen sample rate

        print(f"Model loaded on {self.device}")

        # Check if FFmpeg is available
        try:
            subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print("FFmpeg detected and available")
        except FileNotFoundError:
            print("WARNING: FFmpeg not found. Please install FFmpeg for proper audio conversion.")

    def generate_music(self, prompt: str, duration: float = 5.0, temperature: float = 1.0):
        """
        Generate music based on a text prompt

        Args:
            prompt: Text description of the music
            duration: Duration in seconds (1-30)
            temperature: Controls randomness (0-2)

        Returns:
            Path to the generated audio file
        """
        # Ensure duration is in a reasonable range
        duration = max(1.0, min(30.0, duration))

        print(f"Generating music for prompt: '{prompt}' with duration: {duration}s")

        try:
            # Clear CUDA cache if using GPU
            if self.device == "cuda":
                torch.cuda.empty_cache()

            # Process the input prompt
            inputs = self.processor(
                text=[prompt],
                padding=True,
                return_tensors="pt",
            ).to(self.device)

            # Calculate appropriate max_new_tokens based on duration
            max_new_tokens = int(duration * 50)

            # Generate the audio
            with torch.no_grad():
                audio_values = self.model.generate(
                    **inputs,
                    do_sample=True,
                    guidance_scale=3.0,
                    temperature=temperature,
                    max_new_tokens=max_new_tokens,
                )

            # Convert to numpy array
            audio_data = audio_values[0].cpu().numpy()

            # Create unique filenames
            temp_id = str(uuid.uuid4())
            temp_raw_filepath = os.path.join(AUDIO_OUTPUT_DIR, f"temp_raw_{temp_id}.raw")
            final_filepath = os.path.join(AUDIO_OUTPUT_DIR, f"{temp_id}.wav")

            # Save raw PCM data first
            with open(temp_raw_filepath, 'wb') as f:
                # Normalize if needed
                audio_data = np.nan_to_num(audio_data)  # Replace NaN with zeros

                # Convert to 32-bit float raw PCM
                raw_data = (audio_data.astype(np.float32)).tobytes()
                f.write(raw_data)

            # Use FFmpeg to convert the raw PCM to WAV
            ffmpeg_cmd = [
                "ffmpeg",
                "-y",  # Overwrite output file if it exists
                "-f", "f32le",  # 32-bit float PCM
                "-ar", str(self.sample_rate),  # Sample rate
                "-ac", "1",  # 1 channel (mono)
                "-i", temp_raw_filepath,  # Input file
                "-acodec", "pcm_s16le",  # Convert to 16-bit PCM
                final_filepath  # Output file
            ]

            # Run FFmpeg command
            print(f"Running FFmpeg to convert audio...")
            result = subprocess.run(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )

            # Clean up temporary raw file
            if os.path.exists(temp_raw_filepath):
                os.remove(temp_raw_filepath)

            print(f"Music generated and saved to {final_filepath}")
            return final_filepath

        except torch.cuda.OutOfMemoryError:
            print("GPU out of memory! Try using a smaller model or reducing duration")
            # Optionally fall back to CPU if GPU fails
            if self.device == "cuda":
                print("Attempting to fall back to CPU...")
                self.model.to("cpu")
                self.device = "cpu"
                return self.generate_music(prompt, duration, temperature)
            else:
                raise
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
            raise
        except Exception as e:
            print(f"Error in music generation: {e}")
            raise