import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger' | 'command' | 'acorn' | 'leaf';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-kalam rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ghibli-btn shadow-md';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#4E8752] to-[#6BA36F] text-white hover:from-[#3D6E41] hover:to-[#588B5C] dark:from-[#5A995F] dark:to-[#74B57A] dark:text-[#0C1A12] font-semibold border border-emerald-400/30 shadow-[0_4px_12px_rgba(78,135,82,0.3)]',
    secondary:
      'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)]',
    subtle:
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] shadow-none',
    danger:
      'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
    command:
      'bg-[var(--bg-surface)] text-[var(--accent-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] shadow-sm',
    acorn:
      'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-semibold border border-amber-300/40 shadow-[0_4px_12px_rgba(217,119,6,0.3)]',
    leaf:
      'bg-gradient-to-r from-[#65A30D] to-[#84CC16] text-white font-semibold border border-lime-300/40 shadow-[0_4px_12px_rgba(101,163,13,0.3)]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
