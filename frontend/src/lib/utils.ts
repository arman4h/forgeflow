import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dueDateStr?: string): { days: number; text: string; isOverdue: boolean } {
  if (!dueDateStr) return { days: 0, text: 'No deadline', isOverdue: false };
  const due = new Date(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  } else if (diffDays === 0) {
    return { days: 0, text: 'Due today', isOverdue: false };
  } else if (diffDays === 1) {
    return { days: 1, text: 'Due tomorrow', isOverdue: false };
  } else {
    return { days: diffDays, text: `In ${diffDays} days`, isOverdue: false };
  }
}
