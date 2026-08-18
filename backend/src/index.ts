import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { userRoutes } from './routes/users.js';
import { spaceRoutes } from './routes/spaces.js';
import { taskRoutes } from './routes/tasks.js';
import { noteRoutes } from './routes/notes.js';
import { milestoneRoutes } from './routes/milestones.js';
import { fileRoutes } from './routes/files.js';
import { commentRoutes } from './routes/comments.js';
import { activityRoutes } from './routes/activities.js';
import { notificationRoutes } from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

initializeDatabase();

app.listen(PORT, () => {
  console.log(`ForgeFlow API running on http://localhost:${PORT}`);
});

export default app;
