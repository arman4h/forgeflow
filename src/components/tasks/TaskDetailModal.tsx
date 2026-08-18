import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  UserCheck,
  Flag,
  Trash2,
  MessageSquare,
  Plus,
  Send,
  CheckSquare,
  Share2,
} from 'lucide-react';
import { Priority, TaskStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    taskComments,
    addComment,
    deleteComment,
    getSpaceById,
    getUserById,
    currentUser,
    getSpaceMembers,
    personalSpace,
  } = useApp();

  const [newComment, setNewComment] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  if (!selectedTaskId) return null;

  const task = tasks.find(t => t.id === selectedTaskId);
  if (!task) return null;

  const space = getSpaceById(task.spaceId);
  const assignee = getUserById(task.assigneeId);
  const reporter = getUserById(task.reporterId);
  const comments = taskComments(task.id);
  const isPersonal =
    task.spaceId === personalSpace.id || task.spaceId.startsWith('sp_personal');
  const spaceMembers = isPersonal ? [] : getSpaceMembers(task.spaceId);
  const isDone = task.status === 'done';

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(task.id, newComment.trim());
    setNewComment('');
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    addChecklistItem(task.id, newChecklistTitle.trim());
    setNewChecklistTitle('');
  };

  return (
    <Modal
      isOpen={!!selectedTaskId}
      onClose={() => setSelectedTaskId(null)}
      title={
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>{space?.icon || '📁'}</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
            {space?.name || 'My Space'}
          </span>
        </div>
      }
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Task Title & Complete Button */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTaskCompleted(task.id)}
            className="mt-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0 cursor-pointer"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 hover:text-indigo-600 dark:hover:text-indigo-400" />
            )}
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={task.title}
              onChange={e => updateTask(task.id, { title: e.target.value })}
              className={`w-full text-base md:text-lg font-bold text-zinc-950 dark:text-zinc-50 bg-transparent focus:outline-none border-b border-transparent focus:border-indigo-500 pb-0.5 ${
                isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
              }`}
            />
          </div>
        </div>

        {/* Metadata Controls Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
          {/* Status */}
          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
              Status
            </span>
            <select
              value={task.status}
              onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
              className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
              Priority
            </span>
            <select
              value={task.priority}
              onChange={e => updateTask(task.id, { priority: e.target.value as Priority })}
              className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
              Assignee
            </span>
            {isPersonal ? (
              <div className="h-8 flex items-center px-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-700 dark:text-zinc-300 text-xs">
                {currentUser.name.split(' ')[0]} (You)
              </div>
            ) : (
              <select
                value={task.assigneeId || ''}
                onChange={e => updateTask(task.id, { assigneeId: e.target.value || undefined })}
                className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {spaceMembers.map(m => (
                  <option key={m.id} value={m.userId}>
                    {m.user.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Date */}
          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
              Due Date
            </span>
            <input
              type="date"
              value={task.dueDate || ''}
              onChange={e => updateTask(task.id, { dueDate: e.target.value || undefined })}
              className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Add task notes, specifications, or context..."
          value={task.description || ''}
          onChange={e => updateTask(task.id, { description: e.target.value })}
          rows={3}
        />

        {/* Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Checklist ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})
          </label>

          <div className="space-y-1.5">
            {task.checklist.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950/80 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => toggleChecklistItem(task.id, item.id)}
                    className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`text-zinc-800 dark:text-zinc-200 ${
                      item.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <button
                  onClick={() => removeChecklistItem(task.id, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newChecklistTitle}
                onChange={e => setNewChecklistTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <Button type="submit" size="sm" variant="secondary">
                Add Item
              </Button>
            </form>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Discussion ({comments.length})</span>
          </h3>

          <div className="space-y-3">
            {comments.map(c => {
              const author = getUserById(c.authorId);
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          author?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                        }
                        alt={author?.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {author?.name || 'Teammate'}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                      {c.createdAt.split('T')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-7">
                    {c.content}
                  </p>
                </div>
              );
            })}

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment or update..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <Button
                type="submit"
                disabled={!newComment.trim()}
                size="sm"
                variant="default"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm('Delete this task?')) {
                deleteTask(task.id);
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedTaskId(null)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
