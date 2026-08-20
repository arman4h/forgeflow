import { Router, Request, Response } from 'express';
import { query, queryOne, queryMany } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const userRoutes = Router();

function mapUser(row: any) {
  if (!row) return null;
  return {
    ...row,
    profileCompleted: row.profile_completed === true,
    useCase: row.use_case,
  };
}

userRoutes.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const users = await queryMany('SELECT id, name, email, avatar, title, profile_completed, use_case FROM users');
  res.json(users.map(mapUser));
}));

userRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await queryOne('SELECT id, name, email, avatar, title, profile_completed, use_case FROM users WHERE id = $1', [req.params.id]);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(mapUser(user));
}));

userRoutes.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await queryOne('SELECT * FROM users WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const authUserId = req.userId;
  if (authUserId && authUserId !== req.params.id) {
    res.status(403).json({ error: 'Cannot update another user profile' });
    return;
  }

  const { name, email, title, avatar, profileCompleted, useCase, profile_completed, use_case } = req.body;

  const pc = profileCompleted ?? profile_completed ?? existing.profile_completed;
  const uc = useCase ?? use_case ?? existing.use_case;

  await query(
    'UPDATE users SET name = $1, email = $2, title = $3, avatar = $4, profile_completed = $5, use_case = $6 WHERE id = $7',
    [
      name ?? existing.name,
      email ?? existing.email,
      title ?? existing.title,
      avatar ?? existing.avatar,
      pc,
      uc,
      req.params.id,
    ]
  );

  const updated = await queryOne('SELECT id, name, email, avatar, title, profile_completed, use_case FROM users WHERE id = $1', [req.params.id]);
  res.json(mapUser(updated));
}));
