import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'accent' | 'command' | 'wood' | 'parchment';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--shadow-ghibli)] hover:border-[var(--border-highlight)] transition-all duration-200',
    elevated:
      'bg-[var(--bg-surface-elevated)] backdrop-blur-2xl border border-[var(--border-highlight)] shadow-[var(--shadow-ghibli)] transition-all duration-200',
    subtle:
      'bg-[var(--bg-surface-subtle)] backdrop-blur-md border border-[var(--border-subtle)]/60 transition-all duration-200',
    accent:
      'bg-[var(--bg-card)] backdrop-blur-xl border-2 border-[var(--accent-primary)]/50 shadow-[0_0_20px_rgba(158,216,163,0.15)] transition-all duration-200',
    command:
      'bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] shadow-lg transition-all duration-200',
    wood:
      'bg-gradient-to-br from-[#2D1E14]/90 to-[#422C1D]/90 border border-[#8C6239]/40 text-[#F5EBE0] shadow-xl',
    parchment:
      'bg-[#FAF6EC]/90 dark:bg-[#1A2634]/90 border border-[#D4C3A3] dark:border-[#3D5266] shadow-md',
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5.5 text-[var(--text-primary)] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
