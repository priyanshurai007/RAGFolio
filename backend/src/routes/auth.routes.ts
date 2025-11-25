import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { registerUser, loginUser } from '../services/auth.service';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password } = req.body;
      const user = await registerUser(email, password);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: { userId: user.id, email: user.email },
      });
    } catch (error: unknown) {
      const err = error as { code?: string; message: string };
      if (err.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password } = req.body;
      const result = await loginUser(email, password);
      
      res.json(result);
    } catch (error: unknown) {
      const err = error as { message: string };
      res.status(401).json({ error: err.message });
    }
  }
);

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({ user: req.user });
  } catch (error: unknown) {
    const err = error as { message: string };
    res.status(500).json({ error: err.message });
  }
});

export default router;
