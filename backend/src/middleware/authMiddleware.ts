import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  supabaseAdmin.auth.getUser(token)
    .then(({ data, error }) => {
      if (error || !data.user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      req.userId = data.user.id;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Token verification failed' });
    });
}
