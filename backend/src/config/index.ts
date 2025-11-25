import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (parent directory of backend)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ragfolio',
  },
  
  parser: {
    serviceUrl: process.env.PARSER_SERVICE_URL || 'http://localhost:8001',
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    llmModel: process.env.OPENAI_LLM_MODEL || 'gpt-4o-mini',
  },
  
  vectorDb: {
    provider: process.env.VECTOR_DB_PROVIDER || 'faiss',
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
      indexName: process.env.PINECONE_INDEX_NAME || 'ragfolio-resumes',
    },
    faiss: {
      indexPath: process.env.FAISS_INDEX_PATH || './faiss_index',
    },
  },
  
  rag: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '350', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '100', 10),
    topK: parseInt(process.env.TOP_K_RESULTS || '5', 10),
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7'),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
