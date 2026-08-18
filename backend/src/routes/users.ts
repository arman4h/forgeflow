import { Router } from 'express';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const userRoutes = Router();

userRoutes.get('/', asyncHandler(async (_req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
}));

userRoutes.get('/:id', asyncHandler(async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}));

userRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, email, title, avatar } = req.body;

  db.prepare(
    'UPDATE users SET name = ?, email = ?, title = ?, avatar = ? WHERE id = ?'
  ).run(
    name ?? (existing as any).name,
    email ?? (existing as any).email,
    title ?? (existing as any).title,
    avatar ?? (existing as any).avatar,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
}));
