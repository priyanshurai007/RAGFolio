import { Request } from 'express';
import { AuthPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
