'use client';

import React from 'react';
import { PenLine } from 'lucide-react';

interface EmptyBrainStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyBrainState: React.FC<EmptyBrainStateProps> = ({ onSelectPrompt }) => {
  const starterPrompts = [
    'I have DBMS tomorrow, buy shampoo today, call mom and maybe start DSA this weekend.',
    'Assignment 4 is due Thursday 5 PM, need to prepare lab slides, gym at six, and drink 2L water.',
    'Submit project declaration form before 5 PM, review Java repo notes, and call Dad tonight.',
  ];

  return (
    <div className="text-center py-5 px-4 space-y-4 max-w-lg mx-auto select-none font-kalam">
      <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-[#18221E] border border-[#283630] text-[#9ED8A3] dark:bg-[#18221E] dark:border-[#283630] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:border-[#BFDBFE] light:text-[#2563EB]">
        <PenLine className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Dump everything here.
        </h3>
        <p className="text-xs sm:text-sm text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          Tasks, ideas, reminders, screenshots, random thoughts. Don&apos;t organize anything. I&apos;ll handle that.
        </p>
      </div>

      <div className="space-y-2 pt-1 text-left">
        <span className="text-[11px] uppercase tracking-wider text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] block text-center">
          Or tap a sample dump to test:
        </span>
        <div className="space-y-1.5">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left p-2.5 rounded-lg border border-[#1E2824] bg-[#111816] hover:border-[#9ED8A3]/50 hover:bg-[#151D1A] transition-colors text-xs text-[#8C9E90] hover:text-[#F3F4F1] dark:bg-[#111816] dark:border-[#1E2824] dark:hover:border-[#9ED8A3]/50 dark:hover:text-[#F3F4F1] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:hover:border-[#2563EB]/40 light:hover:bg-[#F8FAFC] light:text-[#64748B] light:hover:text-[#111827]"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
