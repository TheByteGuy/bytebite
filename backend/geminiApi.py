from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os
import httpx

# ------------------- Load environment -------------------
load_dotenv()
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # preferred voice
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ------------------- Initialize clients -------------------
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# ------------------- FastAPI app -------------------
app = FastAPI()

# ------------------- CORS -------------------
origins = [
    "http://localhost:3000",
    "https://bytebites.tech",
    "http://localhost:5174",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "https://bytebite.vercel.app",
    "https://bytebite-615j.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Models -------------------
class PromptRequest(BaseModel):
    prompt: str

class TTSRequest(BaseModel):
    text: str

# ------------------- Global exception handler -------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )

# ------------------- Gemini endpoint -------------------
@app.post("/generate")
async def generate_content(request: PromptRequest):
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=request.prompt,
        )
        return {"text": response.text}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
            headers={"Access-Control-Allow-Origin": "*"},
        )

# ------------------- TTS endpoint -------------------
@app.post("/tts")
async def tts_endpoint(req: Request):
    try:
        data = await req.json()
        text = data.get("text")
        if not text:
            return JSONResponse(
                status_code=400,
                content={"error": "No text provided"},
                headers={"Access-Control-Allow-Origin": "*"},
            )

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream"
        headers = {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json",
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5},
        }

        # Use separate client for TTS
        async with httpx.AsyncClient(timeout=None) as tts_client:
            r = await tts_client.post(url, headers=headers, json=payload)
            if r.status_code != 200:
                return JSONResponse(
                    status_code=502,
                    content={
                        "error": f"TTS request failed: {r.status_code}, {r.text}"
                    },
                    headers={"Access-Control-Allow-Origin": "*"},
                )

            # Stream audio with CORS
            return StreamingResponse(
                r.aiter_bytes(),
                media_type="audio/mpeg",
                headers={"Access-Control-Allow-Origin": "*"},
            )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"TTS server error: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "*"},
        )
