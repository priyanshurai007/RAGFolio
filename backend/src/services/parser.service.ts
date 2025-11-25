import axios from 'axios';
import path from 'path';
import { config } from '../config';

export interface GitHubAnalysis {
  verified: boolean;
  username?: string;
  url: string;
  name?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
  recent_repos?: Array<{
    name: string;
    description?: string;
    language?: string;
    stars: number;
    forks: number;
    updated: string;
  }>;
  languages?: string[];
  total_stars?: number;
  recent_commits?: number;
  activity_level?: string;
  error?: string;
}

export interface LeetCodeAnalysis {
  verified: boolean;
  username?: string;
  url: string;
  accessible?: boolean;
  problems_solved?: number;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  error?: string;
}

export interface LinkedInAnalysis {
  verified: boolean;
  url: string;
  accessible: boolean;
  note?: string;
  error?: string;
}

export interface PortfolioAnalysis {
  url: string;
  accessible: boolean;
  title?: string;
  description?: string;
  technologies_mentioned?: string[];
  status_code?: number;
  error?: string;
}

export interface ParsedResume {
  raw_text: string;
  sections: {
    [key: string]: string;
  };
  metadata: {
    total_pages?: number;
    word_count?: number;
  };
  links?: Array<{
    url: string;
    category: string;
    text: string;
  }>;
  profile_analysis?: {
    github?: GitHubAnalysis;
    leetcode?: LeetCodeAnalysis;
    linkedin?: LinkedInAnalysis;
    portfolio?: PortfolioAnalysis[];
    other_profiles?: Array<{
      category: string;
      url: string;
      accessible: boolean;
      verified: boolean;
      error?: string;
    }>;
    email?: string[];
    phone?: string[];
    summary?: {
      total_links: number;
      verified_profiles: number;
      coding_activity_found: boolean;
    };
  };
}

export async function parseResume(filePath: string): Promise<ParsedResume> {
  try {
    const fs = require('fs');
    const FormData = require('form-data');
    
    // Convert to absolute path if relative
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    console.log('Sending file to parser:', absolutePath);
    
    // Create form data with file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(absolutePath), {
      filename: path.basename(absolutePath),
    });
    
    const response = await axios.post(
      `${config.parser.serviceUrl}/parse`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.detail || error.message;
      console.error('Parser error:', errorMsg);
      throw new Error(`Parser service error: ${errorMsg}`);
    }
    throw error;
  }
}

export async function checkParserHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${config.parser.serviceUrl}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}
