from fastapi import FastAPI, HTTPException, UploadFile, File, Form,Request
from fastapi.middleware.cors import CORSMiddleware
import ollama
from pydantic import BaseModel
import json
import re
import fitz  
import requests
from typing import List
from openai import OpenAI
from env import API_KEY

app = FastAPI()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,  
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# model = "mistral"
model = "nvidia/llama-3.3-nemotron-super-49b-v1:free"

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
async def upload_file(file: UploadFile = File(...),number: int = Form(...)):
    text =await extract_text_from_pdf(file)
    print(text)
    prompt = f""" [INST] <<SYS>>
    IMPORTANT:You MUST respond with ONLY valid JSON in the EXACT format specified below. 
    DO NOT include any additional text, explanations, or markdown formatting.
    
    Generate exactly {number} multiple-choice questions (MCQs) based on the following text.
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
            // Repeat for {number} questions total
        ]
    }}
    <</SYS>>

    Generate {number} MCQs using:
    1. The provided text (for context)
    2. Your own knowledge (to enhance questions if needed)
    Text to base questions on:
    {text}
    [/INST]"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            top_p=0.9,
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "MCQ Generator App",
            },
        )
        mcq_data = response.choices[0].message.content.strip()
        mcq_json = json.loads(mcq_data)
        return {"message": "MCQs generated successfully", "data": mcq_json}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
    


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
        payload = {"questions": [q.dict() for q in quiz.questions]}
        
        response = requests.post(
            GOOGLE_SCRIPT_URL,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
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

