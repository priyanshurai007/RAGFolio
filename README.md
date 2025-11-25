# RAGfolio

> A production-quality Resume-driven RAG (Retrieval-Augmented Generation) portfolio web application that allows users to upload their resume, automatically extracts structured information, and provides an AI-powered interview assistant that answers questions based solely on the resume content.

[![CI](https://github.com/yourusername/ragfolio/workflows/CI/badge.svg)](https://github.com/yourusername/ragfolio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **📄 Resume Upload**: Support for PDF and DOCX files with progress tracking
- **🔍 Smart Parsing**: Automatic detection and extraction of Education, Experience, Skills, Projects, Achievements, and more
- **✏️ Editable Profiles**: Review and correct parsed data before indexing
- **🤖 AI Interview Assistant**: Ask natural language questions and get accurate answers sourced from the resume
- **🔒 Anti-Hallucination**: Strict RAG implementation ensures answers are grounded in actual resume content
- **🗄️ Vector Search**: Pluggable vector database support (Pinecone, FAISS)
- **🔐 Authentication**: JWT-based secure authentication
- **🐳 Docker Ready**: Complete Docker Compose setup for easy deployment
- **✅ Tested**: Comprehensive unit and integration tests

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

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional but recommended)
- OpenAI API key
- Pinecone API key (optional, can use FAISS)

## 🚀 Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ragfolio.git
cd ragfolio
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

Required environment variables:
```env
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key  # or use FAISS
VECTOR_DB_PROVIDER=pinecone  # or faiss
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Parser Service: http://localhost:8001

5. **Create an account and upload the sample resume**
- Register at http://localhost:5173/register
- Upload `sample_resume.txt` (convert to PDF first or use any PDF resume)
- Start asking questions!

## 🛠️ Local Development Setup

### Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Parser Service Setup

```bash
cd parser
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Start service
uvicorn app.main:app --reload --port 8001
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Parser Tests
```bash
cd parser
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Run All Tests with Coverage
```bash
# Backend
cd backend && npm test -- --coverage

# Parser
cd parser && pytest tests/ -v --cov=app --cov-report=html

# Frontend
cd frontend && npm test -- --coverage
```

## 📖 Usage Examples

### Uploading a Resume

1. Navigate to the Upload page
2. Click or drag-and-drop a PDF/DOCX file
3. Wait for processing (usually 10-30 seconds)
4. Review the parsed sections
5. Edit any incorrectly parsed information
6. Save changes

### Asking Questions

Navigate to the Chat interface and try these sample questions:

**✅ Good Questions (Grounded in Resume):**
```
"What is the candidate's educational background?"
→ "The candidate has a Bachelor of Science in Computer Science from MIT 
   (GPA: 3.9/4.0, graduated May 2020) and a Master of Science in Artificial 
   Intelligence from Stanford University (GPA: 4.0/4.0, graduated June 2022)."

"What programming languages does the candidate know?"
→ "Based on the Skills section, the candidate knows Python, JavaScript, 
   TypeScript, C++, Go, and SQL."

"Where has the candidate worked?"
→ "The candidate has worked at Google as a Senior Software Engineer 
   (July 2022 - Present), Microsoft as a Software Engineer (June 2020 - 
   June 2022), and Tesla as a Machine Learning Intern (Summer 2019)."
```

**❌ Questions Without Information:**
```
"What is the candidate's favorite color?"
→ "Not specified in the resume."

"Does the candidate have a driver's license?"
→ "Not specified in the resume."
```

### API Usage

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Upload Resume:**
```bash
curl -X POST http://localhost:3000/api/resumes/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@./sample_resume.pdf"
```

**Query Resume:**
```bash
curl -X POST http://localhost:3000/api/resumes/RESUME_ID/query \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the candidates educational background?"
  }'
```

## 🔧 Configuration

### RAG Parameters

Edit `.env` to customize:

```env
# Chunking
CHUNK_SIZE=350          # Tokens per chunk
CHUNK_OVERLAP=100       # Overlap between chunks

# Retrieval
TOP_K_RESULTS=5         # Number of chunks to retrieve
SIMILARITY_THRESHOLD=0.7 # Minimum similarity score (0-1)

# Models
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_LLM_MODEL=gpt-4o-mini
```

### Vector Database Selection

**Using Pinecone (Recommended for Production):**
```env
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=ragfolio-resumes
```

**Using FAISS (Local Development):**
```env
VECTOR_DB_PROVIDER=faiss
FAISS_INDEX_PATH=./faiss_index
```

## 📚 Documentation

- [API Specification](./design/api-spec.md) - Complete REST API documentation
- [Data Models](./design/data-models.md) - Database schema and data structures
- [Prompt Engineering](./design/prompt-template-explanation.md) - How we prevent hallucination

## 🔒 Security Features

- JWT-based authentication with bcrypt password hashing
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- File type and size validation
- SQL injection prevention via parameterized queries

## 🚢 Deployment

### Docker Production Build

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

### Environment Variables for Production

Ensure you set these in production:
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DATABASE_URL=<production-db-url>
OPENAI_API_KEY=<your-key>
PINECONE_API_KEY=<your-key>
```

### Cloud Deployment Options

**AWS:**
- ECS/Fargate for containers
- RDS for PostgreSQL
- S3 for file storage
- CloudFront for CDN

**GCP:**
- Cloud Run for containers
- Cloud SQL for PostgreSQL
- Cloud Storage for files
- Cloud CDN

**Heroku:**
```bash
# Backend
cd backend
heroku create ragfolio-backend
git push heroku main

# Frontend (Vercel recommended)
cd frontend
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow existing code style (ESLint/Prettier configured)
- Update documentation
- Keep commits atomic and well-described

## 📊 Performance Benchmarks

**Resume Processing:**
- PDF parsing: ~2-5 seconds
- Chunking + embedding generation: ~5-10 seconds
- Total upload time: ~10-15 seconds (typical resume)

**Query Performance:**
- Embedding generation: ~0.5 seconds
- Vector search: ~0.1-0.3 seconds (Pinecone), ~0.05 seconds (FAISS)
- LLM generation: ~1-3 seconds
- Total query time: ~2-4 seconds

## 🐛 Troubleshooting

**Parser service not connecting:**
```bash
# Check if parser is running
curl http://localhost:8001/health

# Restart parser service
docker-compose restart parser
```

**Database connection errors:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Run migrations manually
docker-compose exec backend npm run migrate
```

**OpenAI API errors:**
- Verify API key is correct in `.env`
- Check OpenAI account has credits
- Ensure models are available (text-embedding-3-small, gpt-4o-mini)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT and embedding models
- Pinecone for vector database
- All open-source contributors

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, Node.js, Python, and AI
