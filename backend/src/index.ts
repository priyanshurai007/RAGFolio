import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostics endpoint
app.get('/diagnostics', async (req: express.Request, res: express.Response) => {
  try {
    const { query: dbQuery } = await import('./db');
    const { checkParserHealth } = await import('./services/parser.service');
    
    // Check database
    let dbStatus = 'unknown';
    try {
      await dbQuery('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error: ' + (error as Error).message;
    }
    
    // Check parser service
    const parserHealthy = await checkParserHealth();
    
    res.json({
      status: 'running',
      environment: config.env,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        parser: {
          url: config.parser.serviceUrl,
          healthy: parserHealthy,
          status: parserHealthy ? 'connected' : 'unavailable'
        },
        vectorDb: {
          provider: config.vectorDb.provider
        }
      },
      config: {
        uploadDir: config.upload.uploadDir,
        maxFileSize: config.upload.maxFileSizeMB + 'MB',
        chunkSize: config.rag.chunkSize,
        topK: config.rag.topK
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Diagnostics failed',
      message: (error as Error).message 
    });
  }
});

// Root endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ 
    service: 'RAGfolio Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      diagnostics: '/diagnostics',
      auth: '/api/auth/*',
      resumes: '/api/resumes/*'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Vector DB Provider: ${config.vectorDb.provider}`);
});

export default app;
