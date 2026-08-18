import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {label && (
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'flex h-9 w-full appearance-none rounded-md border border-zinc-200 bg-white px-3 py-1.5 pr-8 text-sm text-zinc-900 shadow-2xs transition-colors focus-visible:outline-hidden focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:border-zinc-300 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
              error && 'border-rose-500 focus-visible:border-rose-500',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
