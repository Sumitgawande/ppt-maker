# PPT Generator App

A simple full-stack application that generates PowerPoint presentations from user prompts.

## Structure

- `frontend/` - React application powered by Vite.
- `backend/` - FastAPI backend that creates `.pptx` files using `python-pptx`.

## Run Locally

1. Start the backend:

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:OLLAMA_MODEL="llama3.2:latest"  # or your local Ollama model name
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

3. Open the local Vite URL in your browser.
