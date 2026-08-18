import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Priority } from '../../types';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    myTasks,
    joinedSpaces,
    crossSpaceActivities,
    toggleTaskCompleted,
    switchSpace,
    setSelectedTaskId,
    setIsCreateSpaceOpen,
    setIsJoinSpaceOpen,
    setIsCreateTaskOpen,
    getSpaceById,
    getSpaceProgress,
    getUserById,
  } = useApp();

  const activeTasks = myTasks.filter(t => t.status !== 'done');
  const completedTasks = myTasks.filter(t => t.status === 'done');

  const todayTasks = activeTasks.filter(t => {
    if (!t.dueDate) return true;
    const due = new Date(t.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });

  const upcomingTasks = activeTasks.filter(t => !todayTasks.includes(t));

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
      id="home-view"
      className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-200"
    >
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {greetingTime()}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeTasks.length} active tasks</span> across{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{joinedSpaces.length} spaces</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsJoinSpaceOpen(true)}
            size="sm"
            variant="outline"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Join Space</span>
          </Button>
          <Button
            onClick={() => setIsCreateTaskOpen(true)}
            size="sm"
            variant="default"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Left Column: My Tasks (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>My Tasks</span>
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{completedTasks.length}</span>/{myTasks.length} done
            </span>
          </div>

          {/* Today / Priority Section */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Today & Priority
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-6 rounded-xl bg-white dark:bg-black border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">All clear for today!</p>
                <p>No urgent deadlines due right now.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {todayTasks.map(task => {
                  const space = getSpaceById(task.spaceId);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start justify-between p-3 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-2xs transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompleted(task.id)}
                          className="mt-0.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                          )}
                        </button>

                        <div className="min-w-0 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                          <div
                            className={`text-xs font-medium text-zinc-900 dark:text-zinc-100 ${
                              isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              onClick={e => {
                                e.stopPropagation();
                                switchSpace(task.spaceId);
                              }}
                              className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                            >
                              <span>{space?.icon || '📁'}</span>
                              <span className="truncate max-w-[140px]">{space?.name || 'Space'}</span>
                            </span>

                            {task.dueDate && (
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {getPriorityBadge(task.priority)}
                        <button
                          onClick={() => setSelectedTaskId(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity cursor-pointer"
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

          {/* Upcoming Section */}
          {upcomingTasks.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Upcoming
              </div>
              <div className="space-y-1.5">
                {upcomingTasks.map(task => {
                  const space = getSpaceById(task.spaceId);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start justify-between p-3 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-2xs transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompleted(task.id)}
                          className="mt-0.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                          )}
                        </button>

                        <div className="min-w-0 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                          <div
                            className={`text-xs font-medium text-zinc-900 dark:text-zinc-100 ${
                              isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>{space?.icon || '📁'}</span>
                            <span className="truncate max-w-[140px]">{space?.name}</span>
                            {task.dueDate && <span className="font-mono text-[10px]">• {task.dueDate}</span>}
                          </div>
                        </div>
                      </div>

                      <div>{getPriorityBadge(task.priority)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: My Spaces + Recent Cross-Space Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* My Spaces Card Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>My Spaces</span>
              </h2>
              <button
                onClick={() => setIsCreateSpaceOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-2">
              {joinedSpaces.map(space => {
                const progress = getSpaceProgress(space.id);
                return (
                  <div
                    key={space.id}
                    onClick={() => switchSpace(space.id)}
                    className="p-3.5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-2xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{space.icon || '🚀'}</span>
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {space.name}
                          </h3>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{space.memberIds.length} members</span>
                            {space.dueDate && <span>• Due {space.dueDate}</span>}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all" />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mb-1">
                        <span>Progress</span>
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Cross-Space Activity Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Recent Activity</span>
              </h2>
            </div>

            <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3 divide-y divide-zinc-100 dark:divide-zinc-900">
              {crossSpaceActivities.slice(0, 5).map((act, idx) => {
                const space = getSpaceById(act.spaceId);
                const user = getUserById(act.userId);

                return (
                  <div
                    key={`${act.id || 'act'}_${idx}`}
                    onClick={() => {
                      if (act.taskId) setSelectedTaskId(act.taskId);
                      else switchSpace(act.spaceId);
                    }}
                    className="pt-2.5 first:pt-0 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 -mx-1 px-1 rounded transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {space?.name || 'Space'}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{act.timestamp}</span>
                    </div>

                    <div className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.name.split(' ')[0] || 'Member'}</span>{' '}
                      {act.action === 'completed_task' && 'completed'}
                      {act.action === 'commented' && 'commented on'}
                      {act.action === 'assigned_task' && 'assigned'}
                      {act.action === 'uploaded_file' && 'uploaded'}
                      {act.action === 'created_task' && 'created'}{' '}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        "{act.entityTitle}"
                      </span>
                    </div>
                  </div>
                );
              })}

              {crossSpaceActivities.length === 0 && (
                <div className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
