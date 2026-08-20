import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import { supabase } from '../config/supabase';
import {
  User,
  Space,
  SpaceMember,
  SpaceRole,
  SpaceSettings,
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

  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleSignIn: (data: { id: string; name: string; email: string; avatar?: string }) => Promise<void>;
  completeProfile: (data: { name?: string; avatar?: string; useCase?: string }) => Promise<void>;
  logout: () => void;

  // Current user
  currentUser: User;
  users: User[];

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
  joinSpaceByCode: (code: string) => Promise<{ success: boolean; space?: Space; message?: string }>;
  activeInvitePreview: InvitePreviewData | null;
  setActiveInvitePreview: (invite: InvitePreviewData | null) => void;
  openInvitePreviewByCode: (code: string) => Promise<boolean>;
  justJoinedSpace: Space | null;
  dismissWelcome: () => void;

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
  createTaskDefaultSpaceId: string | null;
  setCreateTaskDefaultSpaceId: (spaceId: string | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isUploadFileOpen: boolean;
  setIsUploadFileOpen: (open: boolean) => void;

  // Helpers
  getUserById: (id?: string) => User | undefined;
  getSpaceById: (id?: string) => Space | undefined;
  getSpaceMembers: (spaceId: string) => (SpaceMember & { user: User })[];
  getSpaceRole: (spaceId: string) => SpaceRole | null;
  getSpaceSettings: (spaceId: string) => SpaceSettings;
  getSpaceProgress: (spaceId: string) => number;
  updateMemberRole: (spaceId: string, userId: string, role: string) => void;
  updateSpaceSettings: (spaceId: string, settings: Partial<SpaceSettings>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'taskflow_v1_';

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

  // ── Auth state ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}current_user`) || '';
  });

  // ── Check auth on mount + listen for changes ──
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        localStorage.setItem(`${STORAGE_PREFIX}current_user`, session.user.id);
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
        api.syncUser().then(() => {
          api.ensurePersonalSpace().catch(() => {});
        }).catch(() => {});
      }
      setAuthLoading(false);
    }).catch(() => {
      if (mounted) setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        setAuthLoading(false);
        localStorage.setItem(`${STORAGE_PREFIX}current_user`, session.user.id);
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
        api.syncUser().then(() => {
          api.ensurePersonalSpace().catch(() => {});
        }).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId('');
        setIsAuthenticated(false);
        setAuthLoading(false);
        localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
        queryClient.clear();
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          setCurrentUserId(session.user.id);
          setIsAuthenticated(true);
          localStorage.setItem(`${STORAGE_PREFIX}current_user`, session.user.id);
          if (window.location.pathname !== '/') {
            window.history.replaceState({}, '', '/');
          }
          api.syncUser().then(() => {
            api.ensurePersonalSpace().catch(() => {});
          }).catch(() => {});
        }
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Handle ?join=CODE from URL ──
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      window.history.replaceState({}, '', window.location.pathname);
      openInvitePreviewByCode(joinCode);
    }
  }, [isAuthenticated, authLoading]);

  // ── Auth actions (Supabase handles actual auth) ──
  const loginFn = async (_email: string, _password: string) => {
    // AuthPage handles this directly via supabase.auth.signInWithPassword
    // This is kept for interface compatibility
  };

  const registerFn = async (_name: string, _email: string, _password: string) => {
    // AuthPage handles this directly via supabase.auth.signUp
    // This is kept for interface compatibility
  };

  const googleSignInFn = async (_data: { id: string; name: string; email: string; avatar?: string }) => {
    // AuthPage handles this directly via supabase.auth.signInWithOAuth
    // This is kept for interface compatibility
  };

  const completeProfileFn = async (data: { name?: string; avatar?: string; useCase?: string }) => {
    const result = await api.completeProfile(data);
    if (result.user) {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
    setCurrentUserId('');
    setIsAuthenticated(false);
    queryClient.clear();
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedSpaceTab, setSelectedSpaceTab] = useState<SpaceTab>('overview');
  const [mySpaceTab, setMySpaceTab] = useState<MySpaceTab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeInvitePreview, setActiveInvitePreview] = useState<InvitePreviewData | null>(null);
  const [justJoinedSpace, setJustJoinedSpace] = useState<Space | null>(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isJoinSpaceOpen, setIsJoinSpaceOpen] = useState(false);
  const [isInviteMembersOpen, setIsInviteMembersOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDefaultSpaceId, setCreateTaskDefaultSpaceId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);

  // ── React Query: Data fetching ──
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.getUsers();
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: spaces = [] } = useQuery<Space[]>({
    queryKey: ['spaces', currentUserId],
    queryFn: async () => {
      const res = await api.getSpaces(currentUserId);
      return res;
    },
    enabled: isAuthenticated && !!currentUserId,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.getTasks({});
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await api.getNotes();
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: async () => {
      const res = await api.getMilestones();
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: files = [] } = useQuery<SpaceFile[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await api.getFiles();
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments'],
    queryFn: async () => {
      const res = await api.getComments();
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.getActivities();
      return res;
    },
    enabled: isAuthenticated,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', currentUserId],
    queryFn: async () => {
      const res = await api.getNotifications(currentUserId);
      return res;
    },
    enabled: isAuthenticated && !!currentUserId,
  });

  // ── Current space detail (with member roles + settings) ──
  const { data: currentSpaceDetail } = useQuery({
    queryKey: ['spaceDetail', selectedSpaceId],
    queryFn: async () => {
      if (!selectedSpaceId) return null;
      return api.getSpace(selectedSpaceId);
    },
    enabled: isAuthenticated && !!selectedSpaceId,
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
      inviteCode: `PERSONAL_${currentUser.id.slice(-6)}`,
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

  const getSpaceMembers = (spaceId: string): (SpaceMember & { user: User })[] => {
    if (spaceId === selectedSpaceId && currentSpaceDetail?.members) {
      return currentSpaceDetail.members;
    }
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return [];
    return (space.memberIds || []).map(userId => {
      const user = users.find(u => u.id === userId);
      return {
        id: `sm_${spaceId}_${userId}`,
        spaceId,
        userId,
        role: (userId === space.ownerId ? 'owner' : 'member') as SpaceRole,
        joinedAt: space.createdAt,
        user: user || { id: userId, name: 'Team Member', email: 'member@taskflow.app' },
      };
    });
  };

  const getSpaceRole = (spaceId: string): SpaceRole | null => {
    if (spaceId === selectedSpaceId && currentSpaceDetail?.members) {
      const member = currentSpaceDetail.members.find(m => m.userId === currentUserId);
      return member?.role ?? null;
    }
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return null;
    if (space.ownerId === currentUserId) return 'owner';
    if (space.memberIds?.includes(currentUserId)) return 'member';
    return null;
  };

  const getSpaceSettings = (spaceId: string) => {
    if (spaceId === selectedSpaceId && currentSpaceDetail?.settings) {
      return currentSpaceDetail.settings;
    }
    return {
      members_can_create_tasks: true,
      who_can_edit_task_details: 'assignee_and_managers' as const,
      who_can_invite: 'managers_only' as const,
    };
  };

  const getSpaceProgress = (spaceId: string) => {
    const relevantTasks = tasks.filter(t => t.spaceId === spaceId);
    if (relevantTasks.length === 0) return 0;
    const completed = relevantTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / relevantTasks.length) * 100);
  };

  // ── UI Actions ──
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
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['spaces', currentUserId] });
      const previous = queryClient.getQueryData<Space[]>(['spaces', currentUserId]);
      queryClient.setQueryData<Space[]>(['spaces', currentUserId], (old) => {
        if (!old) return old;
        const optimisticSpace: Space = {
          id: generateUniqueId('sp'),
          name: variables.name.trim(),
          description: variables.description?.trim() || undefined,
          icon: variables.icon || '🚀',
          category: variables.category || 'university',
          ownerId: variables.ownerId,
          memberIds: [variables.ownerId],
          inviteCode: variables.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SPACE',
          createdAt: new Date().toISOString(),
        };
        return [...old, optimisticSpace];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaces', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Space> }) => api.updateSpace(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['spaces', currentUserId] });
      const previous = queryClient.getQueryData<Space[]>(['spaces', currentUserId]);
      queryClient.setQueryData<Space[]>(['spaces', currentUserId], (old) => {
        if (!old) return old;
        return old.map(s => s.id === id ? { ...s, ...data } : s);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaces', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
    },
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: (id: string) => api.deleteSpace(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['spaces', currentUserId] });
      const previous = queryClient.getQueryData<Space[]>(['spaces', currentUserId]);
      queryClient.setQueryData<Space[]>(['spaces', currentUserId], (old) => {
        if (!old) return old;
        return old.filter(s => s.id !== id);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaces', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const leaveSpaceMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => api.leaveSpace(id, userId),
    onMutate: async ({ id, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['spaces', currentUserId] });
      const previous = queryClient.getQueryData<Space[]>(['spaces', currentUserId]);
      queryClient.setQueryData<Space[]>(['spaces', currentUserId], (old) => {
        if (!old) return old;
        return old.map(s => s.id === id ? { ...s, memberIds: s.memberIds.filter(mId => mId !== userId) } : s);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaces', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
    },
  });

  const joinSpaceByCodeMutation = useMutation({
    mutationFn: ({ code, userId }: { code: string; userId: string }) => api.joinSpaceByCode(code, userId),
    onMutate: async ({ code }) => {
      const previous = queryClient.getQueryData<Space[]>(['spaces', currentUserId]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaces', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const addSpaceMemberMutation = useMutation({
    mutationFn: ({ spaceId, userId, role }: { spaceId: string; userId: string; role?: string }) =>
      api.addSpaceMember(spaceId, userId, role, currentUserId),
    onMutate: async ({ spaceId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['spaces', currentUserId] });
      const previous = queryClient.getQueryData<Space[]>(['spaces', currentUserId]);
      queryClient.setQueryData<Space[]>(['spaces', currentUserId], (old) => {
        if (!old) return old;
        return old.map(s => {
          if (s.id === spaceId && !s.memberIds.includes(userId)) {
            return { ...s, memberIds: [...s.memberIds, userId] };
          }
          return s;
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaces', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ spaceId, userId, role }: { spaceId: string; userId: string; role: string }) =>
      api.updateMemberRole(spaceId, userId, role, currentUserId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['spaceDetail', variables.spaceId] });
      const previous = queryClient.getQueryData<any>(['spaceDetail', variables.spaceId]);
      queryClient.setQueryData<any>(['spaceDetail', variables.spaceId], (old: any) => {
        if (!old?.members) return old;
        return {
          ...old,
          members: old.members.map((m: any) =>
            m.userId === variables.userId ? { ...m, role: variables.role } : m
          ),
        };
      });
      return { previous };
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaceDetail', vars.spaceId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
      if (vars) {
        queryClient.invalidateQueries({ queryKey: ['spaceDetail', vars.spaceId] });
      }
    },
  });

  const updateSpaceSettingsMutation = useMutation({
    mutationFn: ({ spaceId, settings }: { spaceId: string; settings: Record<string, any> }) =>
      api.updateSpaceSettings(spaceId, settings, currentUserId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['spaceDetail', variables.spaceId] });
      const previous = queryClient.getQueryData<any>(['spaceDetail', variables.spaceId]);
      queryClient.setQueryData<any>(['spaceDetail', variables.spaceId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          settings: { ...old.settings, ...variables.settings },
        };
      });
      return { previous };
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['spaceDetail', vars.spaceId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['spaces', currentUserId] });
      if (vars) {
        queryClient.invalidateQueries({ queryKey: ['spaceDetail', vars.spaceId] });
      }
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      spaceId: string; title: string; description?: string;
      priority?: Priority; status?: TaskStatus;
      assigneeId?: string; reporterId: string; dueDate?: string;
      checklist?: string[];
    }) => api.createTask(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        const optimisticTask: Task = {
          id: generateUniqueId('tsk'),
          spaceId: variables.spaceId,
          title: variables.title.trim(),
          description: variables.description?.trim() || undefined,
          priority: variables.priority || 'medium',
          status: variables.status || 'todo',
          assigneeId: variables.assigneeId || undefined,
          reporterId: variables.reporterId,
          dueDate: variables.dueDate || undefined,
          checklist: (variables.checklist || []).map(title => ({
            id: generateUniqueId('chk'),
            title,
            completed: false,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, optimisticTask];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => api.updateTask(id, { ...data, _userId: currentUserId }),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        return old.map(t => t.id === id ? { ...t, ...data } : t);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id, currentUserId),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        return old.filter(t => t.id !== id);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const moveTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.moveTaskStatus(id, status, currentUser.id),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        return old.map(t => t.id === id ? { ...t, status } : t);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const toggleChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      api.toggleChecklistItem(taskId, itemId),
    onMutate: async ({ taskId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        return old.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            checklist: (t.checklist || []).map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
          };
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const addChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      api.addChecklistItem(taskId, title),
    onMutate: async ({ taskId, title }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      const newItem = { id: generateUniqueId('chk'), title, completed: false };
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        return old.map(t => {
          if (t.id !== taskId) return t;
          return { ...t, checklist: [...(t.checklist || []), newItem] };
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const removeChecklistItemMutation = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string; itemId: string }) =>
      api.removeChecklistItem(taskId, itemId),
    onMutate: async ({ taskId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old;
        return old.map(t => {
          if (t.id !== taskId) return t;
          return { ...t, checklist: (t.checklist || []).filter(item => item.id !== itemId) };
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: { spaceId: string; title: string; content: string }) => api.createNote(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previous = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData<Note[]>(['notes'], (old) => {
        if (!old) return old;
        const optimisticNote: Note = {
          id: generateUniqueId('note'),
          spaceId: variables.spaceId,
          title: variables.title.trim() || 'Untitled Note',
          content: variables.content.trim(),
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, optimisticNote];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notes'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => api.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previous = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData<Note[]>(['notes'], (old) => {
        if (!old) return old;
        return old.map(n => n.id === id ? { ...n, ...data } : n);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notes'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previous = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData<Note[]>(['notes'], (old) => {
        if (!old) return old;
        return old.filter(n => n.id !== id);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notes'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: {
      spaceId: string; title: string; dueDate: string;
      description?: string; targetDeliverable?: string;
    }) => api.createMilestone(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['milestones'] });
      const previous = queryClient.getQueryData<Milestone[]>(['milestones']);
      queryClient.setQueryData<Milestone[]>(['milestones'], (old) => {
        if (!old) return old;
        const optimisticMilestone: Milestone = {
          id: generateUniqueId('ms'),
          spaceId: variables.spaceId,
          title: variables.title.trim(),
          dueDate: variables.dueDate,
          description: variables.description?.trim() || undefined,
          targetDeliverable: variables.targetDeliverable?.trim() || undefined,
          status: 'upcoming',
        };
        return [...old, optimisticMilestone];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['milestones'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) => api.updateMilestone(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['milestones'] });
      const previous = queryClient.getQueryData<Milestone[]>(['milestones']);
      queryClient.setQueryData<Milestone[]>(['milestones'], (old) => {
        if (!old) return old;
        return old.map(m => m.id === id ? { ...m, ...data } : m);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['milestones'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => api.deleteMilestone(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['milestones'] });
      const previous = queryClient.getQueryData<Milestone[]>(['milestones']);
      queryClient.setQueryData<Milestone[]>(['milestones'], (old) => {
        if (!old) return old;
        return old.filter(m => m.id !== id);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['milestones'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const addFileMutation = useMutation({
    mutationFn: (data: {
      spaceId: string; name: string; url: string;
      type: SpaceFile['type']; size?: string; uploadedById: string;
    }) => api.addFile(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      const previous = queryClient.getQueryData<SpaceFile[]>(['files']);
      queryClient.setQueryData<SpaceFile[]>(['files'], (old) => {
        if (!old) return old;
        const optimisticFile: SpaceFile = {
          id: generateUniqueId('file'),
          spaceId: variables.spaceId,
          name: variables.name.trim(),
          url: variables.url,
          type: variables.type,
          size: variables.size,
          uploadedById: variables.uploadedById,
          uploadedAt: new Date().toISOString(),
        };
        return [...old, optimisticFile];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['files'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => api.deleteFile(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      const previous = queryClient.getQueryData<SpaceFile[]>(['files']);
      queryClient.setQueryData<SpaceFile[]>(['files'], (old) => {
        if (!old) return old;
        return old.filter(f => f.id !== id);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['files'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { taskId: string; spaceId: string; authorId: string; content: string }) =>
      api.addComment(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['comments'] });
      const previous = queryClient.getQueryData<Comment[]>(['comments']);
      queryClient.setQueryData<Comment[]>(['comments'], (old) => {
        if (!old) return old;
        const optimisticComment: Comment = {
          id: generateUniqueId('cmt'),
          taskId: variables.taskId,
          spaceId: variables.spaceId,
          authorId: variables.authorId,
          content: variables.content.trim(),
          createdAt: new Date().toISOString(),
        };
        return [...old, optimisticComment];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['comments'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => api.deleteComment(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['comments'] });
      const previous = queryClient.getQueryData<Comment[]>(['comments']);
      queryClient.setQueryData<Comment[]>(['comments'], (old) => {
        if (!old) return old;
        return old.filter(c => c.id !== id);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['comments'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', currentUserId] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications', currentUserId]);
      queryClient.setQueryData<Notification[]>(['notifications', currentUserId], (old) => {
        if (!old) return old;
        return old.map(n => n.id === id ? { ...n, read: true } : n);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: (userId: string) => api.markAllNotificationsRead(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', currentUserId] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications', currentUserId]);
      queryClient.setQueryData<Notification[]>(['notifications', currentUserId], (old) => {
        if (!old) return old;
        return old.map(n => ({ ...n, read: true }));
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications', currentUserId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
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

  const joinSpaceByCode = async (code: string): Promise<{ success: boolean; space?: Space; message?: string }> => {
    const cleanCode = code.trim().toUpperCase();

    if (activeInvitePreview) {
      const existing = spaces.find(s => s.id === activeInvitePreview.space.id);
      if (existing && existing.memberIds.includes(currentUser.id)) {
        switchSpace(existing.id);
        setActiveInvitePreview(null);
        return { success: true, space: existing, message: 'You are already a member of this space.' };
      }
    }

    try {
      const result = await joinSpaceByCodeMutation.mutateAsync({ code: cleanCode, userId: currentUser.id });
      if (result?.space) {
        setJustJoinedSpace(result.space);
        switchSpace(result.space.id);
      }
      setActiveInvitePreview(null);
      return { success: true, space: result?.space };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to join space' };
    }
  };

  const openInvitePreviewByCode = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();

    // First try local spaces
    const localSpace = spaces.find(s => s.inviteCode.toUpperCase() === cleanCode);
    if (localSpace) {
      const owner = getUserById(localSpace.ownerId) || {
        id: localSpace.ownerId,
        name: 'Project Lead',
        email: 'lead@taskflow.app',
      };
      setActiveInvitePreview({
        space: localSpace,
        owner,
        memberCount: localSpace.memberIds.length,
      });
      setCurrentRoute('join_preview');
      return true;
    }

    // Fall back to API preview (works for non-members too)
    try {
      const preview = await api.previewSpaceByCode(cleanCode);
      setActiveInvitePreview({
        space: preview.space,
        owner: preview.owner,
        memberCount: preview.memberCount,
      });
      setCurrentRoute('join_preview');
      return true;
    } catch {
      return false;
    }
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

  const updateMemberRole = (spaceId: string, userId: string, role: string) => {
    updateMemberRoleMutation.mutate({ spaceId, userId, role });
  };

  const updateSpaceSettings = (spaceId: string, settings: Partial<SpaceSettings>) => {
    updateSpaceSettingsMutation.mutate({ spaceId, settings: settings as Record<string, any> });
  };

  const resetAllData = () => {
    queryClient.invalidateQueries();
  };

  const dismissWelcome = () => setJustJoinedSpace(null);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isAuthenticated,
        isLoading: authLoading,
        login: loginFn,
        register: registerFn,
        googleSignIn: googleSignInFn,
        completeProfile: completeProfileFn,
        logout,
        currentUser,
        users,
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
        justJoinedSpace,
        dismissWelcome,
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
        createTaskDefaultSpaceId,
        setCreateTaskDefaultSpaceId,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isUploadFileOpen,
        setIsUploadFileOpen,
        getUserById,
        getSpaceById,
        getSpaceMembers,
        getSpaceRole,
        getSpaceSettings,
        getSpaceProgress,
        updateMemberRole,
        updateSpaceSettings,
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
