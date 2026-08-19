import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ChevronRight,
  Search,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Priority } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

export const MySpaceView: React.FC = () => {
  const {
    currentUser,
    mySpaceTab,
    setMySpaceTab,
    myTasks,
    personalSpace,
    tasks,
    joinedSpaces,
    toggleTaskCompleted,
    setSelectedTaskId,
    createTask,
    switchSpace,
    getSpaceById,
  } = useApp();

  const [filterSpaceId, setFilterSpaceId] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPersonalTitle, setQuickPersonalTitle] = useState('');

  // Personal tasks in user's permanent private space
  const personalTasks = tasks.filter(
    t => t.spaceId === personalSpace.id || t.spaceId.startsWith('sp_personal')
  );

  // Filtering for universal My Tasks
  const filteredMyTasks = myTasks.filter(t => {
    if (filterSpaceId !== 'all' && t.spaceId !== filterSpaceId) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (
      searchQuery.trim() &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const pendingTasks = filteredMyTasks.filter(t => t.status !== 'done');
  const completedTasks = filteredMyTasks.filter(t => t.status === 'done');

  const handleAddPersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPersonalTitle.trim()) return;
    createTask({
      spaceId: personalSpace.id,
      title: quickPersonalTitle.trim(),
      priority: 'medium',
      status: 'todo',
      assigneeId: currentUser.id,
    });
    setQuickPersonalTitle('');
  };

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

  return (
    <div
      id="myspace-view"
      className="mx-auto px-4 md:px-8 py-8 space-y-6 animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              My Space
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Your permanent home in TrackFlow. Unified cross-space work and private tasks.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setMySpaceTab('tasks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mySpaceTab === 'tasks'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Universal Tasks ({myTasks.filter(t => t.status !== 'done').length})
          </button>
          <button
            onClick={() => setMySpaceTab('personal')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mySpaceTab === 'personal'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            Personal ({personalTasks.filter(t => t.status !== 'done').length})
          </button>
          <button
            onClick={() => setMySpaceTab('calendar')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mySpaceTab === 'calendar'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            My Calendar
          </button>
        </div>
      </div>

      {/* TAB 1: Universal My Tasks */}
      {mySpaceTab === 'tasks' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Filter tasks by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Space filter */}
              <select
                value={filterSpaceId}
                onChange={e => setFilterSpaceId(e.target.value)}
                className="text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Spaces ({joinedSpaces.length + 1})</option>
                <option value={personalSpace.id}>🏠 Personal Space</option>
                {joinedSpaces.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.icon || '📁'} {s.name}
                  </option>
                ))}
              </select>

              {/* Priority filter */}
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Pending Tasks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 px-1">
              <span>To Do ({pendingTasks.length})</span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-black rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                  You're all caught up!
                </div>
                <div>No pending tasks assigned to you right now.</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {pendingTasks.map(task => {
                  const space = getSpaceById(task.spaceId);
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
                          <Circle className="w-4 h-4" />
                        </button>

                        <div
                          className="min-w-0 cursor-pointer"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span
                              onClick={e => {
                                e.stopPropagation();
                                switchSpace(task.spaceId);
                              }}
                              className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>{space?.icon || '📁'}</span>
                              <span className="truncate max-w-[160px]">
                                {space?.name || 'Space'}
                              </span>
                            </span>
                            {task.dueDate && (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.dueDate}
                              </span>
                            )}
                            {task.checklist && task.checklist.length > 0 && (
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                ✓ {task.checklist.filter(c => c.completed).length}/
                                {task.checklist.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {getPriorityBadge(task.priority)}
                        <button
                          onClick={() => setSelectedTaskId(task.id)}
                          className="p-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-4">
              <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 px-1">
                Completed ({completedTasks.length})
              </div>
              <div className="space-y-1.5">
                {completedTasks.map(task => {
                  const space = getSpaceById(task.spaceId);
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompleted(task.id)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div
                          className="min-w-0 cursor-pointer"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-through truncate">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
                            <span>{space?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Personal Tasks */}
      {mySpaceTab === 'personal' && (
        <div className="space-y-5">
          {/* Quick Add Input */}
          <form onSubmit={handleAddPersonalTask} className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a quick personal task... (e.g. Study statistics chapter 5)"
              value={quickPersonalTitle}
              onChange={e => setQuickPersonalTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="default" size="md" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </form>

          {/* Personal Tasks List */}
          <div className="space-y-2">
            {personalTasks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-black rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs">
                No personal tasks yet. Add one above!
              </div>
            ) : (
              <div className="space-y-1.5">
                {personalTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="text-zinc-300 dark:text-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {task.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`text-xs font-semibold cursor-pointer ${
                          task.status === 'done'
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: My Calendar */}
      {mySpaceTab === 'calendar' && (
        <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Upcoming Deadlines (Aug - Oct 2026)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cross-space schedule of all tasks and deliverables
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {myTasks
              .filter(t => t.dueDate)
              .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
              .map(t => {
                const space = getSpaceById(t.spaceId);
                const isDone = t.status === 'done';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-center px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 rounded-md border border-indigo-200 dark:border-indigo-800/80">
                        <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                          {t.dueDate?.split('-')[1] === '08'
                            ? 'AUG'
                            : t.dueDate?.split('-')[1] === '09'
                            ? 'SEP'
                            : 'OCT'}
                        </div>
                        <div className="text-sm font-bold text-indigo-900 dark:text-indigo-200 font-mono">
                          {t.dueDate?.split('-')[2]}
                        </div>
                      </div>

                      <div>
                        <div
                          className={`text-xs font-semibold text-zinc-900 dark:text-zinc-100 ${
                            isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                          }`}
                        >
                          {t.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span>{space?.icon}</span>
                          <span>{space?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getPriorityBadge(t.priority)}
                      <Badge variant={isDone ? 'outline' : 'primary'} className="uppercase text-[10px]">
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
