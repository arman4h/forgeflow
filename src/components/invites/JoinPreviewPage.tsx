import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const JoinPreviewPage: React.FC = () => {
  const {
    activeInvitePreview,
    joinSpaceByCode,
    currentUser,
    setCurrentRoute,
  } = useApp();

  if (!activeInvitePreview) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          No active invitation found
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Please verify your invite link or code.
        </p>
        <Button
          onClick={() => setCurrentRoute('home')}
          size="sm"
          variant="default"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  const { space, owner, memberCount } = activeInvitePreview;

  const handleJoin = () => {
    const res = joinSpaceByCode(space.inviteCode);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  return (
    <div id="join-preview-screen" className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-150">
        <div className="w-16 h-16 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl shadow-2xs">
          {space.icon || '🚀'}
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            You're invited to join
          </span>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {space.name}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            {space.description ||
              'Collaborate with the team on tasks, roadmaps, and project deliverables.'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-around text-xs">
          <div className="text-center">
            <div className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">
              Members
            </div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
              {memberCount} joined
            </div>
          </div>
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">
              Invited By
            </div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {owner.name.split(' ')[0]}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button
            id="join-space-submit-btn"
            onClick={handleJoin}
            size="lg"
            variant="default"
            className="w-full flex items-center justify-center gap-2"
          >
            <span>Join Space</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Joining as {currentUser.name} ({currentUser.email})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
