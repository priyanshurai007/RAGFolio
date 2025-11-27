# RAGfolio Architecture Overview

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                         (React + TypeScript + Vite)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pages:                                                                      │
│  • Login/Register    → JWT Authentication                                    │
│  • Upload            → File selection & resume list management               │
│  • Chat              → Q&A interface with conversation history               │
│  • Settings          → User profile & account info                           │
│                                                                              │
│  State Management: Zustand (authStore, resumeStore)                          │
│  UI Framework: Tailwind CSS (Mobile-responsive)                              │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │ HTTP/REST API
                           │ (axios with JWT Bearer tokens)
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICE                                    │
│                      (Node.js + Express + TypeScript)                        │
│                             Port: 3000                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  API Endpoints:                                                              │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │ Auth Routes (/api/auth)                                     │            │
│  │  POST /register  → Create user account                      │            │
│  │  POST /login     → Authenticate & return JWT token          │            │
│  │  GET  /me        → Validate token & get user info           │            │
│  └────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │ Resume Routes (/api/resumes)                                │            │
│  │  POST   /upload    → Upload & process resume                │            │
│  │  GET    /          → List all user's resumes                │            │
│  │  GET    /:id       → Get specific resume details            │            │
│  │  DELETE /:id       → Delete resume & vectors                │            │
│  │  POST   /:id/query → Ask question about resume              │            │
│  └────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  Services Layer:                                                             │
│  • auth.service.ts        → User authentication & JWT                        │
│  • resume.service.ts      → Resume processing orchestration                  │
│  • parser.service.ts      → Communication with Parser microservice           │
│  • chunking.service.ts    → Text chunking (350 tokens, 100 overlap)         │
│  • embedding.service.ts   → OpenAI embeddings generation                     │
│  • vector.service.ts      → FAISS/Pinecone vector operations                 │
│  • llm.service.ts         → GPT-4o-mini for Q&A generation                   │
│                                                                              │
└───┬─────────────────┬────────────────────┬──────────────────┬──────────────┘
    │                 │                    │                  │
    │                 │                    │                  │
    ▼                 ▼                    ▼                  ▼
┌─────────┐   ┌──────────────┐   ┌─────────────┐   ┌────────────────┐
│PostgreSQL│   │Parser Service│   │OpenAI API   │   │Vector Database │
│ Database │   │(FastAPI)     │   │             │   │(FAISS/Pinecone)│
└─────────┘   └──────────────┘   └─────────────┘   └────────────────┘
```

---

## Detailed Component Breakdown

### 1️⃣ **Frontend (React + TypeScript)**
**Location:** `/frontend/src/`

**Key Components:**
- **Authentication:** Login/Register forms with JWT token management
- **Upload Page:** File upload interface, resume list with delete functionality
- **Chat Page:** Real-time Q&A interface with message history
- **Layout:** Responsive navigation with mobile hamburger menu

**State Management:**
- `authStore`: User authentication state (user, token, isAuthenticated)
- `resumeStore`: Resume data (list of resumes, current resume)

**API Communication:**
- Axios instance with JWT Bearer token interceptor
- Base URL: `http://localhost:3000` (dev) or `https://ragfolio-backend.onrender.com` (prod)

---

### 2️⃣ **Backend Service (Node.js + Express)**
**Location:** `/backend/src/`

**Port:** 3000

**Middleware:**
- `auth.middleware.ts`: JWT token validation
- `error.middleware.ts`: Global error handling
- `multer`: File upload handling (max 10MB)

**Database Connection:**
- PostgreSQL via `pg` library
- Connection pooling for performance

---

### 3️⃣ **Database Schema (PostgreSQL)**

```sql
┌─────────────────────────────────────────────────────────────┐
│                        USERS TABLE                          │
├─────────────────────────────────────────────────────────────┤
│ user_id      UUID PRIMARY KEY                               │
│ email        VARCHAR(255) UNIQUE NOT NULL                   │
│ password     VARCHAR(255) NOT NULL (bcrypt hashed)          │
│ created_at   TIMESTAMP DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ (One-to-Many)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       RESUMES TABLE                         │
├─────────────────────────────────────────────────────────────┤
│ id           UUID PRIMARY KEY                               │
│ user_id      UUID FOREIGN KEY → users(user_id)              │
│ filename     VARCHAR(255) NOT NULL                          │
│ file_path    VARCHAR(500) NOT NULL                          │
│ parsed_data  JSONB (stores extracted text & sections)       │
│ created_at   TIMESTAMP DEFAULT NOW()                        │
│ updated_at   TIMESTAMP DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────┘
```

**What's Stored:**

1. **Users Table:**
   - User credentials (email + hashed password)
   - User ID for linking resumes

2. **Resumes Table:**
   - Metadata: filename, file path, timestamps
   - `parsed_data` (JSONB): Complete resume content
     ```json
     {
       "raw_text": "Full resume text...",
       "sections": {
         "education": "...",
         "experience": "...",
         "skills": "...",
         "projects": "..."
       },
       "metadata": {
         "num_pages": 2,
         "file_size": 156789
       }
     }
     ```

3. **File Storage:**
   - Physical files: `/backend/uploads/` directory
   - Naming: `{timestamp}-{filename}`

4. **Vector Database (FAISS/Pinecone):**
   - Not in PostgreSQL - separate vector store
   - Stores embeddings for semantic search

---

### 4️⃣ **Parser Microservice (Python FastAPI)**
**Location:** `/parser/app/`

**Port:** 8001

**Endpoint:** `POST /parse`

**Purpose:** Extract text and detect sections from uploaded documents

**Libraries:**
- `pdfplumber`: PDF text extraction
- `python-docx`: DOCX text extraction

**Process:**
1. Receives file from backend
2. Extracts raw text based on file type
3. Runs section detection algorithm
4. Returns structured JSON:
```json
{
  "raw_text": "Full document text...",
  "sections": {
    "personal_info": "...",
    "education": "...",
    "experience": "...",
    "skills": "...",
    "projects": "..."
  },
  "metadata": {
    "num_pages": 2,
    "file_size": 156789
  }
}
```

---

### 5️⃣ **RAG Pipeline - Complete Flow**

## 📤 **UPLOAD & INDEXING FLOW**

```
User Uploads Resume (PDF/DOCX)
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 1: File Upload & Parsing                                     │
├───────────────────────────────────────────────────────────────────┤
│ Frontend → Backend (POST /api/resumes/upload)                     │
│   • Save file to /uploads/                                        │
│   • Forward to Parser Service                                     │
│                                                                    │
│ Parser Service (POST /parse)                                      │
│   • Extract text from PDF/DOCX                                    │
│   • Detect sections (Education, Experience, Skills, etc.)         │
│   • Return: raw_text + sections + metadata                        │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 2: Save to PostgreSQL                                        │
├───────────────────────────────────────────────────────────────────┤
│ INSERT INTO resumes (user_id, filename, file_path, parsed_data)  │
│ VALUES (userId, filename, filepath, jsonb_data)                   │
│                                                                    │
│ Stored Data:                                                      │
│   • File metadata                                                 │
│   • Complete parsed text                                          │
│   • Section-wise breakdown                                        │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 3: Text Chunking                                             │
├───────────────────────────────────────────────────────────────────┤
│ chunking.service.ts                                               │
│   • Split text into chunks                                        │
│   • Chunk size: 350 tokens                                        │
│   • Overlap: 100 tokens (for context preservation)                │
│   • Include section metadata with each chunk                      │
│                                                                    │
│ Example Chunks:                                                   │
│   Chunk 1: "Education: B.Tech in Computer Science..."             │
│   Chunk 2: "...Computer Science from XYZ University. Skills: ..." │
│   Chunk 3: "...Skills: Python, JavaScript, React..."              │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 4: Generate Embeddings                                       │
├───────────────────────────────────────────────────────────────────┤
│ embedding.service.ts → OpenAI API                                 │
│   • Model: text-embedding-3-small                                 │
│   • Input: Each text chunk                                        │
│   • Output: 1536-dimensional vector per chunk                     │
│                                                                    │
│ Example:                                                          │
│   Text: "Python, JavaScript, React"                              │
│   Vector: [0.123, -0.456, 0.789, ..., 0.321] (1536 dims)         │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 5: Store Vectors                                             │
├───────────────────────────────────────────────────────────────────┤
│ vector.service.ts → FAISS (local) or Pinecone (production)       │
│                                                                    │
│ FAISS (Local Development):                                        │
│   • Stores in /backend/faiss_index/vectors.json                   │
│   • In-memory index for fast retrieval                            │
│   • Structure: {resumeId: [chunks with embeddings]}               │
│                                                                    │
│ Pinecone (Production):                                            │
│   • Cloud-hosted vector database                                  │
│   • Scalable & persistent                                         │
│   • Metadata filtering by user_id and resume_id                   │
└───────────────────────────────────────────────────────────────────┘
        ↓
    ✅ Resume indexed and ready for querying!
```

---

## 🔍 **QUERY & RETRIEVAL FLOW**

```
User Asks Question: "What are the candidate's Python skills?"
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 1: Question Embedding                                        │
├───────────────────────────────────────────────────────────────────┤
│ POST /api/resumes/:id/query                                       │
│   • Receive question from frontend                                │
│                                                                    │
│ embedding.service.ts → OpenAI API                                 │
│   • Model: text-embedding-3-small                                 │
│   • Input: "What are the candidate's Python skills?"              │
│   • Output: [0.234, -0.567, 0.890, ...] (1536-dim vector)         │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 2: Vector Similarity Search                                  │
├───────────────────────────────────────────────────────────────────┤
│ vector.service.ts → FAISS/Pinecone                                │
│   • Compare question vector with all resume chunk vectors         │
│   • Calculate cosine similarity scores                            │
│   • Filter: similarity >= 0.2 (SIMILARITY_THRESHOLD)              │
│   • Return: Top 5 most similar chunks (TOP_K_RESULTS=5)           │
│                                                                    │
│ Example Results:                                                  │
│   1. "Skills: Python, Django, FastAPI..." (score: 0.89)           │
│   2. "Built microservices using Python..." (score: 0.76)          │
│   3. "Experience with Python libraries..." (score: 0.68)          │
│   4. "Projects: Python-based ML tool..." (score: 0.54)            │
│   5. "Education: Python coursework..." (score: 0.42)              │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 3: Context Assembly                                          │
├───────────────────────────────────────────────────────────────────┤
│ llm.service.ts                                                    │
│   • Combine retrieved chunks into context                         │
│   • Add metadata (section names, similarity scores)               │
│                                                                    │
│ Context Format:                                                   │
│   "Based on the resume:                                           │
│    [Skills Section]: Python, Django, FastAPI, NumPy, Pandas       │
│    [Experience Section]: Built Python microservices...            │
│    [Projects Section]: Developed Python-based ML tool..."         │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 4: LLM Answer Generation                                     │
├───────────────────────────────────────────────────────────────────┤
│ llm.service.ts → OpenAI API                                       │
│   • Model: GPT-4o-mini                                            │
│   • System Prompt: "You are a helpful assistant..."              │
│   • User Prompt: Question + Retrieved Context                     │
│                                                                    │
│ LLM generates natural language answer:                            │
│   "The candidate has strong Python skills including:              │
│    - Frameworks: Django, FastAPI                                  │
│    - Libraries: NumPy, Pandas                                     │
│    - Experience: Built microservices and ML tools                 │
│    They have used Python extensively in their projects."          │
└───────────────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────────────┐
│ STEP 5: Return Response                                           │
├───────────────────────────────────────────────────────────────────┤
│ Backend → Frontend                                                │
│   • Answer: Generated text                                        │
│   • Sources: Top 5 chunks with scores & sections                  │
│                                                                    │
│ JSON Response:                                                    │
│   {                                                               │
│     "answer": "The candidate has strong Python skills...",        │
│     "sources": [                                                  │
│       {                                                           │
│         "text": "Skills: Python, Django...",                      │
│         "score": 0.89,                                            │
│         "metadata": { "section": "skills" }                       │
│       },                                                          │
│       ...                                                         │
│     ]                                                             │
│   }                                                               │
└───────────────────────────────────────────────────────────────────┘
        ↓
    ✅ Answer displayed to user with sources!
```

---

## 🗄️ **Data Storage Summary**

| **Data Type** | **Storage Location** | **Format** | **Purpose** |
|---------------|---------------------|------------|-------------|
| User credentials | PostgreSQL `users` table | Email (string), Password (bcrypt hash) | Authentication |
| Resume metadata | PostgreSQL `resumes` table | filename, file_path, timestamps | File tracking |
| Parsed text & sections | PostgreSQL `resumes.parsed_data` | JSONB | Structured resume data |
| Physical files | `/backend/uploads/` directory | PDF/DOCX | Original documents |
| Text embeddings | FAISS (local) or Pinecone (prod) | 1536-dim vectors | Semantic search |
| Vector metadata | FAISS/Pinecone | resumeId, section, chunk_index | Filtering & tracking |

---

## 🔐 **Security Flow**

```
User Registration/Login
        ↓
Backend generates JWT token (24h expiry)
        ↓
Frontend stores token in:
  • localStorage (persistent)
  • Zustand store (in-memory)
        ↓
All API requests include:
  Authorization: Bearer <JWT_TOKEN>
        ↓
Backend validates token on each request
        ↓
If valid → Process request
If invalid → Return 401 Unauthorized
```

---

## 📊 **Key Configuration Parameters**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `CHUNK_SIZE` | 350 tokens | Optimal context window for embeddings |
| `CHUNK_OVERLAP` | 100 tokens | Preserve context between chunks |
| `TOP_K_RESULTS` | 5 | Number of chunks to retrieve |
| `SIMILARITY_THRESHOLD` | 0.2 | Minimum relevance score |
| `EMBEDDING_MODEL` | text-embedding-3-small | Fast & cost-effective |
| `LLM_MODEL` | gpt-4o-mini | Balance of quality & speed |
| `MAX_FILE_SIZE` | 10 MB | Upload limit |

---

## 🚀 **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION (Render)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend: https://ragfolio-yxqd.onrender.com                  │
│    • Static site deployment                                    │
│    • Built React app                                           │
│                                                                 │
│  Backend: https://ragfolio-backend.onrender.com                │
│    • Node.js service                                           │
│    • Auto-deploy on git push                                   │
│                                                                 │
│  Parser: https://ragfolio-parser.onrender.com                  │
│    • Python FastAPI service                                    │
│    • Independent scaling                                       │
│                                                                 │
│  Database: PostgreSQL (Render managed)                          │
│    • dpg-d4ir3cgdl3ps73dedu40-a                                │
│    • Automatic backups                                         │
│                                                                 │
│  Vector DB: Pinecone (Cloud)                                    │
│    • Serverless vector database                                │
│    • Persistent storage                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **System Capabilities**

✅ **Authentication:** JWT-based user auth with session persistence  
✅ **File Processing:** PDF/DOCX parsing with section detection  
✅ **Semantic Search:** Vector-based similarity search  
✅ **RAG Q&A:** Context-aware answers using retrieved chunks  
✅ **CRUD Operations:** Upload, view, delete resumes  
✅ **Mobile Responsive:** Works on all device sizes  
✅ **Microservices:** Independent scaling of parser service  
✅ **Error Handling:** Comprehensive error middleware  

---

**This architecture enables:**
- Fast and accurate resume Q&A
- Scalable vector search
- Secure user data management
- Independent service deployment
- Cost-effective AI processing
