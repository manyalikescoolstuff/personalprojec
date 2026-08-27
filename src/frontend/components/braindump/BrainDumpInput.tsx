'use client';

import React, { useRef, useEffect } from 'react';

interface BrainDumpInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const BrainDumpInput: React.FC<BrainDumpInputProps> = ({
  value,
  onChange,
  placeholder = 'Type everything. Messy is completely okay.',
  autoFocus = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height gracefully
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full relative space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={5}
        className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] focus:border-[#9ED8A3] focus:shadow-[0_0_20px_rgba(158,216,163,0.06)] rounded-xl p-4 sm:p-5 text-base sm:text-lg font-kalam placeholder:text-[#55665A] focus:outline-none transition-all resize-none leading-relaxed dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] dark:focus:border-[#9ED8A3] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:placeholder:text-[#94A3B8] light:focus:border-[#2563EB] light:focus:shadow-[0_0_20px_rgba(37,99,235,0.06)]"
      />

      <div className="flex items-center justify-between px-1 text-xs text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] font-kalam">
        <span>Messy thoughts welcome. No formatting required.</span>
        {wordCount > 0 && <span>{wordCount} words</span>}
      </div>
    </div>
  );
};
