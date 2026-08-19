import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const WelcomeToSpace: React.FC = () => {
  const { justJoinedSpace, dismissWelcome, switchSpace } = useApp();

  if (!justJoinedSpace) return null;

  const space = justJoinedSpace;

  const handleContinue = () => {
    dismissWelcome();
    switchSpace(space.id);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg text-center space-y-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Celebration icon */}
        <div className="relative mx-auto">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/40 dark:to-cyan-900/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-4xl shadow-lg">
            {space.icon || '🚀'}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Welcome message */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Welcome aboard!
            </span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            You've joined{' '}
            <span className="text-cyan-600 dark:text-cyan-400">{space.name}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {space.description || 'Start collaborating with your team on tasks, notes, and project milestones.'}
          </p>
        </div>

        {/* Space stats */}
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Users className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {space.memberIds?.length || 1}
            </span>
            <span>member{(space.memberIds?.length || 1) !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Category: <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{space.category || 'general'}</span>
          </div>
        </div>

        {/* What you can do */}
        <div className="bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 text-left space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Here's what you can do
          </span>
          {[
            { icon: '✅', text: 'Create and manage tasks with priorities & deadlines' },
            { icon: '📝', text: 'Write shared notes and documentation' },
            { icon: '🎯', text: 'Track milestones and project progress' },
            { icon: '💬', text: 'Comment and collaborate on tasks' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300">
              <span className="text-sm">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            size="lg"
            variant="default"
            className="w-full flex items-center justify-center gap-2 text-sm"
          >
            <span>Continue to {space.name}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            onClick={() => {
              dismissWelcome();
            }}
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
