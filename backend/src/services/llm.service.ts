export const RAG_PROMPT_TEMPLATE = `You are an intelligent AI assistant analyzing a candidate's resume. Answer questions by understanding the context and meaning, not just matching exact words.

INSTRUCTIONS:
1. Carefully read all the resume excerpts provided below
2. Answer the question based on the information in the excerpts
3. Use semantic understanding - if asked about "location" or "city", check contact info, address, education institutions, etc.
4. Make reasonable inferences from the data (e.g., if institute is in a city, candidate likely studied there)
5. If information is genuinely not present, say: "Not specified in the resume."
6. Be concise and direct in your answers
7. Cite the section you used (e.g., "Based on Contact/Education/Experience section")

RESUME EXCERPTS:
{{excerpts}}

QUESTION: {{question}}

Think carefully about where this information might appear in the resume and provide an intelligent answer.

Answer:`;

export interface LLMProvider {
  generateResponse(prompt: string): Promise<string>;
}

export class OpenAILLMProvider implements LLMProvider {
  private client: any;
  
  constructor() {
    const OpenAI = require('openai');
    const { config } = require('../config');
    
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  
  async generateResponse(prompt: string): Promise<string> {
    try {
      const { config } = require('../config');
      
      const response = await this.client.chat.completions.create({
        model: config.openai.llmModel,
        messages: [
          {
            role: 'system',
            content: 'You are an intelligent assistant analyzing resumes. Use semantic understanding and context to answer questions accurately. Make reasonable inferences from the data provided.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });
      
      return response.choices[0].message.content || 'No response generated.';
    } catch (error) {
      console.error('Error generating LLM response:', error);
      throw new Error('Failed to generate response');
    }
  }
}

// Factory function
export function getLLMProvider(): LLMProvider {
  return new OpenAILLMProvider();
}

export function buildPrompt(excerpts: Array<{ chunkId: string; content: string; section: string }>, question: string): string {
  const excerptsText = excerpts
    .map((ex, idx) => `[Chunk ID: ${ex.chunkId}] [Section: ${ex.section}]\n${ex.content}`)
    .join('\n\n---\n\n');
  
  return RAG_PROMPT_TEMPLATE
    .replace('{{excerpts}}', excerptsText)
    .replace('{{question}}', question);
}
