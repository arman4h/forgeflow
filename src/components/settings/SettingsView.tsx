import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Download,
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    joinedSpaces,
    tasks,
    resetAllData,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportData = () => {
    const backup = {
      user: currentUser,
      spaces: joinedSpaces,
      tasks: tasks,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackflow-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo spaces and tasks to fresh initial state?')) {
      resetAllData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <div
      id="settings-view"
      className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-200"
    >
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your profile, theme appearance, collaborator testing personas, and data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Theme Appearance
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Switch between high-contrast pure white (light) and pure black (dark) modes.
              </p>
            </div>
            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Switch to Dark</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-2xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span>Profile Information</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-2xs"
            />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                {currentUser.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser.email}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                {currentUser.title || 'Student / Team Member'}
              </p>
            </div>
          </div>
        </div>

        {/* Data & Backup */}
        <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Data Portability & State
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Export All Spaces & Tasks
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Download complete JSON snapshot of your data.
              </p>
            </div>
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Reset Demo Data
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Restore default demo spaces (CSE 320, FYP, Company, Club).
              </p>
            </div>
            <Button
              onClick={handleReset}
              variant="destructive"
              size="sm"
              className="self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetSuccess ? 'Reset Complete!' : 'Reset All Data'}</span>
            </Button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Account
          </h2>
          <Button
            onClick={() => { logout(); }}
            variant="destructive"
            size="sm"
          >
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
