import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Clock, UserCheck, Flag, CheckSquare } from 'lucide-react';
import { Priority, TaskStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    createTask,
    currentSpace,
    joinedSpaces,
    personalSpace,
    currentUser,
    getSpaceMembers,
  } = useApp();

  const [spaceId, setSpaceId] = useState<string>(() => currentSpace?.id || personalSpace.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [dueDate, setDueDate] = useState('');
  const [checklistInput, setChecklistInput] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([]);

  if (!isCreateTaskOpen) return null;

  // Space members for the selected space
  const targetSpaceId = spaceId || currentSpace?.id || personalSpace.id;
  const isTargetPersonal =
    targetSpaceId === personalSpace.id || targetSpaceId.startsWith('sp_personal');
  const spaceMembers = isTargetPersonal ? [] : getSpaceMembers(targetSpaceId);

  const handleAddChecklist = () => {
    if (!checklistInput.trim()) return;
    setChecklistItems(prev => [...prev, checklistInput.trim()]);
    setChecklistInput('');
  };

  const handleRemoveChecklist = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      spaceId: targetSpaceId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'todo',
      assigneeId: isTargetPersonal ? currentUser.id : assigneeId,
      dueDate: dueDate || undefined,
      checklist: checklistItems,
    });

    setIsCreateTaskOpen(false);
    setTitle('');
    setDescription('');
    setDueDate('');
    setChecklistItems([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Create Task</h2>
          <button
            onClick={() => setIsCreateTaskOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Space */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Space
            </label>
            <select
              value={targetSpaceId}
              onChange={e => {
                setSpaceId(e.target.value);
                setAssigneeId(currentUser.id);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none cursor-pointer font-medium text-zinc-800 dark:text-zinc-200"
            >
              <option value={personalSpace.id}>🏠 My Space (Personal / Private)</option>
              {joinedSpaces.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon || '📁'} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Complete architecture diagram or write draft"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Grid: Assignee, Priority, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {!isTargetPersonal && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
                >
                  <option value={currentUser.id}>{currentUser.name.split(' ')[0]} (You)</option>
                  {spaceMembers
                    .filter(m => m.userId !== currentUser.id)
                    .map(m => (
                      <option key={m.id} value={m.userId}>
                        {m.user.name.split(' ')[0]}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none cursor-pointer text-zinc-800 dark:text-zinc-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add key context or instructions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Checklist / Sub-tasks
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add step or sub-item..."
                value={checklistInput}
                onChange={e => setChecklistInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddChecklist}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>

            {checklistItems.length > 0 && (
              <div className="space-y-1 pt-1">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(idx)}
                      className="text-zinc-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
