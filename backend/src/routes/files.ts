import { Router } from 'express';
import { nanoid } from 'nanoid';
import { query, queryOne, queryMany } from '../db/connection.js';
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
    rows = await queryMany('SELECT * FROM files WHERE space_id = $1 ORDER BY uploaded_at DESC', [spaceId]);
  } else {
    rows = await queryMany('SELECT * FROM files ORDER BY uploaded_at DESC');
  }

  res.json(rows.map(mapFile));
}));

fileRoutes.post('/', asyncHandler(async (req, res) => {
  const { spaceId, name, url, type, size, uploadedById } = req.body;
  const id = `fil_${nanoid()}`;
  const now = new Date().toISOString();

  await query(
    'INSERT INTO files (id, space_id, name, url, type, size, uploaded_by_id, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, spaceId, name, url, type ?? 'document', size ?? null, uploadedById, now]
  );

  await query(
    'INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id) VALUES ($1, $2, $3, $4, $5, $6, $7, null)',
    [`act_${nanoid()}`, spaceId, uploadedById, 'uploaded_file', name, 'Uploaded file to Files', now]
  );

  const row = await queryOne('SELECT * FROM files WHERE id = $1', [id]);
  res.status(201).json(mapFile(row));
}));

fileRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM files WHERE id = $1', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  await query('DELETE FROM files WHERE id = $1', [req.params.id]);
  res.json({ message: 'File deleted' });
}));
