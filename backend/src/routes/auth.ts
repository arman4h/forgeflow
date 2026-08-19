import { Router } from 'express';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { query, queryOne } from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const authRoutes = Router();

function generateToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  return Buffer.from(payload).toString('base64url');
}

authRoutes.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const id = `usr_${nanoid()}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  await query(
    'INSERT INTO users (id, name, email, password_hash, avatar, title) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, name, email, passwordHash, null, null]
  );

  const personalSpaceId = `sp_personal_${id}`;
  const personalInviteCode = `PERSONAL_${id.slice(-6).toUpperCase()}`;
  await query(
    'INSERT INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
    [personalSpaceId, 'My Space', 'Personal tasks and private notes.', '🏠', 'personal', id, personalInviteCode, now, now]
  );
  await query(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (space_id, user_id) DO NOTHING',
    [`sm_personal_${id}`, personalSpaceId, id, 'owner', now]
  );

  const user = await queryOne('SELECT id, name, email, avatar, title FROM users WHERE id = $1', [id]);
  const token = generateToken(id);

  res.status(201).json({ user, token });
}));

authRoutes.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = await queryOne('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (!user.password_hash) {
    res.status(401).json({ error: 'Account has no password set' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user.id);
  const { password_hash, ...safeUser } = user;

  res.json({ user: safeUser, token });
}));

authRoutes.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);
  let userId: string;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    userId = decoded.split(':')[0];
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const user = await queryOne('SELECT id, name, email, avatar, title FROM users WHERE id = $1', [userId]);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
}));

authRoutes.post('/logout', asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out' });
}));

authRoutes.post('/ensure-personal-space', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  let userId: string;
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    userId = decoded.split(':')[0];
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const personalSpaceId = `sp_personal_${userId}`;
  const existing = await queryOne('SELECT id FROM spaces WHERE id = $1', [personalSpaceId]);
  if (existing) {
    res.json({ spaceId: personalSpaceId });
    return;
  }

  const now = new Date().toISOString();
  const personalInviteCode = `PERSONAL_${userId.slice(-6).toUpperCase()}`;
  await query(
    'INSERT INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
    [personalSpaceId, 'My Space', 'Personal tasks and private notes.', '🏠', 'personal', userId, personalInviteCode, now, now]
  );
  await query(
    'INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (space_id, user_id) DO NOTHING',
    [`sm_personal_${userId}`, personalSpaceId, userId, 'owner', now]
  );

  res.json({ spaceId: personalSpaceId });
}));
