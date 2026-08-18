import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const variants = {
      default: 'bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 dark:bg-cyan-500 dark:text-zinc-950 dark:font-semibold dark:hover:bg-cyan-400 dark:active:bg-cyan-600 border border-transparent shadow-xs',
      secondary: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-200 dark:hover:border-cyan-900/50 active:bg-zinc-200 border border-zinc-200/70 dark:border-zinc-800',
      outline: 'bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-300 dark:hover:border-cyan-800 active:bg-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-xs',
      ghost: 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-cyan-700 dark:hover:text-cyan-300 active:bg-zinc-200/70 border-transparent',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border-transparent shadow-xs',
      link: 'bg-transparent text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline-offset-4 hover:underline p-0 border-transparent',
    };

    const sizes = {
      xs: 'h-7 px-2 text-xs rounded-md font-medium gap-1.5',
      sm: 'h-8 px-2.5 text-xs rounded-md font-medium gap-1.5',
      md: 'h-9 px-3.5 text-sm rounded-lg font-medium gap-2',
      lg: 'h-10 px-4 text-base rounded-lg font-medium gap-2',
      icon: 'h-8 w-8 rounded-md p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
