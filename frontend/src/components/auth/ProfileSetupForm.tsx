import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, User, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import * as api from '../../api';

const USE_CASES = [
  { value: 'personal', label: 'Personal Use', description: 'Organize my own tasks and notes' },
  { value: 'education', label: 'Education / University', description: 'School projects, courses, research' },
  { value: 'work', label: 'Work / Professional', description: 'Team collaboration, client projects' },
  { value: 'other', label: 'Other', description: 'Something else entirely' },
] as const;

export const ProfileSetupForm: React.FC = () => {
  const { currentUser, completeProfile } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [useCase, setUseCase] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = await api.uploadImage(file);
      setAvatarUrl(result.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!useCase) {
      setError('Please select how you plan to use TaskFlow');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await completeProfile({
        name: name.trim(),
        avatar: avatarUrl || undefined,
        useCase,
      });
      setSaved(true);
      // Small delay so user sees success state
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="w-full max-w-sm text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">You're all set!</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 font-bold text-lg shadow-lg mx-auto">
            F
          </div>
          <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tell us a bit about yourself to personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative w-20 h-20 rounded-full cursor-pointer overflow-hidden transition-all
                border-2 border-dashed
                ${dragOver
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-cyan-400 dark:hover:border-cyan-600'
                }
              `}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                  <Camera className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
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
                if (file) handleFileUpload(file);
              }}
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Click or drag to upload a profile picture
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Use Case */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              What will you use TaskFlow for?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {USE_CASES.map(uc => (
                <button
                  key={uc.value}
                  type="button"
                  onClick={() => setUseCase(uc.value)}
                  className={`
                    p-3 rounded-lg border text-left transition-all cursor-pointer
                    ${useCase === uc.value
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }
                  `}
                >
                  <div className={`text-xs font-semibold ${useCase === uc.value ? 'text-cyan-700 dark:text-cyan-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {uc.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {uc.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saving || uploading}>
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              'Complete Profile'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
