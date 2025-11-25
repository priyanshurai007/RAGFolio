import { config } from '../config';
import { ChunkMetadata } from './chunking.service';
import fs from 'fs/promises';
import path from 'path';

export interface VectorSearchResult {
  chunkId: string;
  content: string;
  metadata: ChunkMetadata;
  score: number;
}

export interface VectorStore {
  initialize(): Promise<void>;
  upsert(chunks: Array<{ id: string; values: number[]; metadata: any }>): Promise<void>;
  query(vector: number[], topK: number, filter?: any): Promise<VectorSearchResult[]>;
  deleteByResumeId(resumeId: string): Promise<void>;
}

// Pinecone implementation
export class PineconeVectorStore implements VectorStore {
  private pinecone: any;
  private index: any;
  
  async initialize(): Promise<void> {
    const { Pinecone } = await import('@pinecone-database/pinecone');
    
    // Initialize Pinecone client (v1.x requires environment parameter)
    this.pinecone = new Pinecone({
      apiKey: config.vectorDb.pinecone.apiKey,
      environment: config.vectorDb.pinecone.environment,
    });
    
    this.index = this.pinecone.index(config.vectorDb.pinecone.indexName);
  }
  
  async upsert(chunks: Array<{ id: string; values: number[]; metadata: any }>): Promise<void> {
    await this.index.upsert(chunks);
  }
  
  async query(vector: number[], topK: number, filter?: any): Promise<VectorSearchResult[]> {
    const results = await this.index.query({
      vector,
      topK,
      includeMetadata: true,
      filter,
    });
    
    return results.matches.map((match: any) => ({
      chunkId: match.id,
      content: match.metadata.content || '',
      metadata: match.metadata,
      score: match.score || 0,
    }));
  }
  
  async deleteByResumeId(resumeId: string): Promise<void> {
    await this.index.deleteMany({
      filter: { resumeId },
    });
  }
}

// FAISS implementation (local fallback)
export class FAISSVectorStore implements VectorStore {
  private vectors: Map<string, { vector: number[]; metadata: any }> = new Map();
  private initialized = false;
  private storePath = path.resolve(config.vectorDb.faiss.indexPath, 'vectors.json');
  
  async initialize(): Promise<void> {
    // Load vectors from disk if they exist
    try {
      await fs.mkdir(path.dirname(this.storePath), { recursive: true });
      const data = await fs.readFile(this.storePath, 'utf-8');
      const stored = JSON.parse(data);
      this.vectors = new Map(stored);
      console.log(`Loaded ${this.vectors.size} vectors from disk`);
    } catch (error) {
      console.log('No existing vectors found, starting fresh');
    }
    this.initialized = true;
  }
  
  async upsert(chunks: Array<{ id: string; values: number[]; metadata: any }>): Promise<void> {
    for (const chunk of chunks) {
      this.vectors.set(chunk.id, { vector: chunk.values, metadata: chunk.metadata });
    }
    // Persist to disk
    await this.saveToDisk();
  }
  
  private async saveToDisk(): Promise<void> {
    try {
      console.log('Saving vectors to:', this.storePath);
      await fs.mkdir(path.dirname(this.storePath), { recursive: true });
      const data = JSON.stringify(Array.from(this.vectors.entries()));
      await fs.writeFile(this.storePath, data, 'utf-8');
      console.log(`Saved ${this.vectors.size} vectors to disk at ${this.storePath}`);
    } catch (error) {
      console.error('Error saving vectors to disk:', error);
    }
  }
  
  async query(vector: number[], topK: number, filter?: any): Promise<VectorSearchResult[]> {
    const results: Array<{ id: string; score: number; metadata: any }> = [];
    
    for (const [id, data] of this.vectors.entries()) {
      // Apply filter if provided
      if (filter && filter.resumeId && data.metadata.resumeId !== filter.resumeId) {
        continue;
      }
      
      const score = this.cosineSimilarity(vector, data.vector);
      results.push({ id, score, metadata: data.metadata });
    }
    
    // Sort by score descending and take top K
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);
    
    return topResults.map(r => ({
      chunkId: r.id,
      content: r.metadata.content || '',
      metadata: r.metadata,
      score: r.score,
    }));
  }
  
  async deleteByResumeId(resumeId: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [id, data] of this.vectors.entries()) {
      if (data.metadata.resumeId === resumeId) {
        keysToDelete.push(id);
      }
    }
    
    for (const key of keysToDelete) {
      this.vectors.delete(key);
    }
    
    // Persist changes to disk
    await this.saveToDisk();
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Singleton instance
let vectorStoreInstance: VectorStore | null = null;

// Factory function
export async function getVectorStore(): Promise<VectorStore> {
  if (vectorStoreInstance) {
    return vectorStoreInstance;
  }
  
  let store: VectorStore;
  
  if (config.vectorDb.provider === 'pinecone') {
    store = new PineconeVectorStore();
  } else {
    store = new FAISSVectorStore();
  }
  
  await store.initialize();
  vectorStoreInstance = store;
  return store;
}
