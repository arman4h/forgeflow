import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  width?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  className,
  width = 'w-56',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 rounded-lg bg-white dark:bg-black p-1 text-zinc-950 dark:text-zinc-100 shadow-xl ring-1 ring-zinc-200/80 dark:ring-zinc-800 focus:outline-hidden animate-in fade-in zoom-in-95 duration-100',
            width,
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  active?: boolean;
  className?: string;
}> = ({ children, onClick, icon, destructive, active, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-colors font-medium cursor-pointer',
        destructive
          ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50'
          : active
          ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 font-semibold'
          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50',
        className
      )}
    >
      {icon && <span className={cn('shrink-0', destructive ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500')}>{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export const DropdownSeparator = () => (
  <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800 -mx-1" />
);

export const DropdownHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
    {children}
  </div>
);
