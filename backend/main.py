from fastapi import FastAPI, HTTPException, UploadFile, File, Form,Request
from fastapi.middleware.cors import CORSMiddleware
import ollama
from pydantic import BaseModel
import json
import re
# from pptx import Presentation 
import fitz  # PyMuPDF for PDF extraction
import requests
from typing import List

app = FastAPI()
client = ollama.Client()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests only from your React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

model = "mistral"

class RequestData(BaseModel):
    prompt: str


def clean_text(text):
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces/newlines with a single space
    text = text.strip()  # Remove leading/trailing spaces
    return text

def format_text(text):
    lines = text.split("\n")
    formatted_text = []
    for line in lines:
        line = line.strip()
        if line.startswith("•") or line.startswith("-"):  # Bullet points
            formatted_text.append(f"\n- {line[1:].strip()}")
        elif line.isupper():  # Assuming uppercase lines are headings
            formatted_text.append(f"\n\n{line}\n{'=' * len(line)}")
        else:
            formatted_text.append(line)
    return " ".join(formatted_text)

async def extract_text_from_pdf(file: UploadFile):
    file_content = await file.read()  # Read file content
    try:
        doc = fitz.open(stream=file_content, filetype="pdf")  # Open PDF
        text = "\n".join([page.get_text("text") for page in doc])  # Extract text
        formatted_text = clean_text(text)  # Apply text cleaning
        formatted_text = format_text(formatted_text) 
        return formatted_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    text =await extract_text_from_pdf(file)
    print(text)
    prompt = f""" [INST] <<SYS>>
    IMPORTANT:You MUST respond with ONLY valid JSON in the EXACT format specified below. 
    DO NOT include any additional text, explanations, or markdown formatting.
    
    Generate exactly 5 multiple-choice questions (MCQs) based on the following text.
    Ensure that:
    1. Each question is directly based on facts from the text.
    2. Each question has exactly four options.
    3. The correct answer is one of the four options.
    4. Irrelevant or generic questions (e.g., about page numbers, authors) are NOT included.
    5.Each question must have 4 options and one correct answer.
    6. The correct answer must be from the given options.

    Required JSON format:
    {{
        "questions": [
            {{
                "question": "Your question here",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"], 
                "correct_answer": "Correct option" 
            }},
            // Repeat for 5 questions total
        ]
    }}
    <</SYS>>

    Generate 5 MCQs using:
    1. The provided text (for context)
    2. Your own knowledge (to enhance questions if needed)
    Text to base questions on:
    {text}
    [/INST]"""

    response = client.generate(
        model=model,
        prompt=prompt,
        format="json",  # Explicitly request JSON format
        options={
            "temperature": 0.3,  # Lower for more structured output
            "top_p": 0.9,
            "num_ctx": 8192  # Fixed seed for reproducibility
            }
        )
    print("Repsonse",response)
    mcq_data = response['response'].strip()

    mcq_json= json.loads(mcq_data)

    if not mcq_json:
        raise HTTPException(status_code=400, detail="Invalid JSON format from AI model")

    return {
        "message": "MCQs generated successfully",
        "data": mcq_json
    }

GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZPA8FmhibQuS8oNNwJlonxWZ_8Cef1Kj8CG2k3TlUZyeP4EjAhzyktE7IowcOJ-MpFQ/exec"
class Question(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class QuizRequest(BaseModel):
    questions: List[Question]

@app.post("/generate-form")
async def generate_form(quiz: QuizRequest):
    try:
        # Send data exactly as Google Script expects it
        payload = {"questions": [q.dict() for q in quiz.questions]}
        
        response = requests.post(
            GOOGLE_SCRIPT_URL,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        # Check for HTTP errors
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error communicating with Google Script: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
@app.get("/")
def root():
    return {"message": "test"}

