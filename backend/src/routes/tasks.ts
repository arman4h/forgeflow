import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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
    completed: row.completed === 1,
  };
}

function getChecklistItems(taskId: string) {
  const rows = db.prepare('SELECT * FROM checklist_items WHERE task_id = ?').all(taskId);
  return rows.map(mapChecklistItem);
}

function getTaskWithChecklist(row: any) {
  return { ...mapTask(row), checklist: getChecklistItems(row.id) };
}

// GET /           -> Get tasks
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { spaceId, userId } = req.query;

    let query = 'SELECT * FROM tasks';
    const conditions: string[] = [];
    const params: any[] = [];

    if (spaceId) {
      conditions.push('space_id = ?');
      params.push(spaceId);
    }
    if (userId) {
      conditions.push('assignee_id = ?');
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks.map(getTaskWithChecklist));
  })
);

// GET /:id        -> Get single task
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(getTaskWithChecklist(row));
  })
);

// POST /          -> Create task
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { spaceId, title, description, priority, status, assigneeId, reporterId, dueDate, checklist } = req.body;
    const now = new Date().toISOString();
    const id = nanoid();

    const insertTask = db.prepare(`
      INSERT INTO tasks (id, space_id, title, description, priority, status, assignee_id, reporter_id, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertChecklist = db.prepare(`
      INSERT INTO checklist_items (id, task_id, title, completed)
      VALUES (?, ?, ?, 0)
    `);

    const insertActivity = db.prepare(`
      INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertNotification = db.prepare(`
      INSERT INTO notifications (id, user_id, space_id, task_id, title, message, type, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    const runAll = db.transaction(() => {
      insertTask.run(id, spaceId, title, description || null, priority || 'medium', status || 'todo', assigneeId || null, reporterId, dueDate || null, now, now);

      if (Array.isArray(checklist)) {
        for (const item of checklist) {
          insertChecklist.run(nanoid(), id, typeof item === 'string' ? item : item.title);
        }
      }

      insertActivity.run(nanoid(), spaceId, reporterId, 'created', title, `created task "${title}"`, now, id);

      if (assigneeId && assigneeId !== reporterId) {
        insertNotification.run(
          nanoid(),
          assigneeId,
          spaceId,
          id,
          'New task assigned',
          `You have been assigned to "${title}"`,
          'task_assigned'
        );
      }
    });

    runAll();

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json(getTaskWithChecklist(task));
  })
);

// PUT /:id        -> Update task
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const { title, description, priority, status, assigneeId, reporterId, dueDate } = req.body;
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

    db.prepare(`
      UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, assignee_id = ?, reporter_id = ?, due_date = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedFields.title,
      updatedFields.description,
      updatedFields.priority,
      updatedFields.status,
      updatedFields.assignee_id,
      updatedFields.reporter_id,
      updatedFields.due_date,
      updatedFields.updated_at,
      req.params.id
    );

    if (status && status !== existing.status) {
      db.prepare(`
        INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nanoid(),
        existing.space_id,
        existing.reporter_id,
        'status_changed',
        existing.title,
        `status changed from "${existing.status}" to "${status}"`,
        now,
        existing.id
      );
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(getTaskWithChecklist(task));
  })
);

// DELETE /:id     -> Delete task
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(204).send();
  })
);

// PATCH /:id/status -> Change status
router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const { status } = req.body;
    const now = new Date().toISOString();

    db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?').run(status, now, req.params.id);

    db.prepare(`
      INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nanoid(),
      existing.space_id,
      existing.reporter_id,
      'status_changed',
      existing.title,
      `status changed from "${existing.status}" to "${status}"`,
      now,
      existing.id
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(getTaskWithChecklist(task));
  })
);

// POST /:id/checklist      -> Add checklist item
router.post(
  '/:id/checklist',
  asyncHandler(async (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const { title } = req.body;
    const id = nanoid();
    db.prepare('INSERT INTO checklist_items (id, task_id, title, completed) VALUES (?, ?, ?, 0)').run(id, req.params.id, title);

    const item = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id);
    res.status(201).json(mapChecklistItem(item));
  })
);

// PATCH /:id/checklist/:itemId -> Toggle checklist item
router.patch(
  '/:id/checklist/:itemId',
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM checklist_items WHERE id = ? AND task_id = ?').get(req.params.itemId, req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }

    const newCompleted = existing.completed === 0 ? 1 : 0;
    db.prepare('UPDATE checklist_items SET completed = ? WHERE id = ?').run(newCompleted, req.params.itemId);

    const item = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(req.params.itemId);
    res.json(mapChecklistItem(item));
  })
);

// DELETE /:id/checklist/:itemId -> Remove checklist item
router.delete(
  '/:id/checklist/:itemId',
  asyncHandler(async (req, res) => {
    const result = db.prepare('DELETE FROM checklist_items WHERE id = ? AND task_id = ?').run(req.params.itemId, req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }
    res.status(204).send();
  })
);

export { router as taskRoutes };
