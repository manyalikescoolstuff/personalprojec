import React from 'react';
import { Priority, TaskCategory } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'accent' | 'category';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const variantStyles = {
    default:
      'bg-[#18221E] text-[#8C9E90] border border-[#1E2824] dark:bg-[#18221E] dark:text-[#8C9E90] dark:border-[#1E2824] light:bg-[#F1F5F9] light:text-[#64748B] light:border-[#E2E8F0]',
    urgent:
      'bg-[#E07A7A]/12 text-[#E07A7A] border border-[#E07A7A]/30 dark:bg-[#E07A7A]/12 dark:text-[#E07A7A] dark:border-[#E07A7A]/30 light:bg-[#FEE2E2] light:text-[#DC2626] light:border-[#FECACA] font-medium',
    high:
      'bg-[#D8B07A]/12 text-[#D8B07A] border border-[#D8B07A]/30 dark:bg-[#D8B07A]/12 dark:text-[#D8B07A] dark:border-[#D8B07A]/30 light:bg-[#FEF3C7] light:text-[#D97706] light:border-[#FDE68A]',
    medium:
      'bg-[#18221E] text-[#8C9E90] border border-[#1E2824] dark:bg-[#18221E] dark:text-[#8C9E90] dark:border-[#1E2824] light:bg-[#F8FAFC] light:text-[#64748B] light:border-[#E2E8F0]',
    low:
      'bg-[#111816] text-[#55665A] border border-[#1E2824] dark:bg-[#111816] dark:text-[#55665A] dark:border-[#1E2824] light:bg-[#F8FAFC] light:text-[#94A3B8] light:border-[#E2E8F0]',
    accent:
      'bg-[#9ED8A3]/12 text-[#9ED8A3] border border-[#9ED8A3]/30 dark:bg-[#9ED8A3]/12 dark:text-[#9ED8A3] dark:border-[#9ED8A3]/30 light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE] font-medium',
    category:
      'bg-[#111816] text-[#8C9E90] border border-[#1E2824] dark:bg-[#111816] dark:text-[#8C9E90] dark:border-[#1E2824] light:bg-[#F8FAFC] light:text-[#64748B] light:border-[#E2E8F0]',
  };

  return (
    <span
      className={`inline-flex items-center font-kalam rounded uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const labels: Record<Priority, string> = {
    urgent: 'Urgent',
    high: 'High Priority',
    medium: 'Medium',
    low: 'Low',
  };

  return <Badge variant={priority}>{labels[priority]}</Badge>;
};

export const CategoryBadge: React.FC<{ category: TaskCategory | string }> = ({ category }) => {
  return <Badge variant="category">{category}</Badge>;
};
