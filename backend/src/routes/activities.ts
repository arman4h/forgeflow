import { Router } from 'express';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const activityRoutes = Router();

function mapActivity(row: any) {
  return {
    id: row.id,
    spaceId: row.space_id,
    userId: row.user_id,
    action: row.action,
    entityTitle: row.entity_title,
    details: row.details,
    timestamp: row.timestamp,
    taskId: row.task_id,
  };
}

activityRoutes.get('/', asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  if (spaceId) {
    const activities = db.prepare('SELECT * FROM activities WHERE space_id = ? ORDER BY rowid DESC').all(spaceId);
    res.json(activities.map(mapActivity));
    return;
  }

  const activities = db.prepare('SELECT * FROM activities ORDER BY rowid DESC').all();
  res.json(activities.map(mapActivity));
}));

activityRoutes.get('/feed', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: 'userId query param is required' });
    return;
  }

  const spaceRows = db.prepare('SELECT space_id FROM space_members WHERE user_id = ?').all(userId) as any[];
  const spaceIds = spaceRows.map((r) => r.space_id);

  if (spaceIds.length === 0) {
    res.json([]);
    return;
  }

  const placeholders = spaceIds.map(() => '?').join(', ');
  const activities = db.prepare(`SELECT * FROM activities WHERE space_id IN (${placeholders}) ORDER BY rowid DESC`).all(...spaceIds);

  res.json(activities.map(mapActivity));
}));
