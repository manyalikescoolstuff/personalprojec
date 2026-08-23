import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger' | 'command';
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
    'inline-flex items-center justify-center font-kalam font-normal rounded-md transition-all duration-150 select-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#9ED8A3] text-[#0A0F0D] hover:bg-[#B2E2B6] active:bg-[#8DC592] font-medium shadow-sm dark:bg-[#9ED8A3] dark:text-[#0A0F0D] dark:hover:bg-[#B2E2B6] light:bg-[#2563EB] light:text-[#FFFFFF] light:hover:bg-[#1D4ED8]',
    secondary:
      'bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] hover:border-[#9ED8A3] hover:bg-[#18221E] dark:bg-[#151D1A] dark:text-[#F3F4F1] dark:border-[#1E2824] dark:hover:border-[#9ED8A3] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:hover:bg-[#F8FAFC] light:hover:border-[#CBD5E1]',
    subtle:
      'bg-transparent text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#111816] dark:text-[#8C9E90] dark:hover:text-[#F3F4F1] dark:hover:bg-[#111816] light:text-[#64748B] light:hover:text-[#111827] light:hover:bg-[#F1F5F9]',
    danger:
      'bg-[#E07A7A]/15 text-[#E07A7A] border border-[#E07A7A]/30 hover:bg-[#E07A7A]/25 dark:text-[#E07A7A] light:bg-[#DC2626]/10 light:text-[#DC2626] light:border-[#DC2626]/25',
    command:
      'bg-[#111816] text-[#9ED8A3] border border-[#1E2824] hover:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#9ED8A3] dark:border-[#1E2824] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE] light:hover:bg-[#DBEAFE]',
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
