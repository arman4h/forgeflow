import { Router } from 'express';
import { nanoid } from 'nanoid';
import { query, queryOne, queryMany } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const milestoneRoutes = Router();

function mapMilestone(row: any) {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    targetDeliverable: row.target_deliverable,
  };
}

milestoneRoutes.get('/', asyncHandler(async (req, res) => {
  const { spaceId } = req.query;

  let rows;
  if (spaceId) {
    rows = await queryMany('SELECT * FROM milestones WHERE space_id = $1 ORDER BY due_date ASC', [spaceId]);
  } else {
    rows = await queryMany('SELECT * FROM milestones ORDER BY due_date ASC');
  }

  res.json(rows.map(mapMilestone));
}));

milestoneRoutes.get('/:id', asyncHandler(async (req, res) => {
  const row = await queryOne('SELECT * FROM milestones WHERE id = $1', [req.params.id]);
  if (!row) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }
  res.json(mapMilestone(row));
}));

milestoneRoutes.post('/', asyncHandler(async (req, res) => {
  const { spaceId, title, description, dueDate, targetDeliverable } = req.body;
  const id = `ms_${nanoid()}`;

  await query(
    'INSERT INTO milestones (id, space_id, title, description, due_date, status, target_deliverable) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [id, spaceId, title, description ?? null, dueDate, 'upcoming', targetDeliverable ?? null]
  );

  const row = await queryOne('SELECT * FROM milestones WHERE id = $1', [id]);
  res.status(201).json(mapMilestone(row));
}));

milestoneRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM milestones WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }

  const { title, description, dueDate, status, targetDeliverable } = req.body;

  await query(
    'UPDATE milestones SET title = $1, description = $2, due_date = $3, status = $4, target_deliverable = $5 WHERE id = $6',
    [
      title ?? existing.title,
      description !== undefined ? description : existing.description,
      dueDate ?? existing.due_date,
      status ?? existing.status,
      targetDeliverable !== undefined ? targetDeliverable : existing.target_deliverable,
      req.params.id,
    ]
  );

  const row = await queryOne('SELECT * FROM milestones WHERE id = $1', [req.params.id]);
  res.json(mapMilestone(row));
}));

milestoneRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM milestones WHERE id = $1', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }

  await query('DELETE FROM milestones WHERE id = $1', [req.params.id]);
  res.json({ message: 'Milestone deleted' });
}));
