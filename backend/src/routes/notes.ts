import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const noteRoutes = Router();

function mapNote(row: any) {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    content: row.content,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

noteRoutes.get('/', asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  let rows;
  if (spaceId) {
    rows = db.prepare('SELECT * FROM notes WHERE space_id = ? ORDER BY is_pinned DESC, updated_at DESC').all(spaceId);
  } else {
    rows = db.prepare('SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC').all();
  }

  res.json(rows.map(mapNote));
}));

noteRoutes.get('/:id', asyncHandler(async (req, res) => {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
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

  db.prepare(
    'INSERT INTO notes (id, space_id, title, content, is_pinned, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)'
  ).run(id, spaceId, title, content ?? '', now, now);

  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  res.status(201).json(mapNote(row));
}));

noteRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  const { title, content, isPinned } = req.body;
  const now = new Date().toISOString();

  db.prepare(
    'UPDATE notes SET title = ?, content = ?, is_pinned = ?, updated_at = ? WHERE id = ?'
  ).run(
    title ?? (existing as any).title,
    content ?? (existing as any).content,
    isPinned !== undefined ? (isPinned ? 1 : 0) : (existing as any).is_pinned,
    now,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  res.json(mapNote(row));
}));

noteRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Note deleted' });
}));
