import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  User,
  Plus,
  Compass,
  Settings,
  Search,
  ChevronRight,
  Sun,
  Moon,
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    users,
    switchCurrentUser,
    joinedSpaces,
    currentSpace,
    currentRoute,
    setCurrentRoute,
    switchSpace,
    setIsCreateSpaceOpen,
    setIsJoinSpaceOpen,
    setIsCommandPaletteOpen,
    myTasks,
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();

  const pendingMyTasksCount = myTasks.filter(t => t.status !== 'done').length;

  const handleNavigateHome = () => {
    switchSpace(null);
    setCurrentRoute('home');
    setIsMobileSidebarOpen(false);
  };

  const handleNavigateMySpace = () => {
    switchSpace('personal');
    setIsMobileSidebarOpen(false);
  };

  const handleSelectSpace = (spaceId: string) => {
    switchSpace(spaceId);
    setIsMobileSidebarOpen(false);
  };

  const handleNavigateSettings = () => {
    switchSpace(null);
    setCurrentRoute('settings');
    setIsMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div
          onClick={handleNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-400 transition-all">
            F
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
              ForgeFlow
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block -mt-0.5 font-medium">
              Simple Spaces
            </span>
          </div>
        </div>

        {/* Quick Search trigger, Theme Toggle & Mobile Close */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-zinc-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setIsCommandPaletteOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            title="Search anything (⌘K)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        {/* Navigation Core */}
        <div className="space-y-1">
          <button
            id="nav-home-btn"
            onClick={handleNavigateHome}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentRoute === 'home' && !currentSpace
                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-900/50 shadow-2xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className={`w-4 h-4 ${currentRoute === 'home' && !currentSpace ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-700 dark:text-zinc-300'}`} />
              <span>Home</span>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">Command</span>
          </button>

          <button
            id="nav-my-space-btn"
            onClick={handleNavigateMySpace}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentRoute === 'my_space'
                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-900/50 shadow-2xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className={`w-4 h-4 ${currentRoute === 'my_space' ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-700 dark:text-zinc-300'}`} />
              <span>My Space</span>
            </div>
            {pendingMyTasksCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                {pendingMyTasksCount}
              </span>
            )}
          </button>
        </div>

        {/* Spaces Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Spaces ({joinedSpaces.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsJoinSpaceOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                title="Join Space with invite code"
                className="p-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-zinc-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 text-[11px] flex items-center gap-1 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsCreateSpaceOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                title="Create a new Space"
                className="p-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-zinc-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {joinedSpaces.map(space => {
              const isSelected = currentSpace?.id === space.id;
              return (
                <button
                  key={space.id}
                  id={`space-btn-${space.id}`}
                  onClick={() => handleSelectSpace(space.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isSelected
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-900/50 shadow-2xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base leading-none">{space.icon || '🚀'}</span>
                    <span className="truncate">{space.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                      {space.memberIds.length}
                    </span>
                    {isSelected && <ChevronRight className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
                  </div>
                </button>
              );
            })}

            {joinedSpaces.length === 0 && (
              <div className="p-3 text-center rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
                No spaces yet.
                <button
                  onClick={() => {
                    setIsJoinSpaceOpen(true);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="mt-1.5 block mx-auto text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  Join or create one
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <button
            onClick={() => {
              setIsJoinSpaceOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
          >
            <Compass className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Join Space</span>
          </button>
          <button
            onClick={() => {
              setIsCreateSpaceOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
          >
            <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Create Space</span>
          </button>
        </div>
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
            />
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                {currentUser.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNavigateSettings}
              title="Settings"
              className={`p-1.5 rounded-md text-zinc-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                currentRoute === 'settings' ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300' : ''
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Switcher Pill */}
        <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Viewing as:</span>
          <select
            value={currentUser.id}
            onChange={e => switchCurrentUser(e.target.value)}
            className="bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 text-[11px] rounded px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 cursor-pointer shadow-2xs"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name.split(' ')[0]} ({u.title?.split(' ')[0] || 'User'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="app-sidebar-desktop"
        className="hidden lg:flex w-64 h-screen flex-col flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 z-20 transition-colors"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Sliding Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl border-r border-zinc-200 dark:border-zinc-800 z-10 animate-in slide-in-from-left duration-200 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

