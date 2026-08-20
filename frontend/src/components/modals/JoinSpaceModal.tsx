import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const JoinSpaceModal: React.FC = () => {
  const {
    isJoinSpaceOpen,
    setIsJoinSpaceOpen,
    openInvitePreviewByCode,
  } = useApp();

  const [codeOrUrl, setCodeOrUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isJoinSpaceOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Extract code from potential URL like taskflow.app/join/ABC123
    let cleanCode = codeOrUrl.trim();
    if (cleanCode.includes('/join/')) {
      cleanCode = cleanCode.split('/join/')[1].split('/')[0];
    }

    if (!cleanCode) {
      setError('Please enter an invite code or link');
      setLoading(false);
      return;
    }

    const opened = await openInvitePreviewByCode(cleanCode);
    if (!opened) {
      setError('Invalid or unknown invite code. Please check and try again.');
      setLoading(false);
      return;
    }

    setIsJoinSpaceOpen(false);
    setCodeOrUrl('');
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isJoinSpaceOpen}
      onClose={() => {
        setIsJoinSpaceOpen(false);
        setError('');
      }}
      title="Join a Space"
      description="Enter an invite code or link shared by your teammate, professor, or project lead."
      className="max-w-md"
    >
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <Input
            placeholder="Invite Code or Link"
            value={codeOrUrl}
            onChange={e => {
              setCodeOrUrl(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>}
        </div>

        {/* Quick Demo Suggestions */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
            Available Demo Codes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['CSE320', 'FYP2026', 'TECHMVP', 'DSCLUB'].map(code => (
              <button
                type="button"
                key={code}
                onClick={() => setCodeOrUrl(code)}
                className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer shadow-2xs transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsJoinSpaceOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="default"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Looking up...</span>
              </>
            ) : (
              <>
                <span>Preview & Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
