import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefixIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs uppercase tracking-wider font-kalam text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {prefixIcon && (
          <span className="absolute left-3 text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <input
          className={`w-full font-kalam bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-sm placeholder:text-[#55665A] focus:outline-none focus:border-[#9ED8A3] transition-colors duration-150 dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] dark:focus:border-[#9ED8A3] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:placeholder:text-[#94A3B8] light:focus:border-[#2563EB] ${
            prefixIcon ? 'pl-9' : ''
          } ${error ? 'border-[#E07A7A] dark:border-[#E07A7A] light:border-[#DC2626]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#E07A7A] dark:text-[#E07A7A] light:text-[#DC2626] font-kalam">{error}</span>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs uppercase tracking-wider font-kalam text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          {label}
        </label>
      )}
      <textarea
        className={`w-full font-kalam bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md p-3 text-sm placeholder:text-[#55665A] focus:outline-none focus:border-[#9ED8A3] transition-colors duration-150 resize-y min-h-[100px] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] dark:focus:border-[#9ED8A3] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:placeholder:text-[#94A3B8] light:focus:border-[#2563EB] ${
          error ? 'border-[#E07A7A] dark:border-[#E07A7A] light:border-[#DC2626]' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#E07A7A] dark:text-[#E07A7A] light:text-[#DC2626] font-kalam">{error}</span>}
    </div>
  );
};
