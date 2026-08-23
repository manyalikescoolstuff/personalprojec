import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'accent' | 'command';
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
      'bg-[#151D1A] border border-[#1E2824] dark:bg-[#151D1A] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0]',
    elevated:
      'bg-[#18221E] border border-[#283630] shadow-sm dark:bg-[#18221E] dark:border-[#283630] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:shadow-sm',
    subtle:
      'bg-[#111816] border border-[#1E2824] dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0]',
    accent:
      'bg-[#151D1A] border border-[#9ED8A3]/40 dark:bg-[#151D1A] dark:border-[#9ED8A3]/40 light:bg-[#EFF6FF] light:border-[#BFDBFE]',
    command:
      'bg-[#111816] border border-[#1E2824] hover:border-[#9ED8A3]/60 transition-colors duration-150 dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:hover:border-[#2563EB]/60',
  };

  return (
    <div
      className={`rounded-lg p-4 sm:p-5 text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
