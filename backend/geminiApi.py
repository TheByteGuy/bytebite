from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
import os
import httpx

# Load environment variables
load_dotenv()

ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

app = FastAPI()

# CORS setup (applies to all responses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict to your frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/tts")
async def tts_endpoint(req: Request):
    try:
        data = await req.json()
        text = data.get("text")
        if not text:
            return JSONResponse(status_code=400, content={"error": "No text provided"})

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
                return JSONResponse(
                    status_code=502,
                    content={"error": f"TTS request failed: {r.status_code}, {r.text}"}
                )

            # streaming bytes directly
            return StreamingResponse(
                r.aiter_bytes(),
                media_type="audio/mpeg"
            )

    except httpx.RequestError as e:
        return JSONResponse(
            status_code=502,
            content={"error": f"Network error contacting ElevenLabs: {str(e)}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"TTS server error: {str(e)}"}
        )
