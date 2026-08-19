import { Router } from 'express';
import { nanoid } from 'nanoid';
import { query, queryOne, queryMany } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getSpaceRole, getSpaceSettings, updateSpaceSettings,
  isSpaceOwner, canManageMembers, canInviteMembers, SpaceSettings,
} from '../middleware/permissions.js';

export const spaceRoutes = Router();

function mapSpace(row: any) {
  if (!row) return null;
  return {
    ...row,
    isPersonal: row.is_personal === true,
    ownerId: row.owner_id,
    inviteCode: row.invite_code,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getMemberIds(spaceId: string): Promise<string[]> {
  const rows = await queryMany('SELECT user_id FROM space_members WHERE space_id = $1', [spaceId]) as any[];
  return rows.map((r) => r.user_id);
}

async function getSpaceWithMembers(id: string) {
  const row = await queryOne('SELECT * FROM spaces WHERE id = $1', [id]) as any;
  if (!row) return null;
  const space = mapSpace(row)!;
  space.memberIds = await getMemberIds(id);
  return space;
}

async function mapMembers(spaceId: string) {
  const members = await queryMany(
    `SELECT sm.*, u.id as user_id, u.name, u.email, u.avatar, u.title
     FROM space_members sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.space_id = $1`,
    [spaceId]
  );
  return members.map((m: any) => ({
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
}

spaceRoutes.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (userId) {
    const rows = await queryMany(
      `SELECT s.* FROM spaces s
       JOIN space_members sm ON sm.space_id = s.id
       WHERE sm.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId as string]
    ) as any[];

    const spaces = await Promise.all(rows.map(async (row) => {
      const space = mapSpace(row)!;
      space.memberIds = await getMemberIds(space.id);
      return space;
    }));

    res.json(spaces);
    return;
  }

  const rows = await queryMany('SELECT * FROM spaces ORDER BY created_at DESC') as any[];
  const spaces = await Promise.all(rows.map(async (row) => {
    const space = mapSpace(row)!;
    space.memberIds = await getMemberIds(space.id);
    return space;
  }));

  res.json(spaces);
}));

spaceRoutes.get('/preview/:code', asyncHandler(async (req, res) => {
  const row = await queryOne('SELECT * FROM spaces WHERE invite_code = $1', [req.params.code]) as any;
  if (!row) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const space = mapSpace(row)!;
  space.memberIds = await getMemberIds(space.id);

  const owner = await queryOne('SELECT * FROM users WHERE id = $1', [row.owner_id]);

  const memberCount = await queryOne(
    'SELECT COUNT(*)::int as count FROM space_members WHERE space_id = $1',
    [space.id]
  ) as any;

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

  await query(
    `INSERT INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, $9)`,
    [id, name, description ?? null, icon ?? '🚀', category ?? 'other', ownerId, inviteCode, now, now]
  );

  await query(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5)',
    [nanoid(), id, ownerId, 'owner', now]
  );

  await query(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, null)`,
    [nanoid(), id, ownerId, 'created_space', name, 'Created space', now]
  );

  const space = await getSpaceWithMembers(id);
  res.status(201).json(space);
}));

spaceRoutes.get('/:id', asyncHandler(async (req, res) => {
  const row = await queryOne('SELECT * FROM spaces WHERE id = $1', [req.params.id]) as any;
  if (!row) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const members = await mapMembers(req.params.id);
  const settings = await getSpaceSettings(req.params.id);

  const space = mapSpace(row)!;
  space.memberIds = await getMemberIds(row.id);
  space.members = members;
  space.settings = settings;

  res.json(space);
}));

spaceRoutes.put('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM spaces WHERE id = $1', [req.params.id]) as any;
  if (!existing) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const { name, description, icon, category, dueDate, _userId } = req.body;

  if (_userId) {
    const role = await getSpaceRole(_userId, req.params.id);
    if (!isSpaceOwner(role) && !(role === 'manager')) {
      res.status(403).json({ error: 'Only owner or manager can edit space settings' });
      return;
    }
  }

  const now = new Date().toISOString();

  await query(
    `UPDATE spaces SET
       name = $1, description = $2, icon = $3, category = $4, due_date = $5, updated_at = $6
     WHERE id = $7`,
    [
      name ?? existing.name,
      description ?? existing.description,
      icon ?? existing.icon,
      category ?? existing.category,
      dueDate ?? existing.due_date,
      now,
      req.params.id,
    ]
  );

  const space = await getSpaceWithMembers(req.params.id);
  res.json(space);
}));

spaceRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await queryOne('SELECT * FROM spaces WHERE id = $1', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  await query('DELETE FROM spaces WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));

spaceRoutes.post('/:id/leave', asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const spaceId = req.params.id;

  const member = await queryOne(
    'SELECT * FROM space_members WHERE space_id = $1 AND user_id = $2',
    [spaceId, userId]
  ) as any;

  if (!member) {
    res.status(404).json({ error: 'Not a member of this space' });
    return;
  }

  if (member.role === 'owner') {
    res.status(400).json({ error: 'Owner cannot leave the space. Transfer ownership or delete the space.' });
    return;
  }

  await query('DELETE FROM space_members WHERE space_id = $1 AND user_id = $2', [spaceId, userId]);

  res.json({ success: true });
}));

spaceRoutes.post('/join', asyncHandler(async (req, res) => {
  const { code, userId } = req.body;

  const space = await queryOne('SELECT * FROM spaces WHERE invite_code = $1', [code]) as any;
  if (!space) {
    res.status(404).json({ error: 'Invalid invite code' });
    return;
  }

  const settings = await getSpaceSettings(space.id);
  const existingMember = await queryOne(
    'SELECT * FROM space_members WHERE space_id = $1 AND user_id = $2',
    [space.id, userId]
  );

  if (existingMember) {
    res.json({ space: await getSpaceWithMembers(space.id), alreadyMember: true });
    return;
  }

  const now = new Date().toISOString();

  await query(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5)',
    [nanoid(), space.id, userId, 'member', now]
  );

  const user = await queryOne('SELECT * FROM users WHERE id = $1', [userId]) as any;

  await query(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, null)`,
    [nanoid(), space.id, userId, 'joined_space', space.name, `${user?.name ?? 'User'} joined the space`, now]
  );

  res.json({ space: await getSpaceWithMembers(space.id), alreadyMember: false });
}));

spaceRoutes.get('/:id/members', asyncHandler(async (req, res) => {
  const space = await queryOne('SELECT * FROM spaces WHERE id = $1', [req.params.id]);
  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const members = await mapMembers(req.params.id);
  res.json(members);
}));

spaceRoutes.post('/:id/members', asyncHandler(async (req, res) => {
  const { userId, role, _userId } = req.body;
  const spaceId = req.params.id;

  const space = await queryOne('SELECT * FROM spaces WHERE id = $1', [spaceId]) as any;
  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  if (_userId) {
    const inviterRole = await getSpaceRole(_userId, spaceId);
    const settings = await getSpaceSettings(spaceId);
    if (!canInviteMembers(inviterRole, settings)) {
      res.status(403).json({ error: 'You do not have permission to invite members' });
      return;
    }
  }

  const existingMember = await queryOne(
    'SELECT * FROM space_members WHERE space_id = $1 AND user_id = $2',
    [spaceId, userId]
  );

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

  await query(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5)',
    [member.id, member.space_id, member.user_id, member.role, member.joined_at]
  );

  const user = await queryOne('SELECT * FROM users WHERE id = $1', [userId]) as any;

  await query(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, null)`,
    [nanoid(), spaceId, userId, 'added_member', space.name, `${user?.name ?? 'User'} was added as ${member.role}`, now]
  );

  res.status(201).json({
    id: member.id,
    spaceId: member.space_id,
    userId: member.user_id,
    role: member.role,
    joinedAt: member.joined_at,
    user: user
      ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar, title: user.title }
      : undefined,
  });
}));

spaceRoutes.put('/:id/members/:userId/role', asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  const { role: newRole, _userId } = req.body;

  if (!newRole || !['owner', 'manager', 'member'].includes(newRole)) {
    res.status(400).json({ error: 'Invalid role. Must be owner, manager, or member.' });
    return;
  }

  const callerRole = await getSpaceRole(_userId, id);
  if (!isSpaceOwner(callerRole)) {
    res.status(403).json({ error: 'Only the owner can change member roles' });
    return;
  }

  const member = await queryOne(
    'SELECT * FROM space_members WHERE space_id = $1 AND user_id = $2',
    [id, userId]
  ) as any;

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  if (member.role === 'owner' && newRole !== 'owner') {
    const ownerCount = await queryOne<{ count: number }>(
      "SELECT COUNT(*)::int as count FROM space_members WHERE space_id = $1 AND role = 'owner'",
      [id]
    );
    if (ownerCount && ownerCount.count <= 1) {
      res.status(400).json({ error: 'Cannot remove the only owner. Transfer ownership first.' });
      return;
    }
  }

  const now = new Date().toISOString();
  await query(
    'UPDATE space_members SET role = $1 WHERE space_id = $2 AND user_id = $3',
    [newRole, id, userId]
  );

  const user = await queryOne('SELECT * FROM users WHERE id = $1', [userId]) as any;

  await query(
    `INSERT INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, null)`,
    [nanoid(), id, _userId, 'role_changed', user?.name ?? 'User', `role changed to ${newRole}`, now]
  );

  res.json({
    id: member.id,
    spaceId: id,
    userId,
    role: newRole,
    joinedAt: member.joined_at,
    user: user
      ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar, title: user.title }
      : undefined,
  });
}));

spaceRoutes.delete('/:id/members/:userId', asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const member = await queryOne(
    'SELECT * FROM space_members WHERE space_id = $1 AND user_id = $2',
    [id, userId]
  );

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  await query('DELETE FROM space_members WHERE space_id = $1 AND user_id = $2', [id, userId]);
  res.status(204).end();
}));

spaceRoutes.get('/:id/settings', asyncHandler(async (req, res) => {
  const space = await queryOne('SELECT id FROM spaces WHERE id = $1', [req.params.id]);
  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const settings = await getSpaceSettings(req.params.id);
  res.json(settings);
}));

spaceRoutes.put('/:id/settings', asyncHandler(async (req, res) => {
  const space = await queryOne('SELECT id FROM spaces WHERE id = $1', [req.params.id]);
  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const { _userId, ...settingsUpdates } = req.body;

  const callerRole = await getSpaceRole(_userId, req.params.id);
  if (!isSpaceOwner(callerRole)) {
    res.status(403).json({ error: 'Only the owner can change workspace settings' });
    return;
  }

  const validKeys = ['members_can_create_tasks', 'who_can_edit_task_details', 'who_can_invite'];
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(settingsUpdates)) {
    if (validKeys.includes(key)) {
      filtered[key] = value;
    }
  }

  const updated = await updateSpaceSettings(req.params.id, filtered);
  res.json(updated);
}));
