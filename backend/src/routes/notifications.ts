import { Router } from 'express';
import { query, queryOne, queryMany } from '../db/connection.js';
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
    read: row.read === true,
    createdAt: row.created_at,
  };
}

notificationRoutes.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (userId) {
    const notifications = await queryMany('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(notifications.map(mapNotification));
    return;
  }

  const notifications = await queryMany('SELECT * FROM notifications ORDER BY created_at DESC');
  res.json(notifications.map(mapNotification));
}));

notificationRoutes.patch('/:id/read', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  await query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);

  const updated = await queryOne('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
  res.json(mapNotification(updated));
}));

notificationRoutes.patch('/read-all', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: 'userId query param is required' });
    return;
  }

  await query('UPDATE notifications SET read = true WHERE user_id = $1', [userId]);

  const notifications = await queryMany('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  res.json(notifications.map(mapNotification));
}));
