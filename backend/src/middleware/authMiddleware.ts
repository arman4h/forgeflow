import { Request, Response, NextFunction } from 'express';

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
  let userId: string;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    userId = decoded.split(':')[0];
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  if (!userId) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.userId = userId;
  next();
}
