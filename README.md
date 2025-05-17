# Quiz Generation App

A full-stack web application that allows users to upload a PDF and automatically generate quiz questions using **LLaMA 3.3 (NVIDIA)** model. Users can review, edit, delete, or add their own questions before exporting them as a Google Form.

---

# 🧠 Features

- Upload lecture slides or documents in PDF format
- Generate MCQs questions using **LLaMA 3.3** 
- Edit, delete, or add custom questions
- Export finalized questions to a **Google Form**
- Responsive React-based UI
- High-performance backend built with FastAPI

---
# ⚙️ Tech Stack

- **Frontend**: React,MUI
- **Backend**: FastAPI
- **Model**: LLaMA 3.3 (NVIDIA)

---
# 🛠️ Getting Started
git clone https://github.com/yourusername/quiz-generation-app.git

## FastApi Backend
    cd backend
### 1. Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate 

### 2. Create a requirements.txt file (if not already present)
    Example requirements.txt
    - fastapi
    - uvicorn
    - pydantic
    - python-multipart
    - PyMuPDF
    - openai 
    - requests

    pip install -r requirements.txt

### 3. Run the FastAPI server
    uvicorn main:app --reload

# Frontend (React + MUI)
## Prerequisites
- Node.js (v16+)
- npm or yarn

        cd frontend

### 1. Install dependencies
        npm install  

### 2. Start the React development server
        npm start    
