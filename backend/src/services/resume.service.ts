import { query } from '../db';
import { parseResume } from './parser.service';
import { createResumeChunks } from './chunking.service';
import { getEmbeddingProvider } from './embedding.service';
import { getVectorStore, VectorSearchResult } from './vector.service';
import { getLLMProvider, buildPrompt } from './llm.service';
import { analyzeAuthenticityScore, AuthenticityReport } from './authenticity.service';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export interface ResumeData {
  id: string;
  userId: string;
  filename: string;
  filePath: string;
  parsedData: any;
  authenticityReport?: AuthenticityReport;
}

export async function processResume(
  userId: string,
  filename: string,
  filePath: string
): Promise<ResumeData> {
  try {
    console.log('=== Starting Resume Processing ===');
    console.log('Step 1: Parsing resume from path:', filePath);
    // 1. Parse the resume
    const parsed = await parseResume(filePath);
    console.log('Step 1 complete: Parsed data received', JSON.stringify(parsed).substring(0, 200));
    
    // 2. Save resume metadata to database
    console.log('Step 2: Saving to database');
    const resumeId = uuidv4();
    const result = await query(
      `INSERT INTO resumes (id, user_id, filename, file_path, parsed_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, filename, file_path, parsed_data, created_at`,
      [resumeId, userId, filename, filePath, JSON.stringify(parsed)]
    );
    
    const resume = result.rows[0];
    console.log('Step 2 complete: Saved to database');
    
    // 3. Create chunks from parsed sections
    console.log('Step 3: Creating chunks');
    const chunks = createResumeChunks(resumeId, parsed.sections);
    console.log(`Step 3 complete: Created ${chunks.length} chunks`);
    
    // 4. Generate embeddings
    console.log('Step 4: Generating embeddings');
    const embeddingProvider = getEmbeddingProvider();
    const texts = chunks.map(c => c.content);
    console.log('Calling OpenAI for', texts.length, 'chunks');
    const embeddings = await embeddingProvider.createEmbeddings(texts);
    console.log('Step 4 complete: Embeddings generated', embeddings.length, 'vectors');
    
    // 5. Store chunks in database
    console.log('Step 5: Storing chunks in database');
    for (let i = 0; i < chunks.length; i++) {
      await query(
        `INSERT INTO chunks (id, resume_id, chunk_index, content, section, vector_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          uuidv4(),
          resumeId,
          chunks[i].metadata.chunkIndex,
          chunks[i].content,
          chunks[i].metadata.section,
          chunks[i].metadata.chunkId,
        ]
      );
    }
    console.log('Step 5 complete: Chunks stored in database');
    
    // 6. Store embeddings in vector database
    console.log('Step 6: Storing embeddings in vector database');
    console.log('Initializing vector store...');
    const vectorStore = await getVectorStore();
    console.log('Vector store initialized, preparing', chunks.length, 'vectors');
    const vectorData = chunks.map((chunk, idx) => ({
      id: chunk.metadata.chunkId,
      values: embeddings[idx],
      metadata: {
        ...chunk.metadata,
        content: chunk.content,
      },
    }));
    
    console.log('Upserting to vector database...');
    await vectorStore.upsert(vectorData);
    console.log('Step 6 complete: Resume processing finished');
    
    // 7. Run authenticity analysis
    console.log('Step 7: Running authenticity analysis');
    const authenticityReport = await analyzeAuthenticityScore(parsed, resumeId);
    console.log('Step 7 complete: Authenticity score:', authenticityReport.score);
    
    // Update database with authenticity report
    await query(
      `UPDATE resumes SET parsed_data = $1 WHERE id = $2`,
      [JSON.stringify({ ...parsed, authenticityReport }), resumeId]
    );
    
    console.log('=== Resume Processing Complete ===');
    
    return {
      id: resume.id,
      userId: resume.user_id,
      filename: resume.filename,
      filePath: resume.file_path,
      parsedData: { ...resume.parsed_data, authenticityReport },
      authenticityReport,
    };
  } catch (error) {
    const err = error as { message: string; stack?: string; response?: any };
    console.error('=== ERROR in processResume ===');
    console.error('Error message:', err.message);
    console.error('Error response:', err.response?.data);
    console.error('Stack:', err.stack);
    throw error;
  }
}

export async function queryResume(
  resumeId: string,
  question: string
): Promise<{ answer: string; sources: VectorSearchResult[] }> {
  try {
    console.log('=== Starting Query ===');
    console.log('Resume ID:', resumeId);
    console.log('Question:', question);
    
    // 1. Generate embedding for the question
    console.log('Step 1: Generating question embedding');
    const embeddingProvider = getEmbeddingProvider();
    const questionEmbedding = await embeddingProvider.createEmbedding(question);
    console.log('Question embedding generated');
    
    // 2. Search for relevant chunks
    console.log('Step 2: Searching vector database');
    const vectorStore = await getVectorStore();
    const results = await vectorStore.query(
    questionEmbedding,
    config.rag.topK,
    { resumeId }
  );
  
  console.log('Retrieved', results.length, 'results from vector store');
  console.log('Scores:', results.map(r => r.score));
  console.log('Similarity threshold:', config.rag.similarityThreshold);
  
  // 4. If no results at all, something is wrong
  if (results.length === 0) {
    console.log('WARNING: No chunks found in vector store.');
    return {
      answer: 'Unable to search the resume. Please try re-uploading it.',
      sources: [],
    };
  }
  
  // 3. Use all results - let the LLM decide if information is present
  // Filter only extremely low scores (< 0.15) which are likely noise
  const relevantResults = results.filter(r => r.score >= 0.15);
  
  console.log('Using', relevantResults.length, 'chunks for context');
  
  console.log('Found', relevantResults.length, 'relevant results');
  
  // 5. Build prompt with retrieved excerpts
  const excerpts = relevantResults.map(r => ({
    chunkId: r.chunkId,
    content: r.content,
    section: r.metadata.section,
  }));
  
  console.log('Step 3: Building prompt');
  const prompt = buildPrompt(excerpts, question);
  
  // 6. Generate answer using LLM
  console.log('Step 4: Calling LLM');
  const llmProvider = getLLMProvider();
  const answer = await llmProvider.generateResponse(prompt);
  console.log('=== Query Complete ===');
  
  return {
    answer,
    sources: relevantResults,
  };
  } catch (error) {
    console.error('=== ERROR in queryResume ===');
    console.error('Error:', error);
    throw error;
  }
}

export async function getResumeById(resumeId: string): Promise<ResumeData | null> {
  const result = await query(
    'SELECT id, user_id, filename, file_path, parsed_data FROM resumes WHERE id = $1',
    [resumeId]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    filePath: row.file_path,
    parsedData: row.parsed_data,
  };
}

export async function getUserResumes(userId: string): Promise<ResumeData[]> {
  const result = await query(
    'SELECT id, user_id, filename, file_path, parsed_data, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    filePath: row.file_path,
    parsedData: row.parsed_data,
  }));
}

export async function deleteResume(resumeId: string): Promise<void> {
  // Delete from vector store
  const vectorStore = await getVectorStore();
  await vectorStore.deleteByResumeId(resumeId);
  
  // Delete from database (cascades to chunks)
  await query('DELETE FROM resumes WHERE id = $1', [resumeId]);
}

export async function updateResumeData(resumeId: string, parsedData: any): Promise<void> {
  await query(
    'UPDATE resumes SET parsed_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(parsedData), resumeId]
  );
}
