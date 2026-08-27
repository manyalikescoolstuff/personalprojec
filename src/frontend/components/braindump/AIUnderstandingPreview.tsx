'use client';

import React, { useState } from 'react';
import { Check, Sparkles, AlertTriangle, Eye } from 'lucide-react';
import { ExtractedBrainItem, ExtractedItemType } from '@/types';
import { EditableExtractedItem } from './EditableExtractedItem';
import { Button } from '@/components/ui/Button';

interface AIUnderstandingPreviewProps {
  summary: string;
  items: ExtractedBrainItem[];
  visionConfigured?: boolean;
  visionProviderUsed?: string;
  visionStatusMessage?: string;
  onUpdateItem: (updated: ExtractedBrainItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleSelectItem: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onConfirmAdd: () => void;
  onAcceptSingleItem: (item: ExtractedBrainItem) => void;
  onDiscard: () => void;
}

export const AIUnderstandingPreview: React.FC<AIUnderstandingPreviewProps> = ({
  summary,
  items,
  visionConfigured,
  visionProviderUsed,
  visionStatusMessage,
  onUpdateItem,
  onDeleteItem,
  onToggleSelectItem,
  onSelectAll,
  onConfirmAdd,
  onAcceptSingleItem,
  onDiscard,
}) => {
  const [filterType, setFilterType] = useState<'all' | ExtractedItemType>('all');

  const pendingItems = items.filter((i) => !i.isAccepted);
  const selectedPendingCount = pendingItems.filter((i) => i.selected).length;
  const acceptedCount = items.filter((i) => i.isAccepted).length;

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const allSelected = pendingItems.length > 0 && pendingItems.every((i) => i.selected);

  const counts = {
    all: items.length,
    task: items.filter((i) => i.type === 'task').length,
    deadline: items.filter((i) => i.type === 'deadline').length,
    reminder: items.filter((i) => i.type === 'reminder').length,
    routine: items.filter((i) => i.type === 'routine').length,
    event: items.filter((i) => i.type === 'event').length,
  };

  return (
    <div className="w-full space-y-5 font-kalam animate-in fade-in duration-300">
      {/* Unconfigured Vision Provider Warning (Honest state, safe preservation) */}
      {visionConfigured === false && (
        <div className="p-4 rounded-xl bg-[#231A15] border border-[#D8B07A]/40 text-[#D8B07A] space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-medium text-sm text-[#F3F4F1]">
              Image understanding isn&apos;t configured yet
            </h3>
          </div>
          <p className="text-xs text-[#C8B8A0] font-sans leading-relaxed">
            {visionStatusMessage ||
              'Your uploaded screenshot is safely preserved. To enable vision AI extraction, set GEMINI_API_KEY or OPENAI_API_KEY in your .env.local file.'}
          </p>
          <div className="text-[11px] font-mono bg-[#140E0A] p-2 rounded border border-[#3E2D20] text-[#E0D0C0]">
            # Add to .env.local<br />
            GEMINI_API_KEY=your_key_here
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#111816] border border-[#1E2824] space-y-1.5 dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium flex items-center gap-1.5">
            {visionConfigured ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>{visionProviderUsed || 'Vision Model'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Review Extracted Items</span>
              </>
            )}
          </span>
          <span className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
            {acceptedCount > 0 ? `${acceptedCount} accepted · ` : ''}
            {selectedPendingCount} of {pendingItems.length} selected
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Here&apos;s what I found.
        </h2>

        <p className="text-xs sm:text-sm text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] font-sans">
          {summary} Review, edit details, or accept them into your task system.
        </p>
      </div>

      {/* Filter and Select Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2824] pb-2 text-xs dark:border-[#1E2824] light:border-[#E2E8F0]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All (${counts.all})` },
            ...(counts.task > 0 ? [{ id: 'task', label: `Tasks (${counts.task})` }] : []),
            ...(counts.deadline > 0 ? [{ id: 'deadline', label: `Deadlines (${counts.deadline})` }] : []),
            ...(counts.reminder > 0 ? [{ id: 'reminder', label: `Reminders (${counts.reminder})` }] : []),
            ...(counts.routine > 0 ? [{ id: 'routine', label: `Routines (${counts.routine})` }] : []),
            ...(counts.event > 0 ? [{ id: 'event', label: `Events (${counts.event})` }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as 'all' | ExtractedItemType)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterType === tab.id
                  ? 'bg-[#18221E] text-[#9ED8A3] border border-[#283630] font-medium dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                  : 'text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {pendingItems.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectAll(!allSelected)}
            className="text-xs text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Extracted Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[#8C9E90] text-xs border border-[#1E2824] rounded-xl bg-[#111816]">
            No items in this category.
          </div>
        ) : (
          filteredItems.map((item) => (
            <EditableExtractedItem
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onToggleSelect={onToggleSelectItem}
              onAcceptSingle={onAcceptSingleItem}
            />
          ))
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
        <button
          type="button"
          onClick={onDiscard}
          className="text-xs text-[#8C9E90] hover:text-[#E07A7A] transition-colors py-1 dark:text-[#8C9E90] light:text-[#64748B]"
        >
          Discard &amp; Start Over
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={onConfirmAdd}
            disabled={selectedPendingCount === 0}
            icon={<Check className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            {selectedPendingCount === pendingItems.length
              ? 'Accept all'
              : `Accept ${selectedPendingCount} selected`}
          </Button>
        </div>
      </div>
    </div>
  );
};
