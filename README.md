# RAGfolio

> Resume-driven RAG (Retrieval-Augmented Generation) Q&A system powered by AI for intelligent resume analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **📄 Resume Upload**: PDF and DOCX support
- **🔍 Smart Parsing**: Extracts Education, Experience, Skills, Projects sections
- **🤖 AI Q&A System**: RAG-powered question answering about resume content
- **🗄️ Vector Search**: FAISS/Pinecone-based semantic search for relevant context
- **💬 Intelligent Responses**: OpenAI-powered answers with source citations
- **🔐 Authentication**: JWT-based secure user authentication
- **📊 Resume Management**: Upload, view, edit, and delete resumes

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   Node.js    │─────▶│  PostgreSQL │
│  Frontend   │      │   Backend    │      │  Database   │
│  (Vite +    │      │  (Express +  │      └─────────────┘
│  Tailwind)  │      │  TypeScript) │             │
└─────────────┘      └──────┬───────┘             │
                            │                     │
                     ┌──────▼───────┐      ┌──────▼──────┐
                     │   Python     │      │   Vector    │
                     │   Parser     │      │   Database  │
                     │  (FastAPI)   │      │  (Pinecone/ │
                     └──────────────┘      │   FAISS)    │
                                           └─────────────┘
                            │
                     ┌──────▼───────┐
                     │   OpenAI     │
                     │  Embeddings  │
                     │     & LLM    │
                     └──────────────┘
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

**Backend:**
- Node.js + Express with TypeScript
- PostgreSQL for data persistence
- JWT authentication
- Rate limiting and security middleware

**Parser Service:**
- Python FastAPI microservice
- pdfplumber for PDF parsing
- python-docx for DOCX parsing
- Intelligent section detection

**AI/ML:**
- OpenAI text-embedding-3-small for embeddings
- OpenAI GPT-4o-mini for generation
- Pinecone or FAISS for vector storage
- Configurable chunk size and overlap

## 📋 Prerequisites

- Node.js 22+ 
- Python 3.9+
- PostgreSQL 16+
- OpenAI API key

## 🚀 Local Setup

### 1. Database Setup

Create PostgreSQL database and run schema:

```powershell
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ragfolio;

# Exit and run schema
psql -U postgres -d ragfolio -f setup_database.sql
```

### 2. Configure Environment

Edit `.env` file with your credentials:

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/ragfolio
PARSER_SERVICE_URL=http://127.0.0.1:8001
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### 3. Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install

# Parser (use Python virtual environment)
cd parser
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Start Services

**Option 1: Use start script**

```powershell
.\start-production.ps1
```

**Option 2: Start manually (3 separate terminals)**

```powershell
# Terminal 1 - Parser
cd parser
.venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3000>
- Parser Service: <http://localhost:8001>

## 🚀 Render Deployment

### Production Services

- **Database**: PostgreSQL on dpg-d4ir3cgdl3ps73dedu40-a
- **Parser**: <https://ragfolio-parser.onrender.com>
- **Backend**: <https://ragfolio-backend.onrender.com>
- **Frontend**: <https://ragfolio-yxqd.onrender.com>

### Deployment Steps

1. **Push to GitHub**

   ```powershell
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Configure Render Services**

   Each service auto-deploys from GitHub. Set environment variables in Render dashboard:

   **Backend Service:**
   - `DATABASE_URL`: Use Internal Database URL from PostgreSQL service
   - `PARSER_SERVICE_URL`: <https://ragfolio-parser.onrender.com>
   - `JWT_SECRET`: Your secret key
   - `OPENAI_API_KEY`: Your OpenAI key

   **Frontend Service:**
   - `VITE_API_URL`: <https://ragfolio-backend.onrender.com>

3. **Run Database Setup**

   Connect to Render PostgreSQL using External Database URL and run `setup_database.sql`

### Environment Files

- **Local**: `.env` (root) + `frontend/.env`
- **Production**: Environment variables in Render dashboard + `frontend/.env.production`

## 💡 Usage Tips

### Resume Upload & Q&A

1. **Upload Resume**: Upload PDF or DOCX file
2. **Processing**: System parses resume and creates vector embeddings
3. **Ask Questions**: Use AI chat to query resume content
4. **Get Answers**: Receive intelligent responses with relevant sources

Example questions:
- "What is the candidate's educational background?"
- "Which programming languages does the candidate know?"
- "What projects has the candidate worked on?"
- "Where has the candidate worked previously?"
- "What are the candidate's key skills?"

## 🔧 Configuration

### RAG Settings

Configure in `.env`:

```env
# Vector Database
VECTOR_DB_PROVIDER=faiss  # or 'pinecone'
SIMILARITY_THRESHOLD=0.2  # Minimum similarity for results

# Chunking
CHUNK_SIZE=500            # Tokens per chunk
CHUNK_OVERLAP=50          # Overlap between chunks
TOP_K=5                   # Number of chunks to retrieve
```

### AI Models

- **Embeddings**: text-embedding-3-small (OpenAI)
- **LLM**: gpt-4o-mini (OpenAI)

### Vector Storage

- **Local**: FAISS (stored in `backend/faiss_index/`)
- **Production**: Pinecone (set `PINECONE_API_KEY` and `PINECONE_INDEX`)

## 📝 License

MIT License

---

Built with React, TypeScript, Node.js, Python, and OpenAI
