'use client';

import React, { useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CommandBarProps {
  placeholder?: string;
  autoFocus?: boolean;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  placeholder = 'What should I do right now?',
  autoFocus = false,
}) => {
  const { executeCommand } = useApp();
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      executeCommand('What should I do right now?');
      return;
    }
    executeCommand(inputVal);
    setInputVal('');
  };

  const handleQuickCommand = (cmd: string) => {
    executeCommand(cmd);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Command prompt container - Raycast / Spotlight aesthetic */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full bg-[#111816] border border-[#1E2824] hover:border-[#9ED8A3]/50 focus-within:border-[#9ED8A3] focus-within:shadow-[0_0_15px_rgba(158,216,163,0.1)] rounded-lg transition-all duration-200 dark:bg-[#111816] dark:border-[#1E2824] dark:focus-within:border-[#9ED8A3] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:focus-within:border-[#2563EB] light:focus-within:shadow-[0_0_15px_rgba(37,99,235,0.08)]"
      >
        <div className="flex items-center pl-4 pr-1 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] select-none font-kalam text-lg">
          <span className="font-semibold">&gt;</span>
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent font-kalam text-sm sm:text-base text-[#F3F4F1] placeholder:text-[#55665A] focus:outline-none py-3.5 px-3 pr-24 dark:text-[#F3F4F1] dark:placeholder:text-[#55665A] light:text-[#111827] light:placeholder:text-[#94A3B8]"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          <button
            type="submit"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-kalam text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#151D1A] rounded border border-[#1E2824] transition-colors dark:text-[#8C9E90] dark:border-[#1E2824] dark:hover:bg-[#151D1A] dark:hover:text-[#F3F4F1] light:text-[#64748B] light:border-[#E2E8F0] light:hover:bg-[#F1F5F9] light:hover:text-[#111827]"
            title="Execute command"
          >
            <span>Enter</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Suggested Quick Commands */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#55665A] font-kalam select-none dark:text-[#55665A] light:text-[#94A3B8]">
          Quick actions:
        </span>

        <button
          type="button"
          onClick={() => handleQuickCommand('What should I do right now?')}
          className="inline-flex items-center px-2.5 py-1 rounded text-xs font-kalam bg-[#151D1A] text-[#9ED8A3] border border-[#1E2824] hover:border-[#9ED8A3]/50 hover:bg-[#18221E] transition-colors dark:bg-[#151D1A] dark:text-[#9ED8A3] dark:border-[#1E2824] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE] light:hover:bg-[#DBEAFE]"
        >
          &gt; What should I do right now?
        </button>

        <button
          type="button"
          onClick={() => handleQuickCommand("I'm exhausted")}
          className="inline-flex items-center px-2.5 py-1 rounded text-xs font-kalam bg-[#151D1A] text-[#8C9E90] border border-[#1E2824] hover:border-[#9ED8A3]/50 hover:text-[#F3F4F1] hover:bg-[#18221E] transition-colors dark:bg-[#151D1A] dark:text-[#8C9E90] dark:border-[#1E2824] light:bg-[#F8FAFC] light:text-[#64748B] light:border-[#E2E8F0] light:hover:bg-[#F1F5F9]"
        >
          &gt; I&apos;m exhausted
        </button>

        <button
          type="button"
          onClick={() => handleQuickCommand('Brain dump thoughts')}
          className="inline-flex items-center px-2.5 py-1 rounded text-xs font-kalam bg-[#151D1A] text-[#8C9E90] border border-[#1E2824] hover:border-[#9ED8A3]/50 hover:text-[#F3F4F1] hover:bg-[#18221E] transition-colors dark:bg-[#151D1A] dark:text-[#8C9E90] dark:border-[#1E2824] light:bg-[#F8FAFC] light:text-[#64748B] light:border-[#E2E8F0] light:hover:bg-[#F1F5F9]"
        >
          &gt; Brain dump thoughts
        </button>
      </div>
    </div>
  );
};
