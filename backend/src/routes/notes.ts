import { Router } from 'express';
import { nanoid } from 'nanoid';
import { query, queryOne, queryMany } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const noteRoutes = Router();

function mapNote(row: any) {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    content: row.content,
    isPinned: row.is_pinned === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

noteRoutes.get('/', asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  let rows;
  if (spaceId) {
    rows = await queryMany('SELECT * FROM notes WHERE space_id = $1 ORDER BY is_pinned DESC, updated_at DESC', [spaceId]);
  } else {
    rows = await queryMany('SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC');
  }

  res.json(rows.map(mapNote));
}));

noteRoutes.get('/:id', asyncHandler(async (req, res) => {
  const row = await queryOne('SELECT * FROM notes WHERE id = $1', [req.params.id]);
  if (!row) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(mapNote(row));
}));

noteRoutes.post('/', asyncHandler(async (req, res) => {
  const { spaceId, title, content } = req.body;
  const id = `note_${nanoid()}`;
  const now = new Date().toISOString();

  await query(
    'INSERT INTO notes (id, space_id, title, content, is_pinned, created_at, updated_at) VALUES ($1, $2, $3, $4, false, $5, $6)',
    [id, spaceId, title, content ?? '', now, now]
  );

  const row = await queryOne('SELECT * FROM notes WHERE id = $1', [id]);
  res.status(201).json(mapNote(row));
}));

noteRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM notes WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  const { title, content, isPinned } = req.body;
  const now = new Date().toISOString();

  await query(
    'UPDATE notes SET title = $1, content = $2, is_pinned = $3, updated_at = $4 WHERE id = $5',
    [
      title ?? existing.title,
      content ?? existing.content,
      isPinned !== undefined ? isPinned : existing.is_pinned,
      now,
      req.params.id,
    ]
  );

  const row = await queryOne('SELECT * FROM notes WHERE id = $1', [req.params.id]);
  res.json(mapNote(row));
}));

noteRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM notes WHERE id = $1', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  await query('DELETE FROM notes WHERE id = $1', [req.params.id]);
  res.json({ message: 'Note deleted' });
}));
