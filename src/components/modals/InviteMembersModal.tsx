import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Copy, Check, Mail, Share2, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const InviteMembersModal: React.FC = () => {
  const {
    isInviteMembersOpen,
    setIsInviteMembersOpen,
    currentSpace,
    inviteMember,
  } = useApp();

  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  if (!isInviteMembersOpen || !currentSpace) return null;

  const inviteUrl = `https://forgeflow.app/join/${currentSpace.inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteMember(currentSpace.id, email.trim());
    setEmail('');
    setInvitedSuccess(true);
    setTimeout(() => setInvitedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Invite to {currentSpace.name}
            </h2>
          </div>
          <button
            onClick={() => setIsInviteMembersOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shareable Invite Link */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Shareable Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md font-mono text-zinc-800 dark:text-zinc-200 select-all"
            />
            <Button
              id="copy-invite-link-btn"
              onClick={handleCopyLink}
              variant="default"
              size="sm"
              className="flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Anyone with this link can immediately join this space.
          </p>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
          <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">
            Or Send Direct Invite
          </span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
        </div>

        {/* Email Invite Form */}
        <form onSubmit={handleSendInvite} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="colleague@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <Button
              type="submit"
              disabled={!email.trim()}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </Button>
          </div>

          {invitedSuccess && (
            <p className="text-[11px] text-zinc-900 dark:text-zinc-100 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Invitation sent successfully!</span>
            </p>
          )}
        </form>

        <div className="pt-2 flex justify-end border-t border-zinc-100 dark:border-zinc-800">
          <Button
            onClick={() => setIsInviteMembersOpen(false)}
            variant="ghost"
            size="sm"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
