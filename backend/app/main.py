# main.py - FastAPI Backend for PPT Maker
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai
import os
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

# OpenAI API configuration (optional - for AI generation)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Models
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

# AI Generation endpoint
@app.post("/api/generate", response_model=GenerateResponse)
async def generate_presentation(request: GenerateRequest):
    """
    Generate presentation slides using AI (OpenAI GPT)
    Falls back to template-based generation if API key not configured
    """
    
    # Check if OpenAI API key is available
    if openai.api_key:
        try:
            # Use OpenAI to generate slides
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a presentation expert. Generate presentation slides in JSON format.
                        Each slide should have: title (string), content (string with bullet points using \n), layout (title/content/image).
                        Return ONLY a JSON array of slides, no other text."""
                    },
                    {
                        "role": "user",
                        "content": f"Create {request.num_slides} slides about: {request.prompt}"
                    }
                ],
                temperature=0.7
            )
            
            # Parse AI response
            import json
            slides_data = json.loads(response.choices[0].message.content)
            slides = [Slide(**slide) for slide in slides_data]
            
        except Exception as e:
            print(f"OpenAI Error: {e}")
            # Fallback to template generation
            slides = generate_template_slides(request.prompt, request.num_slides)
    else:
        # Use template-based generation
        slides = generate_template_slides(request.prompt, request.num_slides)
    
    return GenerateResponse(slides=slides)

def generate_template_slides(topic: str, num_slides: int) -> List[Slide]:
    """
    Generate slides using predefined templates
    """
    slides = []
    
    # Title slide
    slides.append(Slide(
        title=topic.title(),
        content="An AI-generated presentation",
        layout="title"
    ))
    
    # Content slides
    templates = [
        {
            "title": "Introduction",
            "content": f"• Overview of {topic}\n• Key concepts\n• Importance and relevance\n• What we'll cover"
        },
        {
            "title": "Key Points",
            "content": "• Main idea 1\n• Main idea 2\n• Main idea 3\n• Supporting details"
        },
        {
            "title": "Analysis",
            "content": "• Current state\n• Challenges\n• Opportunities\n• Best practices"
        },
        {
            "title": "Benefits",
            "content": "• Advantage 1\n• Advantage 2\n• Advantage 3\n• Long-term value"
        },
        {
            "title": "Implementation",
            "content": "• Step 1: Planning\n• Step 2: Execution\n• Step 3: Monitoring\n• Step 4: Optimization"
        },
        {
            "title": "Case Studies",
            "content": "• Example 1\n• Example 2\n• Success metrics\n• Lessons learned"
        },
        {
            "title": "Next Steps",
            "content": "• Action items\n• Timeline\n• Resources needed\n• Expected outcomes"
        },
        {
            "title": "Conclusion",
            "content": f"• Summary of {topic}\n• Key takeaways\n• Call to action\n• Thank you"
        }
    ]
    
    # Add slides based on num_slides
    for i in range(min(num_slides - 1, len(templates))):
        slides.append(Slide(**templates[i], layout="content"))
    
    return slides

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
            "/health": "GET - Health check"
        }
    }


# Alternative: Using Anthropic Claude instead of OpenAI
"""
from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def generate_with_claude(prompt: str, num_slides: int):
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": f"Create {num_slides} presentation slides about: {prompt}. Return JSON array with title, content, layout fields."
            }
        ]
    )
    return message.content[0].text
"""
