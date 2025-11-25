import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface AuthPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwtSecret) as AuthPayload;
}

export async function registerUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const userId = uuidv4();
  
  const result = await query(
    'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, created_at',
    [userId, email, passwordHash]
  );
  
  return result.rows[0];
}

export async function loginUser(email: string, password: string) {
  const result = await query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = result.rows[0];
  const isValid = await comparePassword(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = generateToken({ userId: user.id, email: user.email });
  
  return { user: { userId: user.id, email: user.email }, token };
}

export async function getUserById(userId: string) {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [userId]
  );
  
  return result.rows[0] || null;
}
