import { api } from './client';
import type {
  User, Space, SpaceMember, Task, Note,
  Milestone, SpaceFile, Comment, Activity, Notification,
  TaskStatus, Priority, SpaceCategory,
} from '../types';

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post<{ token: string; user: User }>('/auth/register', data);
export const login = (data: { email: string; password: string }) =>
  api.post<{ token: string; user: User }>('/auth/login', data);
export const getMe = () => api.get<User>('/auth/me');

// Users
export const getUsers = () => api.get<User[]>('/users');
export const getUser = (id: string) => api.get<User>(`/users/${id}`);
export const updateUser = (id: string, data: Partial<User>) =>
  api.put<User>(`/users/${id}`, data);

// Spaces
export const getSpaces = (userId?: string) =>
  api.get<Space[]>(`/spaces${userId ? `?userId=${userId}` : ''}`);
export const getSpace = (id: string) => api.get<Space & { members: (SpaceMember & { user: User })[] }>(`/spaces/${id}`);
export const createSpace = (data: { name: string; description?: string; icon?: string; category?: SpaceCategory; ownerId: string }) =>
  api.post<Space>('/spaces', data);
export const updateSpace = (id: string, data: Partial<Space>) =>
  api.put<Space>(`/spaces/${id}`, data);
export const deleteSpace = (id: string) => api.delete<void>(`/spaces/${id}`);
export const leaveSpace = (id: string, userId: string) =>
  api.post<void>(`/spaces/${id}/leave`, { userId });
export const joinSpaceByCode = (code: string, userId: string) =>
  api.post<{ space: Space; alreadyMember?: boolean }>('/spaces/join', { code, userId });
export const previewSpaceByCode = (code: string) =>
  api.get<{ space: Space; owner: User; memberCount: number }>(`/spaces/preview/${code}`);
export const getSpaceMembers = (spaceId: string) =>
  api.get<(SpaceMember & { user: User })[]>(`/spaces/${spaceId}/members`);
export const addSpaceMember = (spaceId: string, userId: string, role?: string) =>
  api.post<SpaceMember>(`/spaces/${spaceId}/members`, { userId, role });
export const removeSpaceMember = (spaceId: string, userId: string) =>
  api.delete<void>(`/spaces/${spaceId}/members/${userId}`);

// Tasks
export const getTasks = (params: { spaceId?: string; userId?: string }) => {
  const q = new URLSearchParams();
  if (params.spaceId) q.set('spaceId', params.spaceId);
  if (params.userId) q.set('userId', params.userId);
  const qs = q.toString();
  return api.get<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
};
export const getTask = (id: string) => api.get<Task>(`/tasks/${id}`);
export const createTask = (data: {
  spaceId: string; title: string; description?: string;
  priority?: Priority; status?: TaskStatus;
  assigneeId?: string; reporterId: string; dueDate?: string;
  checklist?: string[];
}) => api.post<Task>('/tasks', data);
export const updateTask = (id: string, data: Partial<Task>) =>
  api.put<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: string) => api.delete<void>(`/tasks/${id}`);
export const moveTaskStatus = (id: string, status: TaskStatus) =>
  api.patch<Task>(`/tasks/${id}/status`, { status });
export const addChecklistItem = (taskId: string, title: string) =>
  api.post<{ id: string; taskId: string; title: string; completed: boolean }>(`/tasks/${taskId}/checklist`, { title });
export const toggleChecklistItem = (taskId: string, itemId: string) =>
  api.patch<{ id: string; taskId: string; title: string; completed: boolean }>(`/tasks/${taskId}/checklist/${itemId}`, {});
export const removeChecklistItem = (taskId: string, itemId: string) =>
  api.delete<void>(`/tasks/${taskId}/checklist/${itemId}`);

// Notes
export const getNotes = (spaceId?: string) =>
  api.get<Note[]>(`/notes${spaceId ? `?spaceId=${spaceId}` : ''}`);
export const createNote = (data: { spaceId: string; title: string; content: string }) =>
  api.post<Note>('/notes', data);
export const updateNote = (id: string, data: Partial<Note>) =>
  api.put<Note>(`/notes/${id}`, data);
export const deleteNote = (id: string) => api.delete<void>(`/notes/${id}`);

// Milestones
export const getMilestones = (spaceId?: string) =>
  api.get<Milestone[]>(`/milestones${spaceId ? `?spaceId=${spaceId}` : ''}`);
export const createMilestone = (data: {
  spaceId: string; title: string; dueDate: string;
  description?: string; targetDeliverable?: string;
}) => api.post<Milestone>('/milestones', data);
export const updateMilestone = (id: string, data: Partial<Milestone>) =>
  api.put<Milestone>(`/milestones/${id}`, data);
export const deleteMilestone = (id: string) => api.delete<void>(`/milestones/${id}`);

// Files
export const getFiles = (spaceId?: string) =>
  api.get<SpaceFile[]>(`/files${spaceId ? `?spaceId=${spaceId}` : ''}`);
export const addFile = (data: {
  spaceId: string; name: string; url: string;
  type: SpaceFile['type']; size?: string; uploadedById: string;
}) => api.post<SpaceFile>('/files', data);
export const deleteFile = (id: string) => api.delete<void>(`/files/${id}`);

// Comments
export const getComments = (taskId?: string) =>
  api.get<Comment[]>(`/comments${taskId ? `?taskId=${taskId}` : ''}`);
export const addComment = (data: { taskId: string; spaceId: string; authorId: string; content: string }) =>
  api.post<Comment>('/comments', data);
export const deleteComment = (id: string) => api.delete<void>(`/comments/${id}`);

// Activities
export const getActivities = (spaceId?: string) =>
  api.get<Activity[]>(`/activities${spaceId ? `?spaceId=${spaceId}` : ''}`);
export const getFeed = (userId: string) =>
  api.get<Activity[]>(`/activities/feed?userId=${userId}`);

// Notifications
export const getNotifications = (userId: string) =>
  api.get<Notification[]>(`/notifications?userId=${userId}`);
export const markNotificationRead = (id: string) =>
  api.patch<Notification>(`/notifications/${id}/read`, {});
export const markAllNotificationsRead = (userId: string) =>
  api.patch<void>('/notifications/read-all', { userId });
