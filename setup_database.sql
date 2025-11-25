-- RAGfolio Database Setup Script
-- Run this in pgAdmin or psql

-- Create database
CREATE DATABASE ragfolio;

-- Connect to the database
\c ragfolio

-- Create tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  raw_text TEXT,
  education TEXT,
  experience TEXT,
  skills TEXT,
  projects TEXT,
  achievements TEXT,
  other_sections TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
  section VARCHAR(100),
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  vector_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_chunks_resume_id ON chunks(resume_id);
CREATE INDEX idx_chunks_vector_id ON chunks(vector_id);

-- Display success message
SELECT 'Database setup completed successfully!' AS status;
