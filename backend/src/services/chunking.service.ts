import { config } from '../config';

export interface ChunkMetadata {
  chunkId: string;
  resumeId: string;
  section: string;
  pageNumber?: number;
  chunkIndex: number;
}

export interface TextChunk {
  content: string;
  metadata: ChunkMetadata;
}

/**
 * Split text into overlapping chunks based on token count (approximated by word count)
 * @param text - The text to chunk
 * @param chunkSize - Target size of each chunk in tokens (approximated)
 * @param overlap - Number of tokens to overlap between chunks
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = config.rag.chunkSize,
  overlap: number = config.rag.chunkOverlap
): string[] {
  // Approximate tokens as words (rough heuristic: 1 token ~= 0.75 words)
  const words = text.split(/\s+/);
  const wordsPerChunk = Math.floor(chunkSize * 0.75);
  const overlapWords = Math.floor(overlap * 0.75);
  
  const chunks: string[] = [];
  let startIdx = 0;
  
  while (startIdx < words.length) {
    const endIdx = Math.min(startIdx + wordsPerChunk, words.length);
    const chunk = words.slice(startIdx, endIdx).join(' ');
    
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
    
    // Move forward by (chunkSize - overlap)
    startIdx += wordsPerChunk - overlapWords;
    
    // Prevent infinite loop
    if (startIdx <= endIdx - wordsPerChunk + overlapWords && endIdx < words.length) {
      continue;
    }
    
    if (endIdx >= words.length) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Create chunks from parsed resume sections
 */
export function createResumeChunks(
  resumeId: string,
  sections: { [key: string]: string }
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let globalChunkIndex = 0;
  
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!sectionContent || sectionContent.trim().length === 0) {
      continue;
    }
    
    const sectionChunks = chunkText(sectionContent);
    
    for (let i = 0; i < sectionChunks.length; i++) {
      chunks.push({
        content: sectionChunks[i],
        metadata: {
          chunkId: `${resumeId}-chunk-${globalChunkIndex}`,
          resumeId,
          section: sectionName,
          chunkIndex: globalChunkIndex,
        },
      });
      globalChunkIndex++;
    }
  }
  
  return chunks;
}

/**
 * Estimate token count from text (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
