import { Router } from 'express';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const notificationRoutes = Router();

function mapNotification(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    spaceId: row.space_id,
    taskId: row.task_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read === 1,
    createdAt: row.created_at,
  };
}

notificationRoutes.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (userId) {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY rowid DESC').all(userId);
    res.json(notifications.map(mapNotification));
    return;
  }

  const notifications = db.prepare('SELECT * FROM notifications ORDER BY rowid DESC').all();
  res.json(notifications.map(mapNotification));
}));

notificationRoutes.patch('/:id/read', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);

  const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  res.json(mapNotification(updated));
}));

notificationRoutes.patch('/read-all', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: 'userId query param is required' });
    return;
  }

  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);

  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY rowid DESC').all(userId);
  res.json(notifications.map(mapNotification));
}));
