import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Milestone as SpaceMilestone } from '../../types';

export const MilestoneView: React.FC = () => {
  const {
    currentSpace,
    milestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    spaceTasks,
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<SpaceMilestone | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'in_progress' | 'completed'>('upcoming');

  if (!currentSpace) return null;

  const spaceMilestones = milestones.filter(m => m.spaceId === currentSpace.id);

  const openCreate = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setStatus('upcoming');
    setIsCreateOpen(true);
  };

  const openEdit = (m: SpaceMilestone) => {
    setEditingMilestone(m);
    setTitle(m.title);
    setDescription(m.description || '');
    setDueDate(m.dueDate);
    setStatus(m.status);
    setIsCreateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    if (editingMilestone) {
      updateMilestone(editingMilestone.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        status,
      });
    } else {
      createMilestone({
        spaceId: currentSpace.id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        status,
      });
    }
    setIsCreateOpen(false);
  };

  const getStatusBadge = (st: 'upcoming' | 'in_progress' | 'completed') => {
    switch (st) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Upcoming</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span>Milestones & Roadmaps ({spaceMilestones.length})</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key target delivery dates and sprint goals for {currentSpace.name}
          </p>
        </div>
        <Button onClick={openCreate} size="sm" variant="default">
          <Plus className="w-3.5 h-3.5" />
          <span>New Milestone</span>
        </Button>
      </div>

      {spaceMilestones.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
          <Target className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-600" />
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">No milestones set</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Break down this project into major checkpoints or key releases.
            </p>
          </div>
          <Button onClick={openCreate} variant="outline" size="sm">
            Create First Milestone
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaceMilestones.map(m => {
            const isCompleted = m.status === 'completed';
            return (
              <div
                key={m.id}
                className="group p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateMilestone(m.id, {
                            status: isCompleted ? 'in_progress' : 'completed',
                          })
                        }
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-400 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-zinc-100" />
                        )}
                      </button>
                      <h3
                        className={`text-xs font-semibold text-zinc-900 dark:text-zinc-100 ${
                          isCompleted ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                        }`}
                      >
                        {m.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(m.status)}
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 pl-6 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pl-6">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Target: {m.dueDate}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMilestone(m.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
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

      {/* Modal Dialog */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingMilestone ? 'Edit Milestone' : 'Create Milestone'}
        description="Set delivery checkpoints to align your team."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Milestone Title *"
            placeholder="e.g. Beta Launch, Final Report Submission"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="Outline what needs to be delivered for this milestone..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Target Due Date *"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="default">
              {editingMilestone ? 'Save Changes' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
