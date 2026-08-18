import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizes = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-12 w-12 text-base',
  };

  // Deterministic neutral pastel bg based on name
  const colors = [
    'bg-zinc-800 text-zinc-100',
    'bg-slate-700 text-slate-100',
    'bg-stone-700 text-stone-100',
    'bg-neutral-800 text-neutral-100',
    'bg-zinc-700 text-zinc-100',
  ];
  const charCode = name.charCodeAt(0) || 0;
  const colorClass = colors[charCode % colors.length];

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden font-medium select-none ring-1 ring-zinc-200/80',
        sizes[size],
        colorClass,
        className
      )}
      title={name}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<{
  users: { id: string; name: string; avatar?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}> = ({ users, max = 3, size = 'sm' }) => {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden">
      {displayUsers.map(u => (
        <Avatar
          key={u.id}
          src={u.avatar}
          name={u.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 font-semibold ring-2 ring-white',
            size === 'xs' ? 'h-5 w-5 text-[9px]' : size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
