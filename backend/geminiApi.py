from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os
import httpx
from io import BytesIO

# ------------------- Load environment -------------------
load_dotenv()
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # preferred voice
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ------------------- Initialize Gemini client -------------------
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# ------------------- FastAPI app -------------------
app = FastAPI()

# ------------------- CORS -------------------
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://bytebites.tech",
    "https://bytebite.vercel.app",
    "https://bytebite-615j.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # use ["*"] to allow all during testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Models -------------------
class PromptRequest(BaseModel):
    prompt: str

class TTSRequest(BaseModel):
    text: str

# ------------------- Exception handlers -------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("Server error:", str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not Found"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

# ------------------- Gemini endpoint -------------------
@app.post("/generate")
async def generate_content(req: PromptRequest):
    try:
        # Make sure to use async if your Gemini SDK supports it
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=req.prompt,
        )
        # If SDK returns differently, adjust this:
        text = getattr(response, "text", getattr(response, "output_text", str(response)))
        return {"text": text}
    except Exception as e:
        print("Gemini error:", str(e))
        return JSONResponse(
            status_code=502,
            content={"error": f"Gemini request failed: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "*"},
        )

# ------------------- TTS endpoint -------------------
@app.post("/tts")
async def tts_endpoint(req: TTSRequest):
    if not req.text:
        return JSONResponse(status_code=400, content={"error": "No text provided"})

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"  # regular endpoint
    headers = {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": req.text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.5},
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
            r = await client.post(url, json=payload, headers=headers)
            r.raise_for_status()

            print("TTS success:", r.status_code, "content length:", len(r.content))
            return StreamingResponse(BytesIO(r.content), media_type="audio/mpeg")

    except httpx.HTTPStatusError as e:
        print("TTS HTTP error:", e.response.status_code, e.response.text)
        return JSONResponse(
            status_code=502,
            content={"error": f"TTS request failed: {e.response.status_code}, {e.response.text}"},
            headers={"Access-Control-Allow-Origin": "*"},
        )
    except Exception as e:
        print("TTS server error:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)}, headers={"Access-Control-Allow-Origin": "*"})
