import { Router } from 'express';
import { nanoid } from 'nanoid';
import { query, queryOne } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const authRoutes = Router();

const USER_FIELDS = 'id, name, email, avatar, title, profile_completed, use_case';

function mapUser(row: any) {
  if (!row) return null;
  return {
    ...row,
    profileCompleted: row.profile_completed === true,
    useCase: row.use_case,
  };
}

async function ensurePersonalSpace(userId: string): Promise<string> {
  const personalSpaceId = `sp_personal_${userId}`;
  const existing = await queryOne('SELECT id FROM spaces WHERE id = $1', [personalSpaceId]);
  if (existing) return personalSpaceId;

  // Check if user already owns a personal space (from a different ID)
  const existingPersonal = await queryOne(
    'SELECT space_id FROM space_members WHERE user_id = $1 AND role = $2',
    [userId, 'owner']
  );
  if (existingPersonal) return existingPersonal.space_id;

  const now = new Date().toISOString();
  let inviteCode = `PF_${nanoid(10).toUpperCase()}`;

  // Retry with fresh nanoid if invite code somehow collides
  for (let i = 0; i < 3; i++) {
    try {
      await query(
        'INSERT INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9)',
        [personalSpaceId, 'My Space', 'Personal tasks and private notes.', '🏠', 'personal', userId, inviteCode, now, now]
      );
      break;
    } catch (err: any) {
      if (err.code === '23505') {
        inviteCode = `PF_${nanoid(10).toUpperCase()}`;
        continue;
      }
      throw err;
    }
  }

  await query(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (space_id, user_id) DO NOTHING',
    [`sm_personal_${userId}`, personalSpaceId, userId, 'owner', now]
  );
  return personalSpaceId;
}

// Sync Supabase auth user to our users table
authRoutes.post('/sync', asyncHandler(async (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const supaUser = data.user;
  const userId = supaUser.id;
  const email = supaUser.email || '';
  const name = supaUser.user_metadata?.name
    || supaUser.user_metadata?.full_name
    || email.split('@')[0];
  const avatar = supaUser.user_metadata?.avatar_url
    || supaUser.user_metadata?.picture
    || null;

  const now = new Date().toISOString();

  const existing = await queryOne(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [userId]);
  if (!existing) {
    await query(
      'INSERT INTO users (id, name, email, avatar, profile_completed, created_at, updated_at) VALUES ($1, $2, $3, $4, false, $5, $6) ON CONFLICT (id) DO NOTHING',
      [userId, name, email, avatar, now, now]
    );
  } else if (avatar && !existing.avatar) {
    await query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar, userId]);
  }

  await ensurePersonalSpace(userId);

  const user = await queryOne(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [userId]);
  res.json({ user: mapUser(user) });
}));

// Update profile (name, avatar, useCase)
authRoutes.put('/complete-profile', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const existing = await queryOne(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [userId]);
  if (!existing) {
    res.status(404).json({ error: 'User not found. Please sync your account first.' });
    return;
  }

  const { name, avatar, useCase } = req.body;

  await query(
    'UPDATE users SET name = $1, avatar = $2, use_case = $3, profile_completed = true, updated_at = $4 WHERE id = $5',
    [name ?? existing.name, avatar ?? existing.avatar, useCase ?? existing.use_case, new Date().toISOString(), userId]
  );

  const updated = await queryOne(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [userId]);
  res.json({ user: mapUser(updated) });
}));

// Get current user
authRoutes.get('/me', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const user = await queryOne(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [userId]);
  if (!user) {
    res.status(404).json({ error: 'User not found. Please sync your account first.' });
    return;
  }

  res.json({ user: mapUser(user) });
}));

// Ensure personal space
authRoutes.post('/ensure-personal-space', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const spaceId = await ensurePersonalSpace(userId);
  res.json({ spaceId });
}));

// No-op logout (Supabase handles session on client side)
authRoutes.post('/logout', asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out' });
}));
