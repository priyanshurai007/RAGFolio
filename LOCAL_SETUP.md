# RAGfolio - Local Setup Guide

## Quick Start

### 1. Database Setup

```powershell
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ragfolio;

# Exit and run schema
\q
psql -U postgres -d ragfolio -f setup_database.sql
```

### 2. Install Dependencies

```powershell
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Parser (Python virtual environment)
cd parser
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment

Edit `.env` file in root directory with your credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ragfolio
PARSER_SERVICE_URL=http://127.0.0.1:8001
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start Services

**Option 1: Use the start script**

```powershell
.\start-production.ps1
```

This opens 3 PowerShell windows for Parser, Backend, and Frontend.

**Option 2: Start manually (3 separate terminals)**

**Terminal 1 - Parser Service:**

```powershell
cd parser
.\.venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

**Terminal 2 - Backend Service:**

```powershell
cd backend
npm run dev
```

**Terminal 3 - Frontend:**

```powershell
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3000>
- Parser Service: <http://localhost:8001>

## Testing the Application

1. Open <http://localhost:5173> in your browser
2. Register a new account
3. Upload a PDF resume with links (GitHub, LeetCode, LinkedIn)
4. Wait for processing (~10-30 seconds)
5. View profile analysis in the Profile tab
6. Check authenticity score
7. Use the Chat interface to ask questions about the resume

## Troubleshooting

### Parser won't start

- Make sure Python virtual environment is activated
- Check if port 8001 is available
- Verify all dependencies installed: `pip install -r requirements.txt`

### Backend connection errors

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` is correct
- Make sure database schema is created (`setup_database.sql`)

### Frontend can't connect to backend

- Check `frontend/.env` has `VITE_API_URL=http://localhost:3000`
- Verify backend is running on port 3000
- Check browser console for CORS errors

### OpenAI API errors

- Verify API key in `.env` is correct
- Check OpenAI account has credits
- Ensure you're using valid models (text-embedding-3-small, gpt-4o-mini)

## Development Tips

### Hot Reload

All services support hot reload:

- Backend: Changes auto-reload with `ts-node-dev`
- Frontend: Vite auto-refreshes on save
- Parser: Use `--reload` flag with uvicorn

### Database Changes

After modifying `setup_database.sql`:

```powershell
psql -U postgres -d ragfolio -f setup_database.sql
```

### Viewing Logs

Check terminal windows for logs:

- Parser: FastAPI logs with request details
- Backend: Express logs with SQL queries
- Frontend: Vite dev server logs

### Testing Profile Analysis

Upload a resume with these types of links:

- GitHub: `https://github.com/username`
- LeetCode: `https://leetcode.com/username`
- LinkedIn: `https://linkedin.com/in/username`

Parser extracts links and analyzes profiles automatically.
