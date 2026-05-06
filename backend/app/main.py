# main.py - FastAPI Backend for PPT Maker
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import re
import shutil
import subprocess
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PPT Maker API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local Ollama config
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")
OLLAMA_PROMPT_TEMPLATE = os.getenv(
    "OLLAMA_PROMPT_TEMPLATE",
    "You are a presentation expert. Generate presentation slides in JSON format."
)

# OpenAI config (optional)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = bool(os.getenv("OPENAI_API_KEY"))
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if OPENAI_AVAILABLE else None
except Exception:
    OpenAI = None
    openai_client = None
    OPENAI_AVAILABLE = False


class Slide(BaseModel):
    title: str
    content: str
    layout: str = "content"
    theme: str = "gradient-blue"


class GenerateRequest(BaseModel):
    prompt: str
    num_slides: Optional[int] = 5


class GenerateResponse(BaseModel):
    slides: List[Slide]
    info: Optional[str] = None


def is_ollama_available() -> bool:
    return shutil.which("ollama") is not None


def get_default_ollama_model() -> Optional[str]:
    if OLLAMA_MODEL:
        return OLLAMA_MODEL
    if not is_ollama_available():
        return None

    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=True,
        )
        lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        if len(lines) > 1:
            return lines[1].split()[0]
    except Exception:
        return None

    return None


OLLAMA_MODEL = get_default_ollama_model()


def strip_ansi(text: str) -> str:
    return re.sub(r"\x1B[@-_][0-?]*[ -/]*[@-~]", "", text)


def extract_json(text: str):
    text = strip_ansi(text)
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```", "", text)

    decoder = json.JSONDecoder()
    for match in re.finditer(r"[\{\[]", text):
        try:
            obj, _ = decoder.raw_decode(text[match.start():])
            return obj
        except json.JSONDecodeError:
            continue
    return None


def flatten_content(content) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, (int, float, bool)):
        return str(content)
    if isinstance(content, list):
        parts = [flatten_content(item) for item in content]
        return "\n".join([part for part in parts if part])
    if isinstance(content, dict):
        if "text" in content:
            return flatten_content(content["text"])
        if "items" in content:
            return flatten_content(content["items"])
        return "\n".join([flatten_content(value) for value in content.values() if value is not None])
    return str(content)


def normalize_slide(slide_data) -> Slide:
    if isinstance(slide_data, str):
        return Slide(title=slide_data[:50], content=slide_data)

    if not isinstance(slide_data, dict):
        raise ValueError("Unsupported slide data format")

    title = slide_data.get("title") or slide_data.get("heading") or slide_data.get("name") or "Untitled Slide"
    content = slide_data.get("content") or slide_data.get("body") or ""
    content = flatten_content(content)

    return Slide(title=title, content=content)


def generate_with_ollama(prompt: str, num_slides: int, model: str) -> List[Slide]:
    full_prompt = (
        f"{OLLAMA_PROMPT_TEMPLATE} Each slide should have: title (string), content (string with bullet points using \\n),"
        f" layout (title/content/image), theme (optional). Return ONLY a JSON array of slides, no other text. "
        f"Create {num_slides} slides about: {prompt}"
    )

    result = subprocess.run(
        ["ollama", "run", model, "--format", "json", "--nowordwrap", full_prompt],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=True,
    )

    parsed = extract_json(result.stdout)
    if parsed is None:
        parsed = extract_json(result.stderr)
    if parsed is None:
        raise ValueError("Ollama did not return valid JSON")

    if isinstance(parsed, dict) and "slides" in parsed and isinstance(parsed["slides"], list):
        slides_data = parsed["slides"]
    elif isinstance(parsed, list):
        slides_data = parsed
    elif isinstance(parsed, dict) and "title" in parsed and "content" in parsed:
        slides_data = [parsed]
    else:
        # Support responses like {"slide1": {...}, "slide2": {...}}
        slides_data = [value for key, value in parsed.items() if isinstance(value, dict)]

    if not slides_data:
        raise ValueError("Ollama returned JSON but no slide data was found")

    return [normalize_slide(slide) for slide in slides_data]


def generate_with_openai(prompt: str, num_slides: int) -> List[Slide]:
    if not OPENAI_AVAILABLE or openai_client is None:
        raise RuntimeError("OpenAI client is unavailable")

    try:
        response = openai_client.responses.create(
            model="gpt-3.5-turbo",
            input=[
                {"role": "system", "content": "You are a presentation expert. Generate presentation slides in JSON format."},
                {"role": "user", "content": f"Create {num_slides} slides about: {prompt}"}
            ],
            temperature=0.7,
        )
        text = getattr(response, "output_text", None) or str(response)
    except Exception:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a presentation expert. Generate presentation slides in JSON format."},
                {"role": "user", "content": f"Create {num_slides} slides about: {prompt}"}
            ],
            temperature=0.7,
        )
        text = getattr(response.choices[0].message, "content", None) or str(response.choices[0].message)

    parsed = extract_json(text)
    if parsed is None:
        raise ValueError("OpenAI did not return valid JSON")

    if isinstance(parsed, dict) and "slides" in parsed and isinstance(parsed["slides"], list):
        slides_data = parsed["slides"]
    elif isinstance(parsed, list):
        slides_data = parsed
    elif isinstance(parsed, dict) and "title" in parsed and "content" in parsed:
        slides_data = [parsed]
    else:
        slides_data = [value for key, value in parsed.items() if isinstance(value, dict)]

    if not slides_data:
        raise ValueError("OpenAI returned JSON but no slide data was found")

    return [normalize_slide(slide) for slide in slides_data]


def generate_template_slides(topic: str, num_slides: int) -> List[Slide]:
    slides = [
        Slide(
            title=topic.title(),
            content="An AI-generated presentation",
            layout="title",
        )
    ]

    templates = [
        {
            "title": "Introduction",
            "content": f"* Overview of {topic}\n* Key concepts\n* Importance and relevance\n* What we'll cover"
        },
        {
            "title": "Key Points",
            "content": "* Main idea 1\n* Main idea 2\n* Main idea 3\n* Supporting details"
        },
        {
            "title": "Analysis",
            "content": "* Current state\n* Challenges\n* Opportunities\n* Best practices"
        },
        {
            "title": "Benefits",
            "content": "* Advantage 1\n* Advantage 2\n* Advantage 3\n* Long-term value"
        },
        {
            "title": "Implementation",
            "content": "* Step 1: Planning\n* Step 2: Execution\n* Step 3: Monitoring\n* Step 4: Optimization"
        },
        {
            "title": "Case Studies",
            "content": "* Example 1\n* Example 2\n* Success metrics\n* Lessons learned"
        },
        {
            "title": "Next Steps",
            "content": "* Action items\n* Timeline\n* Resources needed\n* Expected outcomes"
        },
        {
            "title": "Conclusion",
            "content": f"* Summary of {topic}\n* Key takeaways\n* Call to action\n* Thank you"
        }
    ]

    for i in range(min(num_slides - 1, len(templates))):
        slides.append(Slide(**templates[i], layout="content"))

    return slides


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_presentation(request: GenerateRequest):
    """Generate presentation slides using Ollama, OpenAI, or a local template fallback."""

    slides = None
    info = None

    if OLLAMA_MODEL and is_ollama_available():
        try:
            slides = generate_with_ollama(request.prompt, request.num_slides, OLLAMA_MODEL)
        except Exception as e:
            info = f"Ollama generation failed, falling back to another source: {e}"
            print(info)

    if slides is None and OPENAI_AVAILABLE and openai_client is not None:
        try:
            slides = generate_with_openai(request.prompt, request.num_slides)
        except Exception as e:
            fallback_message = f"OpenAI generation failed, falling back to local template: {e}"
            print(fallback_message)
            if info is None:
                info = fallback_message

    if slides is None:
        slides = generate_template_slides(request.prompt, request.num_slides)
        if info is None:
            info = "Using local template fallback because AI generation was unavailable."

    if not slides:
        raise HTTPException(status_code=500, detail="No slides could be generated.")

    return GenerateResponse(slides=slides, info=info)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "PPT Maker API is running"}


@app.get("/")
async def root():
    return {
        "message": "PPT Maker API",
        "version": "1.0.0",
        "endpoints": {
            "/api/generate": "POST - Generate presentation slides",
            "/health": "GET - Health check",
        },
    }
