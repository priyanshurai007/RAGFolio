import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import {
  processResume,
  queryResume,
  getResumeById,
  getUserResumes,
  deleteResume,
  updateResumeData,
} from '../services/resume.service';
import { config } from '../config';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = config.upload.uploadDir;
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

// Upload and process resume
router.post(
  '/upload',
  authMiddleware,
  upload.single('resume'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      console.log('=== Upload Request Started ===');
      console.log('User ID:', req.user.userId);
      console.log('File:', req.file.originalname);
      console.log('File path:', req.file.path);
      console.log('File size:', req.file.size);
      console.log('Parser URL:', process.env.PARSER_SERVICE_URL);
      
      const resume = await processResume(
        req.user.userId,
        req.file.originalname,
        req.file.path
      );
      
      console.log('=== Upload Success ===');
      
      res.status(201).json({
        message: 'Resume uploaded and processed successfully',
        resume: {
          id: resume.id,
          filename: resume.filename,
          parsedData: resume.parsedData,
        },
      });
    } catch (error: unknown) {
      const err = error as { message: string; stack?: string };
      console.error('=== Upload Error ===');
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Return user-friendly error message
      let userMessage = 'Upload failed. Please try again.';
      
      if (err.message.includes('Parser service error')) {
        userMessage = 'Parser service unavailable. Please wait 60 seconds and try again (cold start).';
      } else if (err.message.includes('OpenAI')) {
        userMessage = 'AI service error. Please try again.';
      } else if (err.message.includes('Database') || err.message.includes('database')) {
        userMessage = 'Database error. Please contact support.';
      }
      
      res.status(500).json({ 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Get all resumes for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const resumes = await getUserResumes(req.user.userId);
    res.json({ resumes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific resume
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await getResumeById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json({ resume });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update resume parsed data
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await getResumeById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await updateResumeData(req.params.id, req.body.parsedData);
    
    res.json({ message: 'Resume updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete resume
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await getResumeById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await deleteResume(req.params.id);
    
    // Delete file from disk
    try {
      await fs.unlink(resume.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Query resume (Q&A)
router.post('/:id/query', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await getResumeById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { question } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const result = await queryResume(req.params.id, question);
    
    res.json(result);
  } catch (error: any) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
