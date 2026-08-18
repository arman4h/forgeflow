import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Space,
  SpaceMember,
  Task,
  SpaceFile,
  Comment,
  Activity,
  ActivityAction,
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
import {
  CURRENT_USER_ID,
  MOCK_USERS,
  MOCK_SPACES,
  MOCK_SPACE_MEMBERS,
  MOCK_TASKS,
  MOCK_FILES,
  MOCK_COMMENTS,
  MOCK_ACTIVITIES,
  MOCK_NOTIFICATIONS,
  MOCK_NOTES,
  MOCK_MILESTONES,
} from '../data/mockData';

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
  myTasks: Task[]; // Aggregated tasks assigned to current user across all spaces + personal
  spaceTasks: Task[]; // Tasks for the currently active space
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

let idCounter = 0;
export const generateUniqueId = (prefix: string): string => {
  idCounter = (idCounter + 1) % 1000000;
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${Date.now()}_${idCounter}_${randomStr}`;
};

const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: defaults to light (full white)
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
    } catch {
      // ignore
    }
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

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Initialize state with localStorage persistence
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}current_user`) || CURRENT_USER_ID;
  });

  const [users] = useState<User[]>(MOCK_USERS);

  const [spaces, setSpaces] = useState<Space[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}spaces`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_SPACES;
    } catch {
      return MOCK_SPACES;
    }
  });

  const [spaceMembers, setSpaceMembers] = useState<SpaceMember[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}members`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_SPACE_MEMBERS;
    } catch {
      return MOCK_SPACE_MEMBERS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}tasks`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_TASKS;
    } catch {
      return MOCK_TASKS;
    }
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}notes`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_NOTES;
    } catch {
      return MOCK_NOTES;
    }
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}milestones`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_MILESTONES;
    } catch {
      return MOCK_MILESTONES;
    }
  });

  const [files, setFiles] = useState<SpaceFile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}files`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_FILES;
    } catch {
      return MOCK_FILES;
    }
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}comments`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_COMMENTS;
    } catch {
      return MOCK_COMMENTS;
    }
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}activities`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_ACTIVITIES;
    } catch {
      return MOCK_ACTIVITIES;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}notifications`);
      return saved ? deduplicateById(JSON.parse(saved)) : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  });

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedSpaceTab, setSelectedSpaceTab] = useState<SpaceTab>('overview');
  const [mySpaceTab, setMySpaceTab] = useState<MySpaceTab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Invite Flow State
  const [activeInvitePreview, setActiveInvitePreview] = useState<InvitePreviewData | null>(null);

  // Modals
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isJoinSpaceOpen, setIsJoinSpaceOpen] = useState(false);
  const [isInviteMembersOpen, setIsInviteMembersOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}current_user`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}spaces`, JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}members`, JSON.stringify(spaceMembers));
  }, [spaceMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}notes`, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}milestones`, JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}files`, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}comments`, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Derived values
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
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

  const getUserById = (id?: string) => {
    if (!id) return undefined;
    return users.find(u => u.id === id);
  };

  const getSpaceById = (id?: string) => {
    if (!id) return undefined;
    return spaces.find(s => s.id === id);
  };

  // Aggregated tasks assigned to current user across all spaces + personal
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assigneeId === currentUser.id);
  }, [tasks, currentUser]);

  // Tasks for the currently active space
  const spaceTasks = useMemo(() => {
    if (!selectedSpaceId) return [];
    return tasks.filter(t => t.spaceId === selectedSpaceId);
  }, [tasks, selectedSpaceId]);

  // Files for the currently active space
  const spaceFiles = useMemo(() => {
    if (!selectedSpaceId) return [];
    return files.filter(f => f.spaceId === selectedSpaceId);
  }, [files, selectedSpaceId]);

  // Notes helper
  const spaceNotes = (spaceId: string) => {
    return notes.filter(n => n.spaceId === spaceId);
  };

  // Milestones helper
  const spaceMilestones = (spaceId: string) => {
    return milestones.filter(m => m.spaceId === spaceId);
  };

  // Space members list with full User profile details
  const getSpaceMembers = (spaceId: string) => {
    const members = spaceMembers.filter(m => m.spaceId === spaceId);
    return members.map(m => ({
      ...m,
      user: getUserById(m.userId) || {
        id: m.userId,
        name: 'Team Member',
        email: 'member@forgeflow.app',
      },
    }));
  };

  // Space progress calculation
  const getSpaceProgress = (spaceId: string) => {
    const relevantTasks = tasks.filter(t => t.spaceId === spaceId);
    if (relevantTasks.length === 0) return 0;
    const completed = relevantTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / relevantTasks.length) * 100);
  };

  // Space Activities
  const spaceActivities = useMemo(() => {
    if (!selectedSpaceId) return [];
    return activities.filter(a => a.spaceId === selectedSpaceId);
  }, [activities, selectedSpaceId]);

  // Cross-space activities (from all joined spaces)
  const crossSpaceActivities = useMemo(() => {
    const userSpaceIds = new Set(mySpaces.map(s => s.id));
    return activities.filter(a => userSpaceIds.has(a.spaceId));
  }, [activities, mySpaces]);

  // Comments helper
  const taskComments = (taskId: string) => {
    return comments.filter(c => c.taskId === taskId);
  };

  // Notifications
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => n.userId === currentUser.id && !n.read).length;
  }, [notifications, currentUser]);

  // Action Handlers
  const switchCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
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

  const createSpace = (
    name: string,
    description?: string,
    icon: string = '🚀',
    category: SpaceCategory = 'university'
  ): Space => {
    const code = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase() || 'SPACE';

    const newSpace: Space = {
      id: generateUniqueId('sp'),
      name: name.trim(),
      description: description?.trim() || undefined,
      icon,
      category,
      ownerId: currentUser.id,
      memberIds: [currentUser.id],
      inviteCode: code,
      createdAt: new Date().toISOString(),
    };

    const newMember: SpaceMember = {
      id: generateUniqueId('sm'),
      spaceId: newSpace.id,
      userId: currentUser.id,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    };

    const newActivity: Activity = {
      id: generateUniqueId('act'),
      spaceId: newSpace.id,
      userId: currentUser.id,
      action: 'created_space',
      entityTitle: newSpace.name,
      details: 'Created new project space',
      timestamp: 'Just now',
    };

    setSpaces(prev => [newSpace, ...prev]);
    setSpaceMembers(prev => [newMember, ...prev]);
    setActivities(prev => [newActivity, ...prev]);

    setSelectedSpaceId(newSpace.id);
    setCurrentRoute('space_detail');
    setSelectedSpaceTab('overview');

    return newSpace;
  };

  const updateSpace = (spaceId: string, updates: Partial<Space>) => {
    setSpaces(prev =>
      prev.map(s => (s.id === spaceId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
  };

  const deleteSpace = (spaceId: string) => {
    setSpaces(prev => prev.filter(s => s.id !== spaceId));
    setSpaceMembers(prev => prev.filter(m => m.spaceId !== spaceId));
    setTasks(prev => prev.filter(t => t.spaceId !== spaceId));
    setFiles(prev => prev.filter(f => f.spaceId !== spaceId));
    setNotes(prev => prev.filter(n => n.spaceId !== spaceId));
    setMilestones(prev => prev.filter(m => m.spaceId !== spaceId));

    if (selectedSpaceId === spaceId) {
      setSelectedSpaceId(null);
      setCurrentRoute('home');
    }
  };

  const leaveSpace = (spaceId: string) => {
    setSpaces(prev =>
      prev.map(s => {
        if (s.id === spaceId) {
          return {
            ...s,
            memberIds: s.memberIds.filter(id => id !== currentUser.id),
          };
        }
        return s;
      })
    );

    setSpaceMembers(prev =>
      prev.filter(m => !(m.spaceId === spaceId && m.userId === currentUser.id))
    );

    if (selectedSpaceId === spaceId) {
      setSelectedSpaceId(null);
      setCurrentRoute('home');
    }
  };

  const inviteMember = (spaceId: string, email: string) => {
    const space = getSpaceById(spaceId);
    if (!space) return;

    let targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const isNew = !targetUser;

    if (!targetUser) {
      const generatedName = email.split('@')[0].replace('.', ' ');
      targetUser = {
        id: generateUniqueId('usr'),
        name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
        email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100`,
        title: 'Project Contributor',
      };
    }

    if (!space.memberIds.includes(targetUser.id)) {
      setSpaces(prev =>
        prev.map(s => (s.id === spaceId ? { ...s, memberIds: [...s.memberIds, targetUser!.id] } : s))
      );

      const newMember: SpaceMember = {
        id: generateUniqueId('sm'),
        spaceId,
        userId: targetUser.id,
        role: 'member',
        joinedAt: new Date().toISOString(),
      };
      setSpaceMembers(prev => [...prev, newMember]);
    }

    const newActivity: Activity = {
      id: generateUniqueId('act'),
      spaceId,
      userId: currentUser.id,
      action: 'joined_space',
      entityTitle: targetUser.name,
      details: `Invited ${email} to collaborate`,
      timestamp: 'Just now',
    };
    setActivities(prev => [newActivity, ...prev]);

    const newNotif: Notification = {
      id: generateUniqueId('notif'),
      userId: targetUser.id,
      spaceId,
      title: 'Space Invitation',
      message: `${currentUser.name} invited you to join "${space.name}"`,
      type: 'space_invitation',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const joinSpaceByCode = (code: string): { success: boolean; space?: Space; message?: string } => {
    const cleanCode = code.trim().toUpperCase();
    const space = spaces.find(s => s.inviteCode.toUpperCase() === cleanCode);

    if (!space) {
      return { success: false, message: 'Invalid invite code. Space not found.' };
    }

    if (space.memberIds.includes(currentUser.id)) {
      switchSpace(space.id);
      setActiveInvitePreview(null);
      return { success: true, space, message: 'You are already a member of this space.' };
    }

    setSpaces(prev =>
      prev.map(s => (s.id === space.id ? { ...s, memberIds: [...s.memberIds, currentUser.id] } : s))
    );

    const newMember: SpaceMember = {
      id: generateUniqueId('sm'),
      spaceId: space.id,
      userId: currentUser.id,
      role: 'member',
      joinedAt: new Date().toISOString(),
    };
    setSpaceMembers(prev => [...prev, newMember]);

    const newActivity: Activity = {
      id: generateUniqueId('act'),
      spaceId: space.id,
      userId: currentUser.id,
      action: 'joined_space',
      entityTitle: currentUser.name,
      details: 'Joined via invite code',
      timestamp: 'Just now',
    };
    setActivities(prev => [newActivity, ...prev]);

    switchSpace(space.id);
    setActiveInvitePreview(null);
    return { success: true, space };
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

  // Task Operations
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
    const checklistItems = (params.checklist || []).map(title => ({
      id: generateUniqueId('chk'),
      title,
      completed: false,
    }));

    const newTask: Task = {
      id: generateUniqueId('tsk'),
      spaceId: params.spaceId,
      title: params.title.trim(),
      description: params.description?.trim() || undefined,
      priority: params.priority || 'medium',
      status: params.status || 'todo',
      assigneeId: params.assigneeId || undefined,
      reporterId: currentUser.id,
      dueDate: params.dueDate || undefined,
      checklist: checklistItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    const newActivity: Activity = {
      id: generateUniqueId('act'),
      spaceId: params.spaceId,
      userId: currentUser.id,
      action: 'created_task',
      entityTitle: newTask.title,
      details: params.assigneeId
        ? `Assigned to ${getUserById(params.assigneeId)?.name || 'member'}`
        : 'Added to task list',
      timestamp: 'Just now',
      taskId: newTask.id,
    };
    setActivities(prev => [newActivity, ...prev]);

    if (params.assigneeId && params.assigneeId !== currentUser.id) {
      const space = getSpaceById(params.spaceId);
      const newNotif: Notification = {
        id: generateUniqueId('notif'),
        userId: params.assigneeId,
        spaceId: params.spaceId,
        taskId: newTask.id,
        title: 'Task Assigned',
        message: `${currentUser.name} assigned you "${newTask.title}" in ${space?.name || 'Space'}`,
        type: 'task_assigned',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setComments(prev => prev.filter(c => c.taskId !== taskId));
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
    if (!task) return;

    const prevStatus = task.status;
    if (prevStatus === newStatus) return;

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );

    const actionType: ActivityAction = newStatus === 'done' ? 'completed_task' : 'status_changed';
    const statusLabel =
      newStatus === 'done' ? 'Completed' : newStatus === 'in_progress' ? 'In Progress' : 'To Do';

    const newActivity: Activity = {
      id: generateUniqueId('act'),
      spaceId: task.spaceId,
      userId: currentUser.id,
      action: actionType,
      entityTitle: task.title,
      details: `Moved to ${statusLabel}`,
      timestamp: 'Just now',
      taskId,
    };
    setActivities(prev => [newActivity, ...prev]);

    if (newStatus === 'done' && task.reporterId !== currentUser.id) {
      const newNotif: Notification = {
        id: generateUniqueId('notif'),
        userId: task.reporterId,
        spaceId: task.spaceId,
        taskId: task.id,
        title: 'Task Completed',
        message: `${currentUser.name} completed "${task.title}"`,
        type: 'task_completed',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checklist: t.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addChecklistItem = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const newItem = {
      id: generateUniqueId('chk'),
      title: title.trim(),
      completed: false,
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checklist: [...t.checklist, newItem],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const removeChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checklist: t.checklist.filter(item => item.id !== itemId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Notes CRUD
  const createNote = (spaceId: string, title: string, content: string): Note => {
    const newNote: Note = {
      id: generateUniqueId('note'),
      spaceId,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Milestones CRUD
  const createMilestone = (
    spaceId: string,
    title: string,
    dueDate: string,
    description?: string,
    targetDeliverable?: string
  ): Milestone => {
    const newMilestone: Milestone = {
      id: generateUniqueId('ms'),
      spaceId,
      title: title.trim(),
      dueDate,
      description: description?.trim() || undefined,
      targetDeliverable: targetDeliverable?.trim() || undefined,
      status: 'upcoming',
    };
    setMilestones(prev => [...prev, newMilestone]);
    return newMilestone;
  };

  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => (m.id === milestoneId ? { ...m, ...updates } : m)));
  };

  const deleteMilestone = (milestoneId: string) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
  };

  // Files
  const addFile = (
    spaceId: string,
    name: string,
    url: string,
    type: SpaceFile['type'] = 'document',
    size: string = '1.2 MB'
  ) => {
    const newFile: SpaceFile = {
      id: generateUniqueId('fil'),
      spaceId,
      name: name.trim(),
      url,
      type,
      size,
      uploadedById: currentUser.id,
      uploadedAt: new Date().toISOString(),
    };

    setFiles(prev => [newFile, ...prev]);

    const newActivity: Activity = {
      id: generateUniqueId('act'),
      spaceId,
      userId: currentUser.id,
      action: 'uploaded_file',
      entityTitle: newFile.name,
      details: `Added ${newFile.type} asset`,
      timestamp: 'Just now',
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Comments
  const addComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment: Comment = {
      id: generateUniqueId('cmt'),
      taskId,
      spaceId: task.spaceId,
      authorId: currentUser.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newComment]);

    const newAct: Activity = {
      id: generateUniqueId('act'),
      spaceId: task.spaceId,
      userId: currentUser.id,
      action: 'commented',
      entityTitle: task.title,
      details: `Commented: "${content.trim().slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
      timestamp: 'Just now',
      taskId,
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
    localStorage.removeItem(`${STORAGE_PREFIX}spaces`);
    localStorage.removeItem(`${STORAGE_PREFIX}members`);
    localStorage.removeItem(`${STORAGE_PREFIX}tasks`);
    localStorage.removeItem(`${STORAGE_PREFIX}notes`);
    localStorage.removeItem(`${STORAGE_PREFIX}milestones`);
    localStorage.removeItem(`${STORAGE_PREFIX}files`);
    localStorage.removeItem(`${STORAGE_PREFIX}comments`);
    localStorage.removeItem(`${STORAGE_PREFIX}activities`);
    localStorage.removeItem(`${STORAGE_PREFIX}notifications`);

    setCurrentUserId(CURRENT_USER_ID);
    setSpaces(MOCK_SPACES);
    setSpaceMembers(MOCK_SPACE_MEMBERS);
    setTasks(MOCK_TASKS);
    setNotes(MOCK_NOTES);
    setMilestones(MOCK_MILESTONES);
    setFiles(MOCK_FILES);
    setComments(MOCK_COMMENTS);
    setActivities(MOCK_ACTIVITIES);
    setNotifications(MOCK_NOTIFICATIONS);

    setCurrentRoute('home');
    setSelectedSpaceId(null);
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
