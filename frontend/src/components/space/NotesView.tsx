import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Search,
  Check,
  Copy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { MarkdownEditor } from '../ui/MarkdownEditor';
import { MarkdownContent } from '../ui/MarkdownContent';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Note as SpaceNote } from '../../types';

export const NotesView: React.FC = () => {
  const {
    currentSpace,
    notes,
    createNote,
    updateNote,
    deleteNote,
    currentUser,
    getUserById,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SpaceNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  if (!currentSpace) return null;

  const spaceNotes = notes.filter(n => n.spaceId === currentSpace.id);

  const filteredNotes = spaceNotes.filter(n => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  const openCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEdit = (n: SpaceNote) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content);
    setIsPinned(!!n.isPinned);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
    } else {
      createNote({
        spaceId: currentSpace.id,
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
    }
    setIsModalOpen(false);
  };

  const handleCopy = (n: SpaceNote) => {
    navigator.clipboard.writeText(`${n.title}\n\n${n.content}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span>Space Docs & Scratchpad ({spaceNotes.length})</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Meeting agendas, sprint plans, architecture briefs, and shared notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} size="sm" variant="default">
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {spaceNotes.length > 0 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search notes and docs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
          />
        </div>
      )}

      {/* Note Grid */}
      {sortedNotes.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
          <FileText className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-600" />
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">No notes found</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Keep meeting records and important context together in this space.
            </p>
          </div>
          <Button onClick={openCreate} variant="outline" size="sm">
            Write First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map(n => {
            const author = getUserById(n.authorId);
            return (
              <div
                key={n.id}
                className={`group p-4 rounded-lg border transition-all flex flex-col justify-between space-y-3 relative ${
                  n.isPinned
                    ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-50/80 dark:bg-zinc-900/50 shadow-2xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateNote(n.id, { isPinned: !n.isPinned })}
                        className={`p-1 rounded transition-colors ${
                          n.isPinned
                            ? 'text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                        title={n.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="line-clamp-6">
                    <MarkdownContent content={n.content} />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span>By {author?.name.split(' ')[0] || 'Member'}</span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(n)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Copy text"
                    >
                      {copiedId === n.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(n)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
        description="Share context, documentation, or scratch notes with your team."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Note Title *"
            placeholder="e.g. Architecture Overview, Meeting Agenda"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />

          <MarkdownEditor
            label="Note Content"
            value={content}
            onChange={setContent}
            placeholder="Write markdown, bullets, or detailed notes..."
            rows={8}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pin-note-check"
              checked={isPinned}
              onChange={e => setIsPinned(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-950 cursor-pointer"
            />
            <label
              htmlFor="pin-note-check"
              className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Pin this note to the top of the space
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="default">
              {editingNote ? 'Save Changes' : 'Create Note'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
