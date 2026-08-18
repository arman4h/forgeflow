import { Router } from 'express';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { nanoid } from 'nanoid';

export const commentRoutes = Router();

function mapComment(row: any) {
  return {
    id: row.id,
    taskId: row.task_id,
    spaceId: row.space_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

commentRoutes.get('/', asyncHandler(async (req, res) => {
  const { taskId } = req.query;

  if (taskId) {
    const comments = db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY rowid DESC').all(taskId);
    res.json(comments.map(mapComment));
    return;
  }

  const comments = db.prepare('SELECT * FROM comments ORDER BY rowid DESC').all();
  res.json(comments.map(mapComment));
}));

commentRoutes.post('/', asyncHandler(async (req, res) => {
  const { taskId, spaceId, authorId, content } = req.body;

  if (!taskId || !spaceId || !authorId || !content) {
    res.status(400).json({ error: 'taskId, spaceId, authorId, and content are required' });
    return;
  }

  const id = nanoid();
  const createdAt = new Date().toISOString();

  db.prepare(
    'INSERT INTO comments (id, task_id, space_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, taskId, spaceId, authorId, content, createdAt);

  db.prepare(
    'INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(nanoid(), spaceId, authorId, 'commented', 'a task', content, createdAt, taskId);

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.status(201).json(mapComment(comment));
}));

commentRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));
