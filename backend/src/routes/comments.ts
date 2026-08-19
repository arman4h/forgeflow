import { Router } from 'express';
import { query, queryOne, queryMany } from '../db/connection.js';
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
    const comments = await queryMany('SELECT * FROM comments WHERE task_id = $1 ORDER BY created_at DESC', [taskId]);
    res.json(comments.map(mapComment));
    return;
  }

  const comments = await queryMany('SELECT * FROM comments ORDER BY created_at DESC');
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

  await query(
    'INSERT INTO comments (id, task_id, space_id, author_id, content, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, taskId, spaceId, authorId, content, createdAt]
  );

  await query(
    'INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [nanoid(), spaceId, authorId, 'commented', 'a task', content, createdAt, taskId]
  );

  const comment = await queryOne('SELECT * FROM comments WHERE id = $1', [id]);
  res.status(201).json(mapComment(comment));
}));

commentRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const comment = await queryOne('SELECT * FROM comments WHERE id = $1', [req.params.id]);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  await query('DELETE FROM comments WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));
