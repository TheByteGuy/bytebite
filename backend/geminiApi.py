from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

app = FastAPI()

class TTSRequest(BaseModel):
    text: str

@app.post("/tts")
async def tts_endpoint(req: TTSRequest):
    if not req.text:
        return JSONResponse(status_code=400, content={"error": "No text provided"})

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
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
            content={"error": f"TTS request failed: {e.response.status_code}, {e.response.text}"}
        )
    except Exception as e:
        print("TTS server error:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})
