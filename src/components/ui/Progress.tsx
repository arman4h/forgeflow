import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number; // 0 - 100
  className?: string;
  indicatorClassName?: string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  indicatorClassName,
  size = 'sm',
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  const heights = {
    xs: 'h-1.5',
    sm: 'h-2',
    md: 'h-2.5',
  };

  return (
    <div className="w-full flex items-center gap-2.5">
      <div
        className={cn(
          'w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50',
          heights[size],
          className
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full bg-zinc-900',
            clamped === 100 && 'bg-emerald-600',
            indicatorClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-zinc-600 tabular-nums shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
};
