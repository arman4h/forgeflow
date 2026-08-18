import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  Layers,
  Plus,
  Compass,
  User,
  Settings,
  Home,
  X,
  ArrowRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    spaces,
    tasks,
    switchSpace,
    setSelectedTaskId,
    setCurrentRoute,
    setIsCreateSpaceOpen,
    setIsJoinSpaceOpen,
    setIsCreateTaskOpen,
    getSpaceById,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredSpaces = spaces.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectSpace = (spaceId: string) => {
    switchSpace(spaceId);
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  const handleAction = (action: () => void) => {
    action();
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 transition-colors">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Type a command, space, or task name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 bg-transparent focus:outline-none"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-900 text-xs custom-scrollbar">
          {/* Quick Actions */}
          <div className="py-1">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Quick Actions
            </div>
            <button
              onClick={() => handleAction(() => setIsCreateTaskOpen(true))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                <Plus className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Create New Task</span>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Action</span>
            </button>
            <button
              onClick={() => handleAction(() => setIsCreateSpaceOpen(true))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                <Plus className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Create New Space</span>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Action</span>
            </button>
            <button
              onClick={() => handleAction(() => setIsJoinSpaceOpen(true))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                <Compass className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Join Space with Code</span>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Action</span>
            </button>
          </div>

          {/* Spaces Results */}
          {filteredSpaces.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                Spaces ({filteredSpaces.length})
              </div>
              {filteredSpaces.map(space => (
                <button
                  key={space.id}
                  onClick={() => handleSelectSpace(space.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                    <span className="text-sm">{space.icon || '📁'}</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{space.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Jump</span>
                </button>
              ))}
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                Tasks ({filteredTasks.length})
              </div>
              {filteredTasks.slice(0, 8).map(task => {
                const space = getSpaceById(task.spaceId);
                return (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.status === 'done'
                            ? 'bg-emerald-500'
                            : task.status === 'in_progress'
                            ? 'bg-zinc-900 dark:bg-zinc-100'
                            : 'bg-zinc-400 dark:bg-zinc-600'
                        }`}
                      />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-mono">
                      {space?.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
