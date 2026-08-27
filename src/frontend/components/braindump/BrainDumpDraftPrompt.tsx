'use client';

import React from 'react';
import { FileText, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BrainDumpDraftPromptProps {
  draftSnippet: string;
  updatedAt?: number;
  onContinue: () => void;
  onDiscard: () => void;
}

export const BrainDumpDraftPrompt: React.FC<BrainDumpDraftPromptProps> = ({
  draftSnippet,
  updatedAt,
  onContinue,
  onDiscard,
}) => {
  const formattedTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Earlier';

  return (
    <div className="p-4 rounded-xl border border-[#9ED8A3]/30 bg-[#151D1A] dark:bg-[#151D1A] dark:border-[#9ED8A3]/30 light:bg-[#EFF6FF] light:border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-kalam animate-in fade-in duration-200">
      <div className="space-y-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>Continue your Brain Dump?</span>
          <span className="text-[10px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]">
            (Saved {formattedTime})
          </span>
        </div>
        <p className="text-xs text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] truncate font-sans">
          &ldquo;{draftSnippet || 'Unfinished thought...'}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="subtle"
          size="sm"
          onClick={onDiscard}
          className="text-xs text-[#8C9E90] hover:text-[#E07A7A]"
          icon={<Trash2 className="w-3 h-3" />}
        >
          Discard
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onContinue}
          icon={<ArrowRight className="w-3 h-3" />}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
