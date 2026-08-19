import React from 'react';
import { cn } from '../../lib/utils';
import { Priority, SpaceCategory, SpaceRole, TaskStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 dark:font-semibold border-transparent shadow-2xs',
    primary: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/80',
    secondary: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800',
    outline: 'bg-transparent text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    destructive: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    neutral: 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border leading-none transition-colors whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'done':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Done
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          In Progress
        </Badge>
      );
    case 'todo':
    default:
      return (
        <Badge variant="outline">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Todo
        </Badge>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'urgent':
      return (
        <Badge variant="destructive">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Urgent
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Medium
        </Badge>
      );
    case 'low':
    default:
      return (
        <Badge variant="neutral">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Low
        </Badge>
      );
  }
};

export const SpaceCategoryBadge: React.FC<{ category: SpaceCategory }> = ({ category }) => {
  const labels: Record<SpaceCategory, string> = {
    university: 'University',
    research: 'Research',
    company: 'Company',
    club: 'Club',
    freelance: 'Freelance',
    personal: 'Personal',
    other: 'General',
  };

  return (
    <Badge variant="secondary" className="font-normal text-zinc-600 dark:text-zinc-400 bg-zinc-100/90 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      {labels[category] || category}
    </Badge>
  );
};

export const RoleBadge: React.FC<{ role: SpaceRole }> = ({ role }) => {
  switch (role) {
    case 'owner':
      return <Badge variant="primary" className="font-semibold">Owner</Badge>;
    case 'member':
    default:
      return <Badge variant="neutral">Member</Badge>;
  }
};
