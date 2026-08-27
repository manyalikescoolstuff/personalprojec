import React from 'react';
import { Priority, TaskCategory } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'accent' | 'category' | 'leaf' | 'acorn';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  };

  const variantStyles = {
    default:
      'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
    urgent:
      'bg-red-500/15 text-red-400 border border-red-500/30 font-medium',
    high:
      'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium',
    medium:
      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    low:
      'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    accent:
      'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 font-medium',
    category:
      'bg-[#8B5E3C]/15 text-[#D4A373] dark:text-[#E8C59C] border border-[#8B5E3C]/30',
    leaf:
      'bg-lime-500/15 text-lime-400 border border-lime-500/30',
    acorn:
      'bg-amber-600/15 text-amber-400 border border-amber-600/30',
  };

  return (
    <span
      className={`inline-flex items-center font-kalam rounded-full tracking-wide shadow-sm ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const meta: Record<Priority, { label: string; icon: string }> = {
    urgent: { label: 'Urgent', icon: '🌰' },
    high: { label: 'High', icon: '🍃' },
    medium: { label: 'Medium', icon: '🌱' },
    low: { label: 'Gentle', icon: '⭐' },
  };

  const current = meta[priority] || meta.medium;

  return (
    <Badge variant={priority} icon={<span>{current.icon}</span>}>
      {current.label}
    </Badge>
  );
};

export const CategoryBadge: React.FC<{ category: TaskCategory | string }> = ({ category }) => {
  const categoryIcons: Record<string, string> = {
    Academics: '📚',
    Projects: '🛠️',
    Personal: '🏡',
    Health: '🌿',
    Admin: '✉️',
  };

  return (
    <Badge variant="category" icon={<span>{categoryIcons[category] || '🌱'}</span>}>
      {category}
    </Badge>
  );
};
