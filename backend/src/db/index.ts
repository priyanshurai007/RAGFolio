import { Pool } from 'pg';
import { config } from '../config';

// Parse DATABASE_URL or use individual config
const getDatabaseConfig = () => {
  const dbUrl = config.database.url;
  
  // If DATABASE_URL is a full connection string, parse it
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    const url = new URL(dbUrl);
    const password = url.password ? decodeURIComponent(url.password) : undefined;
    
    const dbConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading '/'
      user: url.username || 'postgres',
      password: password || '',
    };
    
    // Ensure password is a string
    if (typeof dbConfig.password !== 'string') {
      dbConfig.password = String(dbConfig.password);
    }
    
    return dbConfig;
  }
  
  // Fallback to individual env vars
  return {
    connectionString: dbUrl,
  };
};

export const pool = new Pool(getDatabaseConfig());

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  parsed_data: any;
  created_at: Date;
  updated_at: Date;
}

export interface Chunk {
  id: string;
  resume_id: string;
  chunk_index: number;
  content: string;
  section: string;
  page_number?: number;
  embedding?: number[];
  vector_id?: string;
  created_at: Date;
}
