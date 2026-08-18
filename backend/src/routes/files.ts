import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const fileRoutes = Router();

function mapFile(row: any) {
  return {
    id: row.id,
    spaceId: row.space_id,
    name: row.name,
    url: row.url,
    type: row.type,
    size: row.size,
    uploadedById: row.uploaded_by_id,
    uploadedAt: row.uploaded_at,
  };
}

fileRoutes.get('/', asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  let rows;
  if (spaceId) {
    rows = db.prepare('SELECT * FROM files WHERE space_id = ? ORDER BY uploaded_at DESC').all(spaceId);
  } else {
    rows = db.prepare('SELECT * FROM files ORDER BY uploaded_at DESC').all();
  }

  res.json(rows.map(mapFile));
}));

fileRoutes.post('/', asyncHandler(async (req, res) => {
  const { spaceId, name, url, type, size, uploadedById } = req.body;
  const id = `fil_${nanoid()}`;
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO files (id, space_id, name, url, type, size, uploaded_by_id, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, spaceId, name, url, type ?? 'document', size ?? null, uploadedById, now);

  const activityId = `act_${nanoid()}`;
  db.prepare(
    'INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(activityId, spaceId, uploadedById, 'uploaded_file', name, 'Uploaded file to Files', now, null);

  const row = db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  res.status(201).json(mapFile(row));
}));

fileRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id);
  res.json({ message: 'File deleted' });
}));
