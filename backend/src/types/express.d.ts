/// <reference types="express" />

// Augment Express Request type to include user property
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}
