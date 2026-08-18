import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  UserPlus,
  Bell,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const {
    currentSpace,
    currentRoute,
    setIsCreateTaskOpen,
    setIsInviteMembersOpen,
    setIsCommandPaletteOpen,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    theme,
    toggleTheme,
    setIsMobileSidebarOpen,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header
      id="app-navbar"
      className="h-14 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 px-3 md:px-6 flex items-center justify-between z-10 flex-shrink-0 transition-colors"
    >
      {/* Left Menu toggle & Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        {/* Mobile Sidebar Hamburger */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-1.5 -ml-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex-shrink-0"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentRoute === 'home' && (
          <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50 truncate">
            <span>Command Center</span>
          </div>
        )}

        {currentRoute === 'my_space' && (
          <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50 truncate">
            <span>My Space</span>
            <span className="text-zinc-300 dark:text-zinc-700 font-normal hidden sm:inline">/</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-normal text-xs hidden sm:inline">Personal Focus</span>
          </div>
        )}

        {currentRoute === 'space_detail' && currentSpace && (
          <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50 truncate">
            <span className="text-base sm:text-lg leading-none">{currentSpace.icon || '🚀'}</span>
            <span className="truncate max-w-[120px] sm:max-w-xs md:max-w-md">{currentSpace.name}</span>
            {currentSpace.category && (
              <Badge variant="secondary" className="hidden md:inline-flex capitalize text-[10px]">
                {currentSpace.category}
              </Badge>
            )}
          </div>
        )}

        {currentRoute === 'settings' && (
          <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50 truncate">
            <span>Settings</span>
          </div>
        )}

        {currentRoute === 'join_preview' && (
          <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-zinc-50 truncate">
            <span>Join Invitation</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Quick Search trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-200 dark:hover:border-cyan-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span>Quick find...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-2xs text-zinc-500 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Quick Search Button */}
        <Button
          onClick={() => setIsCommandPaletteOpen(true)}
          variant="ghost"
          size="icon"
          title="Search"
          className="md:hidden h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Space specific action: Invite */}
        {currentSpace && (
          <Button
            id="navbar-invite-btn"
            onClick={() => setIsInviteMembersOpen(true)}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 h-8 text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Invite Members</span>
            <span className="md:hidden">Invite</span>
          </Button>
        )}

        {/* Create Task Button */}
        <Button
          id="navbar-create-task-btn"
          onClick={() => setIsCreateTaskOpen(true)}
          variant="default"
          size="sm"
          className="flex items-center gap-1.5 h-8 text-xs px-2.5 sm:px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Task</span>
        </Button>

        {/* Theme Toggle Button */}
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 ring-2 ring-white dark:ring-black" />
            )}
          </Button>

          {isNotifOpen && (
            <div className="fixed sm:absolute top-14 sm:top-auto right-2 sm:right-0 mt-1 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white dark:bg-black rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                  Notifications
                </span>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 py-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                        !n.read
                          ? 'bg-cyan-50/60 dark:bg-cyan-950/40 font-medium'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-zinc-950 dark:text-zinc-50 font-semibold">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

