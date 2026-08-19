import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'enclosed';
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}: TabsProps<T>) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1 bg-zinc-100/90 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-800', className)}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 shadow-2xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                    isActive ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar', className)}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 py-2.5 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer',
              isActive
                ? 'border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300 font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
            )}
          >
            {tab.icon && <span className={cn('shrink-0', isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-400')}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-[11px] font-semibold',
                  isActive ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
