import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
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
    rows = db.prepare('SELECT * FROM milestones WHERE space_id = ? ORDER BY due_date ASC').all(spaceId);
  } else {
    rows = db.prepare('SELECT * FROM milestones ORDER BY due_date ASC').all();
  }

  res.json(rows.map(mapMilestone));
}));

milestoneRoutes.get('/:id', asyncHandler(async (req, res) => {
  const row = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  if (!row) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }
  res.json(mapMilestone(row));
}));

milestoneRoutes.post('/', asyncHandler(async (req, res) => {
  const { spaceId, title, description, dueDate, targetDeliverable } = req.body;
  const id = `ms_${nanoid()}`;

  db.prepare(
    'INSERT INTO milestones (id, space_id, title, description, due_date, status, target_deliverable) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, spaceId, title, description ?? null, dueDate, 'upcoming', targetDeliverable ?? null);

  const row = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
  res.status(201).json(mapMilestone(row));
}));

milestoneRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }

  const { title, description, dueDate, status, targetDeliverable } = req.body;

  db.prepare(
    'UPDATE milestones SET title = ?, description = ?, due_date = ?, status = ?, target_deliverable = ? WHERE id = ?'
  ).run(
    title ?? (existing as any).title,
    description !== undefined ? description : (existing as any).description,
    dueDate ?? (existing as any).due_date,
    status ?? (existing as any).status,
    targetDeliverable !== undefined ? targetDeliverable : (existing as any).target_deliverable,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  res.json(mapMilestone(row));
}));

milestoneRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Milestone not found' });
    return;
  }

  db.prepare('DELETE FROM milestones WHERE id = ?').run(req.params.id);
  res.json({ message: 'Milestone deleted' });
}));
