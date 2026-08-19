import { Router } from 'express';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trackflow-secret-key-change-in-prod';

// Simple JWT implementation (no jsonwebtoken dependency)
function signToken(payload: { userId: string }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  // Simple HMAC-like signature using base64 encoding (NOT for production security)
  const signature = btoa(`${header}.${body}.${JWT_SECRET}`);
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const id = `usr_${nanoid()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(
    id, name.trim(), email.trim().toLowerCase(), passwordHash
  );

  // Create personal space for the new user
  const spaceId = `sp_personal_${id}`;
  const personalInviteCode = `PERSONAL_${id.slice(-6)}`;
  db.prepare('INSERT INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    spaceId, 'My Space', 'Personal tasks, study checklists, and private notes.', '🏠', 'personal', 1, id, personalInviteCode, new Date().toISOString()
  );
  db.prepare('INSERT INTO space_members (id, space_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)').run(
    `sm_${nanoid()}`, spaceId, id, 'owner', new Date().toISOString()
  );

  const token = signToken({ userId: id });
  const user = db.prepare('SELECT id, name, email, avatar, title FROM users WHERE id = ?').get(id);

  res.status(201).json({ token, user });
}));

authRoutes.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // Handle legacy users without password (from seed data)
  if (!user.password_hash) {
    res.status(401).json({ error: 'This account has no password set. Please register a new account.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user.id });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, title: user.title } });
}));

authRoutes.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const user = db.prepare('SELECT id, name, email, avatar, title FROM users WHERE id = ?').get(payload.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
}));

authRoutes.post('/logout', (_req, res) => {
  res.json({ success: true });
});
