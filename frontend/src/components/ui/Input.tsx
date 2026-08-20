import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 shadow-2xs transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-hidden focus-visible:border-cyan-600 dark:focus-visible:border-cyan-400 focus-visible:ring-1 focus-visible:ring-cyan-600 dark:focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-20 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-2xs transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-hidden focus-visible:border-cyan-600 dark:focus-visible:border-cyan-400 focus-visible:ring-1 focus-visible:ring-cyan-600 dark:focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
