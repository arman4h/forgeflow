import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  UserPlus,
  Share2,
  Settings,
  MoreVertical,
  FileText,
  FileCode,
  Link as LinkIcon,
  Download,
  Trash2,
  UserCheck,
  Crown,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  LogOut,
  LayoutList,
  Kanban,
  Pin,
  Flag,
  Calendar,
  Search,
  CheckSquare,
  StickyNote,
} from 'lucide-react';
import { TaskStatus, Priority, SpaceTab, Milestone } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

export const SpaceDetailView: React.FC = () => {
  const {
    currentSpace,
    selectedSpaceTab,
    setSelectedSpaceTab,
    spaceTasks,
    spaceFiles,
    spaceActivities,
    getSpaceMembers,
    getSpaceProgress,
    toggleTaskCompleted,
    moveTaskStatus,
    setSelectedTaskId,
    setIsCreateTaskOpen,
    setIsInviteMembersOpen,
    setIsUploadFileOpen,
    deleteFile,
    leaveSpace,
    deleteSpace,
    currentUser,
    getUserById,
    spaceNotes,
    createNote,
    updateNote,
    deleteNote,
    spaceMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  } = useApp();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'board'>('list');
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // Notes state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Milestones state
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDeliverable, setNewMilestoneDeliverable] = useState('');

  if (!currentSpace) {
    return (
      <div className="p-12 text-center text-zinc-500 text-sm">
        No space selected. Choose a space from the sidebar.
      </div>
    );
  }

  const members = getSpaceMembers(currentSpace.id);
  const progress = getSpaceProgress(currentSpace.id);
  const isOwner = currentSpace.ownerId === currentUser.id;

  const notesList = spaceNotes(currentSpace.id);
  const milestonesList = spaceMilestones(currentSpace.id);

  const todoTasks = spaceTasks.filter(t => t.status === 'todo');
  const inProgressTasks = spaceTasks.filter(t => t.status === 'in_progress');
  const doneTasks = spaceTasks.filter(t => t.status === 'done');

  const filteredTasks = spaceTasks.filter(t => {
    if (taskFilterStatus !== 'all' && t.status !== taskFilterStatus) return false;
    if (
      taskSearchQuery.trim() &&
      !t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    createNote(currentSpace.id, newNoteTitle.trim(), newNoteContent.trim());
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleCreateMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !newMilestoneDueDate) return;
    createMilestone(
      currentSpace.id,
      newMilestoneTitle.trim(),
      newMilestoneDueDate,
      newMilestoneDesc.trim(),
      newMilestoneDeliverable.trim()
    );
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
    setNewMilestoneDesc('');
    setNewMilestoneDeliverable('');
    setIsAddingMilestone(false);
  };

  return (
    <div
      id="space-detail-view"
      className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6 animate-in fade-in duration-200"
    >
      {/* Space Header Banner */}
      <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
              {currentSpace.icon || '🚀'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  {currentSpace.name}
                </h1>
                <Badge variant="secondary" className="capitalize">
                  {currentSpace.category}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {currentSpace.description || 'Collaborative workspace for this project.'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span>{members.length} members</span>
                {currentSpace.dueDate && (
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Due: {currentSpace.dueDate}
                  </span>
                )}
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {progress}% complete
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setIsInviteMembersOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </Button>
            <Button
              onClick={() => setIsCreateTaskOpen(true)}
              variant="default"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* Space Sub-Tabs */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 overflow-x-auto">
          {(
            [
              'overview',
              'tasks',
              'board',
              'milestones',
              'notes',
              'files',
              'members',
              'activity',
            ] as SpaceTab[]
          ).map(tab => {
            const isActive = selectedSpaceTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedSpaceTab(tab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40'
                }`}
              >
                {tab}
                {tab === 'tasks' && ` (${spaceTasks.length})`}
                {tab === 'milestones' && ` (${milestonesList.length})`}
                {tab === 'notes' && ` (${notesList.length})`}
                {tab === 'files' && ` (${spaceFiles.length})`}
                {tab === 'members' && ` (${members.length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {selectedSpaceTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Progress Card */}
            <div className="p-5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Completion
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {progress}%
                </span>
              </div>
              <div className="mt-3 w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{doneTasks.length} completed</span>
                <span>{spaceTasks.length - doneTasks.length} pending</span>
              </div>
            </div>

            {/* Quick Invite Card */}
            <div className="p-5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Invite Code
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800">
                    {currentSpace.inviteCode}
                  </span>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(currentSpace.inviteCode);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Share this 6-character code with teammates to join instantly.
              </p>
            </div>

            {/* Team summary */}
            <div className="p-5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Team
              </span>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {members.slice(0, 5).map(m => {
                  const u = getUserById(m.userId);
                  return (
                    <img
                      key={m.id}
                      src={
                        u?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                      }
                      alt={u?.name}
                      title={u?.name}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                  );
                })}
                {members.length > 5 && (
                  <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-xs flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    +{members.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick tasks & Milestones snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Key Tasks
                </h3>
                <Button
                  onClick={() => setSelectedSpaceTab('tasks')}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  View all
                </Button>
              </div>
              <div className="space-y-2">
                {spaceTasks.slice(0, 4).map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="flex items-center justify-between p-2.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-950 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleTaskCompleted(t.id);
                        }}
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        {t.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </button>
                      <span
                        className={`text-xs font-medium truncate ${
                          t.status === 'done'
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                    {getPriorityBadge(t.priority)}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Roadmap Milestones
                </h3>
                <Button
                  onClick={() => setSelectedSpaceTab('milestones')}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Manage
                </Button>
              </div>
              <div className="space-y-2">
                {milestonesList.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-4 text-center">
                    No milestones recorded yet.
                  </p>
                ) : (
                  milestonesList.slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {m.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          Target: {m.dueDate}
                        </div>
                      </div>
                      <Badge
                        variant={
                          m.status === 'completed'
                            ? 'outline'
                            : m.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="uppercase text-[9px]"
                      >
                        {m.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS (LIST & BOARD TOGGLE) */}
      {selectedSpaceTab === 'tasks' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={taskSearchQuery}
                onChange={e => setTaskSearchQuery(e.target.value)}
                className="w-full text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={taskFilterStatus}
                onChange={e => setTaskFilterStatus(e.target.value)}
                className="text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>

              {/* View toggle */}
              <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setTaskViewMode('list')}
                  className={`p-1.5 rounded text-xs transition-all cursor-pointer ${
                    taskViewMode === 'list'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                  title="List View"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTaskViewMode('board')}
                  className={`p-1.5 rounded text-xs transition-all cursor-pointer ${
                    taskViewMode === 'board'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                  title="Board View"
                >
                  <Kanban className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                onClick={() => setIsCreateTaskOpen(true)}
                variant="default"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </Button>
            </div>
          </div>

          {/* List View Rendering */}
          {taskViewMode === 'list' && (
            <div className="space-y-1.5">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-black rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs">
                  No tasks matching your query.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between p-3.5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-2xs transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompleted(task.id)}
                          className="text-zinc-300 dark:text-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>

                        <div
                          className="min-w-0 cursor-pointer"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div
                            className={`text-xs font-semibold truncate ${
                              isDone
                                ? 'line-through text-zinc-400 dark:text-zinc-500'
                                : 'text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {task.dueDate && (
                              <span className="font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                {task.dueDate}
                              </span>
                            )}
                            {task.checklist && task.checklist.length > 0 && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                ✓ {task.checklist.filter(c => c.completed).length}/
                                {task.checklist.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {assignee && (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            title={`Assigned to ${assignee.name}`}
                            className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                          />
                        )}
                        {getPriorityBadge(task.priority)}
                        <select
                          value={task.status}
                          onChange={e => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Board View Rendering */}
          {taskViewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { key: 'todo', label: 'To Do', items: todoTasks },
                  { key: 'in_progress', label: 'In Progress', items: inProgressTasks },
                  { key: 'done', label: 'Done', items: doneTasks },
                ] as const
              ).map(col => (
                <div
                  key={col.key}
                  className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      {col.items.length}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[200px]">
                    {col.items.map(task => {
                      const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer shadow-2xs transition-all space-y-2"
                        >
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {task.title}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            {getPriorityBadge(task.priority)}
                            {assignee && (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEDICATED BOARD TAB */}
      {selectedSpaceTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              { key: 'todo', label: 'To Do', items: todoTasks },
              { key: 'in_progress', label: 'In Progress', items: inProgressTasks },
              { key: 'done', label: 'Done', items: doneTasks },
            ] as const
          ).map(col => (
            <div
              key={col.key}
              className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  {col.items.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[250px]">
                {col.items.map(task => {
                  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer shadow-2xs transition-all space-y-2"
                    >
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        {getPriorityBadge(task.priority)}
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e =>
                              moveTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            className="text-[10px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-zinc-800 dark:text-zinc-200"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MILESTONES */}
      {selectedSpaceTab === 'milestones' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Project Milestones & Deliverables
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Track high-level project targets and deadlines.
              </p>
            </div>
            <Button
              onClick={() => setIsAddingMilestone(true)}
              variant="default"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </Button>
          </div>

          {/* Add Milestone Form */}
          {isAddingMilestone && (
            <form
              onSubmit={handleCreateMilestoneSubmit}
              className="p-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 animate-in fade-in duration-150"
            >
              <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                Create New Milestone
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="Milestone Title (e.g. Phase 1 Architecture Design)"
                  value={newMilestoneTitle}
                  onChange={e => setNewMilestoneTitle(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  value={newMilestoneDueDate}
                  onChange={e => setNewMilestoneDueDate(e.target.value)}
                  required
                />
              </div>
              <Input
                type="text"
                placeholder="Target Deliverable (e.g. PDF Specification Document)"
                value={newMilestoneDeliverable}
                onChange={e => setNewMilestoneDeliverable(e.target.value)}
              />
              <textarea
                placeholder="Description of milestone goals..."
                value={newMilestoneDesc}
                onChange={e => setNewMilestoneDesc(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingMilestone(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Save Milestone
                </Button>
              </div>
            </form>
          )}

          {/* Milestones List */}
          <div className="space-y-3">
            {milestonesList.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-black rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs">
                No milestones added yet. Add one to define your roadmap!
              </div>
            ) : (
              milestonesList.map(m => (
                <div
                  key={m.id}
                  className="p-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                        {m.title}
                      </h4>
                      <Badge
                        variant={
                          m.status === 'completed'
                            ? 'default'
                            : m.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="uppercase text-[9px]"
                      >
                        {m.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {m.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {m.description}
                      </p>
                    )}
                    {m.targetDeliverable && (
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                        Deliverable: <span className="underline">{m.targetDeliverable}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      Due {m.dueDate}
                    </span>
                    <select
                      value={m.status}
                      onChange={e =>
                        updateMilestone(m.id, {
                          status: e.target.value as Milestone['status'],
                        })
                      }
                      className="text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => deleteMilestone(m.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NOTES */}
      {selectedSpaceTab === 'notes' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Shared Space Notes
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Collaborative scratchpads, meeting minutes, and specifications.
              </p>
            </div>
            <Button
              onClick={() => setIsAddingNote(true)}
              variant="default"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </Button>
          </div>

          {/* Add Note Form */}
          {isAddingNote && (
            <form
              onSubmit={handleCreateNoteSubmit}
              className="p-4 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 animate-in fade-in duration-150"
            >
              <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                Create Shared Note
              </h3>
              <Input
                type="text"
                placeholder="Note Title (e.g. Kickoff Meeting Notes)"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Write your note content..."
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                rows={4}
                required
                className="w-full p-2.5 text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNote(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Save Note
                </Button>
              </div>
            </form>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesList.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white dark:bg-black rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs">
                No notes created yet. Click "New Note" to start writing.
              </div>
            ) : (
              notesList.map(n => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg bg-white dark:bg-black border ${
                    n.isPinned
                      ? 'border-zinc-900 dark:border-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-800'
                  } shadow-2xs flex flex-col justify-between space-y-3`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <StickyNote className="w-4 h-4 text-zinc-500" />
                        <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                          {n.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateNote(n.id, { isPinned: !n.isPinned })}
                          className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                            n.isPinned
                              ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                              : 'text-zinc-400'
                          }`}
                          title="Pin note"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNote(n.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    Updated {n.updatedAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: FILES */}
      {selectedSpaceTab === 'files' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Space Resources & Files ({spaceFiles.length})
            </h2>
            <Button
              onClick={() => setIsUploadFileOpen(true)}
              variant="default"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Resource</span>
            </Button>
          </div>

          <div className="space-y-2">
            {spaceFiles.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-black rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs">
                No files uploaded yet.
              </div>
            ) : (
              spaceFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      {file.type === 'link' ? (
                        <LinkIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {file.size || 'External URL'} • Added {file.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: MEMBERS */}
      {selectedSpaceTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Members & Collaborators ({members.length})
            </h2>
            <Button
              onClick={() => setIsInviteMembersOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Member</span>
            </Button>
          </div>

          <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 shadow-2xs">
            {members.map(member => {
              const u = getUserById(member.userId);
              return (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                      }
                      alt={u?.name}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                        <span>{u?.name}</span>
                        {member.role === 'owner' && (
                          <Crown className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {u?.email} • {u?.title}
                      </div>
                    </div>
                  </div>

                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                    {member.role}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITY */}
      {selectedSpaceTab === 'activity' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
            Space Activity Audit Log
          </h2>
          <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800 shadow-2xs">
            {spaceActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
                No activity recorded yet in this space.
              </div>
            ) : (
              spaceActivities.map(act => {
                const u = getUserById(act.userId);
                return (
                  <div key={act.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {u?.name}
                      </span>
                      <span className="font-mono text-zinc-400 dark:text-zinc-500">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {act.action === 'created_task' && 'Created task '}
                      {act.action === 'completed_task' && 'Completed task '}
                      {act.action === 'commented' && 'Commented on '}
                      {act.action === 'uploaded_file' && 'Uploaded '}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        "{act.entityTitle}"
                      </span>
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
