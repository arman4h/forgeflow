import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { userRoutes } from './routes/users.js';
import { spaceRoutes } from './routes/spaces.js';
import { taskRoutes } from './routes/tasks.js';
import { noteRoutes } from './routes/notes.js';
import { milestoneRoutes } from './routes/milestones.js';
import { fileRoutes } from './routes/files.js';
import { commentRoutes } from './routes/comments.js';
import { activityRoutes } from './routes/activities.js';
import { notificationRoutes } from './routes/notifications.js';
import { uploadRoutes } from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (sync, me, complete-profile, ensure-personal-space)
app.use('/api/auth', authMiddleware, authRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// Protected routes
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/spaces', authMiddleware, spaceRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/notes', authMiddleware, noteRoutes);
app.use('/api/milestones', authMiddleware, milestoneRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);
app.use('/api/activities', authMiddleware, activityRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

app.use(errorHandler);

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`TaskFlow API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
