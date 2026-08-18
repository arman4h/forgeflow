export type SpaceRole = 'owner' | 'member' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
}

export type SpaceCategory = 'university' | 'research' | 'company' | 'club' | 'personal' | 'freelance' | 'other';

export interface SpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  role: SpaceRole;
  joinedAt: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Emoji e.g. 🎓, 🔬, 🏢, 👥, 🏠
  category: SpaceCategory;
  isPersonal?: boolean;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  reporterId: string;
  dueDate?: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type FileType = 'document' | 'pdf' | 'link' | 'image' | 'code' | 'archive';

export interface SpaceFile {
  id: string;
  spaceId: string;
  name: string;
  url: string;
  type: FileType;
  size?: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  spaceId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type ActivityAction = 
  | 'created_space'
  | 'joined_space'
  | 'created_task'
  | 'completed_task'
  | 'status_changed'
  | 'assigned_task'
  | 'commented'
  | 'uploaded_file';

export interface Activity {
  id: string;
  spaceId: string;
  userId: string;
  action: ActivityAction;
  entityTitle: string;
  details?: string;
  timestamp: string;
  taskId?: string;
}

export type NotificationType = 
  | 'task_assigned'
  | 'comment'
  | 'deadline_approaching'
  | 'space_invitation'
  | 'task_completed';

export interface Notification {
  id: string;
  userId: string;
  spaceId?: string;
  taskId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export type AppRoute = 
  | 'home'
  | 'my_space'
  | 'space_detail'
  | 'join_preview'
  | 'settings';

export type SpaceTab = 'overview' | 'tasks' | 'board' | 'milestones' | 'notes' | 'files' | 'members' | 'activity';
export type MySpaceTab = 'tasks' | 'personal' | 'calendar';
export type Theme = 'light' | 'dark';

export interface Note {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  targetDeliverable?: string;
}
