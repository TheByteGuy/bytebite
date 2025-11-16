from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os
import httpx

# Load .env
load_dotenv()

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # pick preferred voice

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://bytebites.tech",
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "https://bytebite.vercel.app",
        "https://bytebite-615j.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_content(request: PromptRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=request.prompt,
        )
        return {"text": response.text}
    except Exception as e:
        return {"error": str(e)}

# -------------------- New TTS endpoint --------------------
@app.post("/tts")
async def tts_endpoint(req: Request):
    try:
        data = await req.json()
        text = data.get("text")
        if not text:
            return {"error": "No text provided"}

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream"
        headers = {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
        }

        async with httpx.AsyncClient(timeout=None) as client:
            r = await client.post(url, headers=headers, json=payload)
            if r.status_code != 200:
                return {"error": f"TTS request failed: {r.status_code}, {r.text}"}

            # StreamingResponse with explicit CORS headers
            return StreamingResponse(
                r.aiter_bytes(),
                media_type="audio/mpeg",
                headers={"Access-Control-Allow-Origin": "*"}
            )

    except Exception as e:
        return {"error": f"TTS server error: {str(e)}"}
