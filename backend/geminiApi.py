from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# CORS setup (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "https://bytebite.vercel.app",        # your Vercel site
        "https://bytebite-bq4x.onrender.com", # your Render backend
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

# Run with:
# uvicorn geminiApi:app --reload
# To test, send a POST request to /generate with JSON body: {"prompt": "Your prompt here"}