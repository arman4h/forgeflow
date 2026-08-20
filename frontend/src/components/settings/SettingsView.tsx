import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Download,
  RotateCcw,
  Moon,
  Sun,
  Camera,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import * as api from '../../api';

const USE_CASES = [
  { value: 'personal', label: 'Personal Use' },
  { value: 'education', label: 'Education / University' },
  { value: 'work', label: 'Work / Professional' },
  { value: 'other', label: 'Other' },
];

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
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editUseCase, setEditUseCase] = useState(currentUser.useCase || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    a.download = `taskflow-backup-${Date.now()}.json`;
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

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setAvatarUrl(result.url);
    } catch (err: any) {
      console.error('Upload failed:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateUser(currentUser.id, {
        name: editName.trim(),
        avatar: avatarUrl || undefined,
        useCase: editUseCase as any,
      } as any);
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Save failed:', err.message);
    } finally {
      setSaving(false);
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
          Manage your profile, theme appearance, and data.
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
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Profile Information</span>
            </h2>
            {!editing && (
              <Button onClick={() => setEditing(true)} variant="ghost" size="sm">
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-14 h-14 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-cyan-400 transition-colors"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                      <Camera className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Click to change profile picture
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Use Case */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Use Case</label>
                <select
                  value={editUseCase}
                  onChange={e => setEditUseCase(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="">Select use case...</option>
                  {USE_CASES.map(uc => (
                    <option key={uc.value} value={uc.value}>{uc.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditing(false);
                  setEditName(currentUser.name);
                  setEditUseCase(currentUser.useCase || '');
                  setAvatarUrl(currentUser.avatar || '');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
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
                  {currentUser.useCase === 'personal' && 'Personal Use'}
                  {currentUser.useCase === 'education' && 'Education / University'}
                  {currentUser.useCase === 'work' && 'Work / Professional'}
                  {currentUser.useCase === 'other' && 'Other'}
                  {!currentUser.useCase && (currentUser.title || 'No use case set')}
                </p>
              </div>
            </div>
          )}
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
