import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const spaceRoutes = Router();

function mapSpace(row: any) {
  if (!row) return null;
  return {
    ...row,
    isPersonal: row.is_personal ? true : false,
    ownerId: row.owner_id,
    inviteCode: row.invite_code,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getMemberIds(spaceId: string): string[] {
  const rows = db.prepare('SELECT user_id FROM space_members WHERE space_id = ?').all(spaceId) as any[];
  return rows.map((r) => r.user_id);
}

function getSpaceWithMembers(id: string) {
  const row = db.prepare('SELECT * FROM spaces WHERE id = ?').get(id) as any;
  if (!row) return null;
  const space = mapSpace(row)!;
  space.memberIds = getMemberIds(id);
  return space;
}

spaceRoutes.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (userId) {
    const rows = db.prepare(
      `SELECT s.* FROM spaces s
       JOIN space_members sm ON sm.space_id = s.id
       WHERE sm.user_id = ?
       ORDER BY s.created_at DESC`
    ).all(userId as string) as any[];

    const spaces = rows.map((row) => {
      const space = mapSpace(row)!;
      space.memberIds = getMemberIds(space.id);
      return space;
    });

    res.json(spaces);
    return;
  }

  const rows = db.prepare('SELECT * FROM spaces ORDER BY created_at DESC').all() as any[];
  const spaces = rows.map((row) => {
    const space = mapSpace(row)!;
    space.memberIds = getMemberIds(space.id);
    return space;
  });

  res.json(spaces);
}));

spaceRoutes.get('/preview/:code', asyncHandler(async (req, res) => {
  const row = db.prepare('SELECT * FROM spaces WHERE invite_code = ?').get(req.params.code) as any;
  if (!row) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const space = mapSpace(row)!;
  space.memberIds = getMemberIds(space.id);

  const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(row.owner_id);

  const memberCount = db.prepare(
    'SELECT COUNT(*) as count FROM space_members WHERE space_id = ?'
  ).get(space.id) as any;

  res.json({
    space,
    owner,
    memberCount: memberCount.count,
  });
}));

spaceRoutes.post('/', asyncHandler(async (req, res) => {
  const { name, description, icon, category, ownerId } = req.body;
  const id = nanoid();
  const inviteCode = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || nanoid(6);
  const now = new Date().toISOString();

  const insertSpace = db.prepare(
    `INSERT INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMember = db.prepare(
    `INSERT INTO space_members (id, space_id, user_id, role, joined_at)
     VALUES (?, ?, ?, ?, ?)`
  );

  const insertActivity = db.prepare(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const createSpace = db.transaction(() => {
    insertSpace.run(id, name, description ?? null, icon ?? '🚀', category ?? 'other', 0, ownerId, inviteCode, now, now);
    insertMember.run(nanoid(), id, ownerId, 'owner', now);
    insertActivity.run(nanoid(), id, ownerId, 'created_space', name, 'Created space', now, null);
  });

  createSpace();

  const space = getSpaceWithMembers(id);
  res.status(201).json(space);
}));

spaceRoutes.get('/:id', asyncHandler(async (req, res) => {
  const row = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const members = db.prepare(
    `SELECT sm.*, u.id as user_id, u.name, u.email, u.avatar, u.title
     FROM space_members sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.space_id = ?`
  ).all(req.params.id);

  const mappedMembers = members.map((m: any) => ({
    id: m.id,
    spaceId: m.space_id,
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    user: {
      id: m.user_id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      title: m.title,
    },
  }));

  const space = mapSpace(row)!;
  space.memberIds = getMemberIds(row.id);
  space.members = mappedMembers;

  res.json(space);
}));

spaceRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const { name, description, icon, category, dueDate } = req.body;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE spaces SET
       name = ?, description = ?, icon = ?, category = ?, due_date = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    name ?? (existing as any).name,
    description ?? (existing as any).description,
    icon ?? (existing as any).icon,
    category ?? (existing as any).category,
    dueDate ?? (existing as any).due_date,
    now,
    req.params.id
  );

  const space = getSpaceWithMembers(req.params.id);
  res.json(space);
}));

spaceRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  db.prepare('DELETE FROM spaces WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

spaceRoutes.post('/:id/leave', asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const spaceId = req.params.id;

  const member = db.prepare(
    'SELECT * FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(spaceId, userId) as any;

  if (!member) {
    res.status(404).json({ error: 'Not a member of this space' });
    return;
  }

  db.prepare('DELETE FROM space_members WHERE space_id = ? AND user_id = ?').run(spaceId, userId);

  res.json({ success: true });
}));

spaceRoutes.post('/join', asyncHandler(async (req, res) => {
  const { code, userId } = req.body;

  const space = db.prepare('SELECT * FROM spaces WHERE invite_code = ?').get(code) as any;
  if (!space) {
    res.status(404).json({ error: 'Invalid invite code' });
    return;
  }

  const existingMember = db.prepare(
    'SELECT * FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(space.id, userId);

  if (existingMember) {
    res.json({ space: getSpaceWithMembers(space.id), alreadyMember: true });
    return;
  }

  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)'
  ).run(nanoid(), space.id, userId, 'member', now);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  db.prepare(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nanoid(),
    space.id,
    userId,
    'joined_space',
    space.name,
    `${user?.name ?? 'User'} joined the space`,
    now,
    null
  );

  res.json({ space: getSpaceWithMembers(space.id), alreadyMember: false });
}));

spaceRoutes.get('/:id/members', asyncHandler(async (req, res) => {
  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const members = db.prepare(
    `SELECT sm.*, u.id as user_id, u.name, u.email, u.avatar, u.title
     FROM space_members sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.space_id = ?`
  ).all(req.params.id);

  const mappedMembers = members.map((m: any) => ({
    id: m.id,
    spaceId: m.space_id,
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    user: {
      id: m.user_id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      title: m.title,
    },
  }));

  res.json(mappedMembers);
}));

spaceRoutes.post('/:id/members', asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const spaceId = req.params.id;

  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(spaceId);
  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const existingMember = db.prepare(
    'SELECT * FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(spaceId, userId);

  if (existingMember) {
    res.status(409).json({ error: 'User is already a member' });
    return;
  }

  const now = new Date().toISOString();
  const member = {
    id: nanoid(),
    space_id: spaceId,
    user_id: userId,
    role: role ?? 'member',
    joined_at: now,
  };

  db.prepare(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)'
  ).run(member.id, member.space_id, member.user_id, member.role, member.joined_at);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  db.prepare(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nanoid(),
    spaceId,
    userId,
    'added_member',
    (space as any).name,
    `${user?.name ?? 'User'} was added as ${member.role}`,
    now,
    null
  );

  res.status(201).json({
    id: member.id,
    spaceId: member.space_id,
    userId: member.user_id,
    role: member.role,
    joinedAt: member.joined_at,
    user: user
      ? { id: (user as any).id, name: (user as any).name, email: (user as any).email, avatar: (user as any).avatar, title: (user as any).title }
      : undefined,
  });
}));

spaceRoutes.delete('/:id/members/:userId', asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const member = db.prepare(
    'SELECT * FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(id, userId);

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  db.prepare('DELETE FROM space_members WHERE space_id = ? AND user_id = ?').run(id, userId);
  res.status(204).end();
}));
