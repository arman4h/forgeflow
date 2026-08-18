import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import {
  User,
  Space,
  SpaceMember,
  Task,
  SpaceFile,
  Comment,
  Activity,
  Notification,
  AppRoute,
  SpaceTab,
  MySpaceTab,
  TaskStatus,
  Priority,
  SpaceCategory,
  Theme,
  Note,
  Milestone,
} from '../types';

interface InvitePreviewData {
  space: Space;
  owner: User;
  memberCount: number;
}

interface AppContextType {
  // Theme state
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Current user & authentication simulation
  currentUser: User;
  users: User[];
  switchCurrentUser: (userId: string) => void;

  // Spaces
  spaces: Space[];
  currentSpace: Space | null;
  mySpaces: Space[];
  joinedSpaces: Space[];
  personalSpace: Space;
  switchSpace: (spaceId: string | null) => void;
  createSpace: (name: string, description?: string, icon?: string, category?: SpaceCategory) => Space;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
  deleteSpace: (spaceId: string) => void;
  leaveSpace: (spaceId: string) => void;
  inviteMember: (spaceId: string, email: string) => void;

  // Join Flow
  joinSpaceByCode: (code: string) => { success: boolean; space?: Space; message?: string };
  activeInvitePreview: InvitePreviewData | null;
  setActiveInvitePreview: (invite: InvitePreviewData | null) => void;
  openInvitePreviewByCode: (code: string) => boolean;

  // Tasks
  tasks: Task[];
  myTasks: Task[];
  spaceTasks: Task[];
  createTask: (params: {
    spaceId: string;
    title: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
    checklist?: string[];
  }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompleted: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addChecklistItem: (taskId: string, title: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;

  // Notes
  notes: Note[];
  spaceNotes: (spaceId: string) => Note[];
  createNote: (spaceId: string, title: string, content: string) => Note;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;

  // Milestones
  milestones: Milestone[];
  spaceMilestones: (spaceId: string) => Milestone[];
  createMilestone: (
    spaceId: string,
    title: string,
    dueDate: string,
    description?: string,
    targetDeliverable?: string
  ) => Milestone;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (milestoneId: string) => void;

  // Files
  files: SpaceFile[];
  spaceFiles: SpaceFile[];
  addFile: (spaceId: string, name: string, url: string, type: SpaceFile['type'], size?: string) => void;
  deleteFile: (fileId: string) => void;

  // Comments
  comments: Comment[];
  taskComments: (taskId: string) => Comment[];
  addComment: (taskId: string, content: string) => void;
  deleteComment: (commentId: string) => void;

  // Activity & Notifications
  activities: Activity[];
  spaceActivities: Activity[];
  crossSpaceActivities: Activity[];
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Navigation & View state
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  selectedSpaceId: string | null;
  selectedSpaceTab: SpaceTab;
  setSelectedSpaceTab: (tab: SpaceTab) => void;
  mySpaceTab: MySpaceTab;
  setMySpaceTab: (tab: MySpaceTab) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;

  // Modals
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isCreateSpaceOpen: boolean;
  setIsCreateSpaceOpen: (open: boolean) => void;
  isJoinSpaceOpen: boolean;
  setIsJoinSpaceOpen: (open: boolean) => void;
  isInviteMembersOpen: boolean;
  setIsInviteMembersOpen: (open: boolean) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isUploadFileOpen: boolean;
  setIsUploadFileOpen: (open: boolean) => void;

  // Helpers
  getUserById: (id?: string) => User | undefined;
  getSpaceById: (id?: string) => Space | undefined;
  getSpaceMembers: (spaceId: string) => (SpaceMember & { user: User })[];
  getSpaceProgress: (spaceId: string) => number;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'forgeflow_spaces_v3_';
const DEFAULT_USER_ID = 'usr_1';

let idCounter = 0;
export const generateUniqueId = (prefix: string): string => {
  idCounter = (idCounter + 1) % 1000000;
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${Date.now()}_${idCounter}_${randomStr}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // ── Theme state ──
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}theme`);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}theme`, theme);
    } catch { /* ignore */ }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#f4f4f5';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#09090b';
    }
  }, [theme]);

  const toggleTheme = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  // ── UI-only state ──
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}current_user`) || DEFAULT_USER_ID;
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedSpaceTab, setSelectedSpaceTab] = useState<SpaceTab>('overview');
  const [mySpaceTab, setMySpaceTab] = useState<MySpaceTab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeInvitePreview, setActiveInvitePreview] = useState<InvitePreviewData | null>(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isJoinSpaceOpen, setIsJoinSpaceOpen] = useState(false);
  const [isInviteMembersOpen, setIsInviteMembersOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}current_user`, currentUserId);
  }, [currentUserId]);

  // ── React Query: Data fetching ──
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.getUsers();
      return res;
    },
  });

  const { data: spaces = [] } = useQuery<Space[]>({
    queryKey: ['spaces', currentUserId],
    queryFn: async () => {
      const res = await api.getSpaces(currentUserId);
      return res;
    },
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.getTasks({});
      return res;
    },
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await api.getNotes();
      return res;
    },
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: async () => {
      const res = await api.getMilestones();
      return res;
    },
  });

  const { data: files = [] } = useQuery<SpaceFile[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await api.getFiles();
      return res;
    },
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments'],
    queryFn: async () => {
      const res = await api.getComments();
      return res;
    },
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.getActivities();
      return res;
    },
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', currentUserId],
    queryFn: async () => {
      const res = await api.getNotifications(currentUserId);
      return res;
    },
    enabled: !!currentUserId,
  });

  // ── Derived values ──
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0] || { id: currentUserId, name: 'Loading...', email: '' };
  }, [users, currentUserId]);

  const personalSpace = useMemo(() => {
    const existing = spaces.find(
      s => s.isPersonal && (s.ownerId === currentUser.id || s.memberIds.includes(currentUser.id))
    );
    if (existing) return existing;
    return {
      id: `sp_personal_${currentUser.id}`,
      name: 'My Space',
      description: 'Personal tasks, study checklists, and private notes.',
      icon: '🏠',
      category: 'personal' as SpaceCategory,
      isPersonal: true,
      ownerId: currentUser.id,
      memberIds: [currentUser.id],
      inviteCode: 'PERSONAL',
      createdAt: new Date().toISOString(),
    };
  }, [spaces, currentUser]);

  const mySpaces = useMemo(() => {
    return spaces.filter(s => s.memberIds.includes(currentUser.id));
  }, [spaces, currentUser]);

  const joinedSpaces = useMemo(() => {
    return mySpaces.filter(s => !s.isPersonal);
  }, [mySpaces]);

  const currentSpace = useMemo(() => {
    if (!selectedSpaceId) return null;
    return spaces.find(s => s.id === selectedSpaceId) || null;
  }, [spaces, selectedSpaceId]);

  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assigneeId === currentUser.id);
  }, [tasks, currentUser]);

  const spaceTasks = useMemo(() => {
    if (!selectedSpaceId) return [];
    return tasks.filter(t => t.spaceId === selectedSpaceId);
  }, [tasks, selectedSpaceId]);

  const spaceFiles = useMemo(() => {
    if (!selectedSpaceId) return [];
    return files.filter(f => f.spaceId === selectedSpaceId);
  }, [files, selectedSpaceId]);

  const spaceActivities = useMemo(() => {
    if (!selectedSpaceId) return [];
    return activities.filter(a => a.spaceId === selectedSpaceId);
  }, [activities, selectedSpaceId]);

  const crossSpaceActivities = useMemo(() => {
    const userSpaceIds = new Set(mySpaces.map(s => s.id));
    return activities.filter(a => userSpaceIds.has(a.spaceId));
  }, [activities, mySpaces]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => n.userId === currentUser.id && !n.read).length;
  }, [notifications, currentUser]);

  // ── Helper functions (pure lookups) ──
  const getUserById = (id?: string) => {
    if (!id) return undefined;
    return users.find(u => u.id === id);
  };

  const getSpaceById = (id?: string) => {
    if (!id) return undefined;
    return spaces.find(s => s.id === id);
  };

  const spaceNotes = (spaceId: string) => notes.filter(n => n.spaceId === spaceId);
  const spaceMilestones = (spaceId: string) => milestones.filter(m => m.spaceId === spaceId);
  const taskComments = (taskId: string) => comments.filter(c => c.taskId === taskId);

  const getSpaceMembers = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return [];
    return (space.memberIds || []).map(userId => {
      const user = users.find(u => u.id === userId);
      return {
        id: `sm_${spaceId}_${userId}`,
        spaceId,
        userId,
        role: userId === space.ownerId ? ('owner' as const) : ('member' as const),
        joinedAt: space.createdAt,
        user: user || { id: userId, name: 'Team Member', email: 'member@forgeflow.app' },
      };
    });
  };

  const getSpaceProgress = (spaceId: string) => {
    const relevantTasks = tasks.filter(t => t.spaceId === spaceId);
    if (relevantTasks.length === 0) return 0;
    const completed = relevantTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / relevantTasks.length) * 100);
  };

  // ── UI Actions ──
  const switchCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
    queryClient.invalidateQueries({ queryKey: ['spaces'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const switchSpace = (spaceId: string | null) => {
    if (!spaceId) {
      setSelectedSpaceId(null);
      setCurrentRoute('home');
      return;
    }
    if (spaceId === 'personal' || spaceId === personalSpace.id) {
      setSelectedSpaceId(personalSpace.id);
      setCurrentRoute('my_space');
      return;
    }
    setSelectedSpaceId(spaceId);
    setCurrentRoute('space_detail');
    setSelectedSpaceTab('overview');
  };

  // ── Mutations ──
  const createSpaceMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; icon?: string; category?: SpaceCategory; ownerId: string }) =>
      api.createSpace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Space> }) => api.updateSpace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: (id: string) => api.deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const leaveSpaceMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => api.leaveSpace(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });

  const joinSpaceByCodeMutation = useMutation({
    mutationFn: ({ code, userId }: { code: string; userId: string }) => api.joinSpaceByCode(code, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const addSpaceMemberMutation = useMutation({
    mutationFn: ({ spaceId, userId, role }: { spaceId: string; userId: string; role?: string }) =>
      api.addSpaceMember(spaceId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      spaceId: string; title: string; description?: string;
      priority?: Priority; status?: TaskStatus;
      assigneeId?: string; reporterId: string; dueDate?: string;
      checklist?: string[];
    }) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => api.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const moveTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.moveTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const toggleChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      api.toggleChecklistItem(taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const addChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      api.addChecklistItem(taskId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const removeChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      api.removeChecklistItem(taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: { spaceId: string; title: string; content: string }) => api.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => api.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: {
      spaceId: string; title: string; dueDate: string;
      description?: string; targetDeliverable?: string;
    }) => api.createMilestone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) => api.updateMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => api.deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const addFileMutation = useMutation({
    mutationFn: (data: {
      spaceId: string; name: string; url: string;
      type: SpaceFile['type']; size?: string; uploadedById: string;
    }) => api.addFile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => api.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { taskId: string; spaceId: string; authorId: string; content: string }) =>
      api.addComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => api.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: (userId: string) => api.markAllNotificationsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // ── Action wrappers (same signatures as before) ──
  const createSpace = (
    name: string,
    description?: string,
    icon: string = '🚀',
    category: SpaceCategory = 'university'
  ): Space => {
    const optimisticSpace: Space = {
      id: generateUniqueId('sp'),
      name: name.trim(),
      description: description?.trim() || undefined,
      icon,
      category,
      ownerId: currentUser.id,
      memberIds: [currentUser.id],
      inviteCode: name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SPACE',
      createdAt: new Date().toISOString(),
    };

    createSpaceMutation.mutate({
      name: name.trim(),
      description: description?.trim(),
      icon,
      category,
      ownerId: currentUser.id,
    });

    setSelectedSpaceId(optimisticSpace.id);
    setCurrentRoute('space_detail');
    setSelectedSpaceTab('overview');

    return optimisticSpace;
  };

  const updateSpace = (spaceId: string, updates: Partial<Space>) => {
    updateSpaceMutation.mutate({ id: spaceId, data: updates });
  };

  const deleteSpace = (spaceId: string) => {
    deleteSpaceMutation.mutate(spaceId);
    if (selectedSpaceId === spaceId) {
      setSelectedSpaceId(null);
      setCurrentRoute('home');
    }
  };

  const leaveSpace = (spaceId: string) => {
    leaveSpaceMutation.mutate({ id: spaceId, userId: currentUser.id });
    if (selectedSpaceId === spaceId) {
      setSelectedSpaceId(null);
      setCurrentRoute('home');
    }
  };

  const inviteMember = (spaceId: string, email: string) => {
    addSpaceMemberMutation.mutate({ spaceId, userId: email, role: 'member' });
  };

  const joinSpaceByCode = (code: string): { success: boolean; space?: Space; message?: string } => {
    const cleanCode = code.trim().toUpperCase();
    const existing = spaces.find(s => s.inviteCode.toUpperCase() === cleanCode);

    if (existing && existing.memberIds.includes(currentUser.id)) {
      switchSpace(existing.id);
      setActiveInvitePreview(null);
      return { success: true, space: existing, message: 'You are already a member of this space.' };
    }

    joinSpaceByCodeMutation.mutate(
      { code: cleanCode, userId: currentUser.id },
      {
        onSuccess: (result) => {
          if (result?.space) {
            switchSpace(result.space.id);
          }
          setActiveInvitePreview(null);
        },
      }
    );

    if (existing) {
      return { success: true, space: existing };
    }
    return { success: true };
  };

  const openInvitePreviewByCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    const space = spaces.find(s => s.inviteCode.toUpperCase() === cleanCode);
    if (!space) return false;

    const owner = getUserById(space.ownerId) || {
      id: space.ownerId,
      name: 'Project Lead',
      email: 'lead@forgeflow.app',
    };

    setActiveInvitePreview({
      space,
      owner,
      memberCount: space.memberIds.length,
    });
    setCurrentRoute('join_preview');
    return true;
  };

  const createTask = (params: {
    spaceId: string;
    title: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
    checklist?: string[];
  }): Task => {
    const optimisticTask: Task = {
      id: generateUniqueId('tsk'),
      spaceId: params.spaceId,
      title: params.title.trim(),
      description: params.description?.trim() || undefined,
      priority: params.priority || 'medium',
      status: params.status || 'todo',
      assigneeId: params.assigneeId || undefined,
      reporterId: currentUser.id,
      dueDate: params.dueDate || undefined,
      checklist: (params.checklist || []).map(title => ({
        id: generateUniqueId('chk'),
        title,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createTaskMutation.mutate({
      spaceId: params.spaceId,
      title: params.title.trim(),
      description: params.description?.trim(),
      priority: params.priority || 'medium',
      status: params.status || 'todo',
      assigneeId: params.assigneeId,
      reporterId: currentUser.id,
      dueDate: params.dueDate,
      checklist: params.checklist,
    });

    return optimisticTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id: taskId, data: updates });
  };

  const deleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    moveTaskStatus(taskId, nextStatus);
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    moveTaskStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    toggleChecklistItemMutation.mutate({ taskId, itemId });
  };

  const addChecklistItem = (taskId: string, title: string) => {
    if (!title.trim()) return;
    addChecklistItemMutation.mutate({ taskId, title: title.trim() });
  };

  const removeChecklistItem = (taskId: string, itemId: string) => {
    removeChecklistItemMutation.mutate({ taskId, itemId });
  };

  const createNote = (spaceId: string, title: string, content: string): Note => {
    const optimisticNote: Note = {
      id: generateUniqueId('note'),
      spaceId,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createNoteMutation.mutate({
      spaceId,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
    });

    return optimisticNote;
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    updateNoteMutation.mutate({ id: noteId, data: updates });
  };

  const deleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };

  const createMilestone = (
    spaceId: string,
    title: string,
    dueDate: string,
    description?: string,
    targetDeliverable?: string
  ): Milestone => {
    const optimisticMilestone: Milestone = {
      id: generateUniqueId('ms'),
      spaceId,
      title: title.trim(),
      dueDate,
      description: description?.trim() || undefined,
      targetDeliverable: targetDeliverable?.trim() || undefined,
      status: 'upcoming',
    };

    createMilestoneMutation.mutate({
      spaceId,
      title: title.trim(),
      dueDate,
      description: description?.trim(),
      targetDeliverable: targetDeliverable?.trim(),
    });

    return optimisticMilestone;
  };

  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    updateMilestoneMutation.mutate({ id: milestoneId, data: updates });
  };

  const deleteMilestone = (milestoneId: string) => {
    deleteMilestoneMutation.mutate(milestoneId);
  };

  const addFile = (
    spaceId: string,
    name: string,
    url: string,
    type: SpaceFile['type'] = 'document',
    size: string = '1.2 MB'
  ) => {
    addFileMutation.mutate({
      spaceId,
      name: name.trim(),
      url,
      type,
      size,
      uploadedById: currentUser.id,
    });
  };

  const deleteFile = (fileId: string) => {
    deleteFileMutation.mutate(fileId);
  };

  const addComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    addCommentMutation.mutate({
      taskId,
      spaceId: task.spaceId,
      authorId: currentUser.id,
      content: content.trim(),
    });
  };

  const deleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const markNotificationRead = (id: string) => {
    markNotificationReadMutation.mutate(id);
  };

  const markAllNotificationsRead = () => {
    markAllNotificationsReadMutation.mutate(currentUser.id);
  };

  const resetAllData = () => {
    queryClient.invalidateQueries();
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        currentUser,
        users,
        switchCurrentUser,
        spaces,
        currentSpace,
        mySpaces,
        joinedSpaces,
        personalSpace,
        switchSpace,
        createSpace,
        updateSpace,
        deleteSpace,
        leaveSpace,
        inviteMember,
        joinSpaceByCode,
        activeInvitePreview,
        setActiveInvitePreview,
        openInvitePreviewByCode,
        tasks,
        myTasks,
        spaceTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        moveTaskStatus,
        toggleChecklistItem,
        addChecklistItem,
        removeChecklistItem,
        notes,
        spaceNotes,
        createNote,
        updateNote,
        deleteNote,
        milestones,
        spaceMilestones,
        createMilestone,
        updateMilestone,
        deleteMilestone,
        files,
        spaceFiles,
        addFile,
        deleteFile,
        comments,
        taskComments,
        addComment,
        deleteComment,
        activities,
        spaceActivities,
        crossSpaceActivities,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        currentRoute,
        setCurrentRoute,
        selectedSpaceId,
        selectedSpaceTab,
        setSelectedSpaceTab,
        mySpaceTab,
        setMySpaceTab,
        selectedTaskId,
        setSelectedTaskId,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isCreateSpaceOpen,
        setIsCreateSpaceOpen,
        isJoinSpaceOpen,
        setIsJoinSpaceOpen,
        isInviteMembersOpen,
        setIsInviteMembersOpen,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isUploadFileOpen,
        setIsUploadFileOpen,
        getUserById,
        getSpaceById,
        getSpaceMembers,
        getSpaceProgress,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
