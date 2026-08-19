import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';
import { SpaceCategory } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MarkdownEditor } from '../ui/MarkdownEditor';

const ICONS = ['🎓', '🔬', '🏢', '👥', '💼', '🚀', '⚡', '💻', '🎨', '📚'];

export const CreateSpaceModal: React.FC = () => {
  const {
    isCreateSpaceOpen,
    setIsCreateSpaceOpen,
    createSpace,
    setIsInviteMembersOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎓');
  const [category, setCategory] = useState<SpaceCategory>('university');

  if (!isCreateSpaceOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createSpace(name.trim(), description.trim(), icon, category);
    setIsCreateSpaceOpen(false);
    setName('');
    setDescription('');

    // Offer to invite members immediately
    setIsInviteMembersOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Create a Space</h2>
          </div>
          <button
            onClick={() => setIsCreateSpaceOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ICONS.map(emoji => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-all ${
                    icon === emoji
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black scale-105 font-bold shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Space Name *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. CSE 320 Project or Mobile App"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as SpaceCategory)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
            >
              <option value="university">University Course / Capstone</option>
              <option value="research">Research Project / Thesis</option>
              <option value="company">Company / Startup Team</option>
              <option value="club">Club / Student Organization</option>
              <option value="freelance">Freelance Client Work</option>
              <option value="other">General Project</option>
            </select>
          </div>

          {/* Description */}
          <MarkdownEditor
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What is this space for?"
            rows={2}
          />

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateSpaceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!name.trim()}
            >
              Create Space
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
