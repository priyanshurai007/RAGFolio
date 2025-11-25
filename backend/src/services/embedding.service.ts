import OpenAI from 'openai';
import { config } from '../config';

export interface EmbeddingProvider {
  createEmbeddings(texts: string[]): Promise<number[][]>;
  createEmbedding(text: string): Promise<number[]>;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  
  async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: config.openai.embeddingModel,
        input: texts,
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error creating embeddings:', error);
      throw new Error('Failed to create embeddings');
    }
  }
  
  async createEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.createEmbeddings([text]);
    return embeddings[0];
  }
}

// Factory function to get the appropriate embedding provider
export function getEmbeddingProvider(): EmbeddingProvider {
  // Currently only OpenAI is supported, but this can be extended
  return new OpenAIEmbeddingProvider();
}
