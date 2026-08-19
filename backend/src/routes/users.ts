import { Router } from 'express';
import { query, queryOne, queryMany } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const userRoutes = Router();

userRoutes.get('/', asyncHandler(async (_req, res) => {
  const users = await queryMany('SELECT * FROM users');
  res.json(users);
}));

userRoutes.get('/:id', asyncHandler(async (req, res) => {
  const user = await queryOne('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}));

userRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM users WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, email, title, avatar } = req.body;

  await query(
    'UPDATE users SET name = $1, email = $2, title = $3, avatar = $4 WHERE id = $5',
    [
      name ?? existing.name,
      email ?? existing.email,
      title ?? existing.title,
      avatar ?? existing.avatar,
      req.params.id,
    ]
  );

  const updated = await queryOne('SELECT * FROM users WHERE id = $1', [req.params.id]);
  res.json(updated);
}));
