import { Router } from 'express';
import { nanoid } from 'nanoid';
import { query, queryOne, queryMany } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getSpaceRole, getSpaceSettings, canCreateTask, canEditTask,
  canChangeStatus, canDeleteTask, canAssignTask,
} from '../middleware/permissions.js';

const router = Router();

function mapTask(row: any) {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    reporterId: row.reporter_id,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapChecklistItem(row: any) {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    completed: row.completed === true,
  };
}

async function getChecklistItems(taskId: string) {
  const rows = await queryMany('SELECT * FROM checklist_items WHERE task_id = $1', [taskId]);
  return rows.map(mapChecklistItem);
}

async function getTaskWithChecklist(row: any) {
  return { ...mapTask(row), checklist: await getChecklistItems(row.id) };
}

router.get('/', asyncHandler(async (req, res) => {
  const { spaceId, userId } = req.query;

  let queryStr = 'SELECT * FROM tasks';
  const conditions: string[] = [];
  const params: any[] = [];

  if (spaceId) {
    conditions.push(`space_id = $${params.length + 1}`);
    params.push(spaceId);
  }
  if (userId) {
    conditions.push(`assignee_id = $${params.length + 1}`);
    params.push(userId);
  }

  if (conditions.length > 0) {
    queryStr += ' WHERE ' + conditions.join(' AND ');
  }

  queryStr += ' ORDER BY created_at DESC';

  const tasks = await queryMany(queryStr, params);
  const tasksWithChecklist = await Promise.all(tasks.map(getTaskWithChecklist));
  res.json(tasksWithChecklist);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const row = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  if (!row) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(await getTaskWithChecklist(row));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { spaceId, title, description, priority, status, assigneeId, reporterId, dueDate, checklist } = req.body;

  const role = await getSpaceRole(reporterId, spaceId);
  const settings = await getSpaceSettings(spaceId);

  if (!canCreateTask(role, settings)) {
    res.status(403).json({ error: 'You do not have permission to create tasks in this space' });
    return;
  }

  if (assigneeId && !canAssignTask(role)) {
    res.status(403).json({ error: 'You do not have permission to assign tasks' });
    return;
  }

  const now = new Date().toISOString();
  const id = nanoid();

  await query(
    `INSERT INTO tasks (id, space_id, title, description, priority, status, assignee_id, reporter_id, due_date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [id, spaceId, title, description || null, priority || 'medium', status || 'todo', assigneeId || null, reporterId, dueDate || null, now, now]
  );

  if (Array.isArray(checklist)) {
    for (const item of checklist) {
      await query(
        'INSERT INTO checklist_items (id, task_id, title, completed) VALUES ($1, $2, $3, false)',
        [nanoid(), id, typeof item === 'string' ? item : item.title]
      );
    }
  }

  await query(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [nanoid(), spaceId, reporterId, 'created', title, `created task "${title}"`, now, id]
  );

  if (assigneeId && assigneeId !== reporterId) {
    await query(
      `INSERT INTO notifications (id, user_id, space_id, task_id, title, message, type, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)`,
      [nanoid(), assigneeId, spaceId, id, 'New task assigned', `You have been assigned to "${title}"`, 'task_assigned', now]
    );
  }

  const task = await queryOne('SELECT * FROM tasks WHERE id = $1', [id]);
  res.status(201).json(await getTaskWithChecklist(task));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const userId = req.body._userId;
  const role = await getSpaceRole(userId, existing.space_id);
  const settings = await getSpaceSettings(existing.space_id);

  if (!canEditTask(role, existing, userId, settings)) {
    res.status(403).json({ error: 'You do not have permission to edit this task' });
    return;
  }

  const { title, description, priority, status, assigneeId, reporterId, dueDate } = req.body;

  if (assigneeId !== undefined && assigneeId !== existing.assignee_id) {
    if (!canAssignTask(role)) {
      res.status(403).json({ error: 'You do not have permission to assign tasks' });
      return;
    }
  }

  if (title !== undefined && title !== existing.title && !canEditTask(role, existing, userId, settings)) {
    res.status(403).json({ error: 'You do not have permission to edit task details' });
    return;
  }

  const now = new Date().toISOString();

  const updatedFields = {
    title: title ?? existing.title,
    description: description !== undefined ? description : existing.description,
    priority: priority ?? existing.priority,
    status: status ?? existing.status,
    assignee_id: assigneeId !== undefined ? assigneeId : existing.assignee_id,
    reporter_id: reporterId ?? existing.reporter_id,
    due_date: dueDate !== undefined ? dueDate : existing.due_date,
    updated_at: now,
  };

  await query(
    `UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4, assignee_id = $5, reporter_id = $6, due_date = $7, updated_at = $8
     WHERE id = $9`,
    [updatedFields.title, updatedFields.description, updatedFields.priority, updatedFields.status, updatedFields.assignee_id, updatedFields.reporter_id, updatedFields.due_date, updatedFields.updated_at, req.params.id]
  );

  if (status && status !== existing.status) {
    await query(
      `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nanoid(), existing.space_id, userId, 'status_changed', existing.title, `status changed from "${existing.status}" to "${status}"`, now, existing.id]
    );
  }

  const task = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  res.json(await getTaskWithChecklist(task));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const userId = req.query.userId as string || req.body._userId;
  const role = await getSpaceRole(userId, existing.space_id);

  if (!canDeleteTask(role)) {
    res.status(403).json({ error: 'You do not have permission to delete tasks' });
    return;
  }

  await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).send();
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const { status, userId } = req.body;
  const role = await getSpaceRole(userId, existing.space_id);

  if (!canChangeStatus(role, existing, userId)) {
    res.status(403).json({ error: 'You do not have permission to change this task status' });
    return;
  }

  const now = new Date().toISOString();

  await query('UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3', [status, now, req.params.id]);

  await query(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [nanoid(), existing.space_id, userId, 'status_changed', existing.title, `status changed from "${existing.status}" to "${status}"`, now, existing.id]
  );

  const task = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  res.json(await getTaskWithChecklist(task));
}));

router.post('/:id/checklist', asyncHandler(async (req, res) => {
  const task = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const { title } = req.body;
  const id = nanoid();
  await query('INSERT INTO checklist_items (id, task_id, title, completed) VALUES ($1, $2, $3, false)', [id, req.params.id, title]);

  const item = await queryOne('SELECT * FROM checklist_items WHERE id = $1', [id]);
  res.status(201).json(mapChecklistItem(item));
}));

router.patch('/:id/checklist/:itemId', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM checklist_items WHERE id = $1 AND task_id = $2', [req.params.itemId, req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Checklist item not found' });
    return;
  }

  const newCompleted = existing.completed === false;
  await query('UPDATE checklist_items SET completed = $1 WHERE id = $2', [newCompleted, req.params.itemId]);

  const item = await queryOne('SELECT * FROM checklist_items WHERE id = $1', [req.params.itemId]);
  res.json(mapChecklistItem(item));
}));

router.delete('/:id/checklist/:itemId', asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM checklist_items WHERE id = $1 AND task_id = $2', [req.params.itemId, req.params.id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Checklist item not found' });
    return;
  }
  res.status(204).send();
}));

export { router as taskRoutes };
