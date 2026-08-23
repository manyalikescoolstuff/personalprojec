'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

export const AIResponseCard: React.FC = () => {
  const {
    aiRecommendation,
    acceptRecommendation,
    dismissRecommendation,
    setExhaustionModalOpen,
    startFocusSession,
    setSelectedTaskDetail,
    tasks,
    setActiveScreen,
  } = useApp();

  if (!aiRecommendation || aiRecommendation.isDismissed) {
    return null;
  }

  const handleAction = () => {
    if (aiRecommendation.type === 'exhaustion_reduction') {
      setExhaustionModalOpen(true);
      return;
    }

    if (aiRecommendation.type === 'right_now') {
      if (aiRecommendation.recommendedTaskId) {
        const target = tasks.find((t) => t.id === aiRecommendation.recommendedTaskId);
        if (target) {
          startFocusSession(target);
          return;
        }
      }
      setActiveScreen('tasks');
      return;
    }

    if (aiRecommendation.type === 'schedule_optimization') {
      acceptRecommendation(aiRecommendation.id);
      return;
    }

    dismissRecommendation(aiRecommendation.id);
  };

  const handleSecondaryAction = () => {
    if (aiRecommendation.type === 'right_now' && aiRecommendation.recommendedTaskId) {
      const target = tasks.find((t) => t.id === aiRecommendation.recommendedTaskId);
      if (target) {
        setSelectedTaskDetail(target);
        return;
      }
    }
    dismissRecommendation(aiRecommendation.id);
  };

  return (
    <div className="w-full bg-[#151D1A] border border-[#1E2824] rounded-lg p-4 sm:p-4.5 text-[#F3F4F1] relative transition-all duration-200 dark:bg-[#151D1A] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#9ED8A3] font-kalam font-medium dark:text-[#9ED8A3] light:text-[#2563EB]">
              AI Suggestion
            </span>
            {aiRecommendation.isApplied && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] bg-[#9ED8A3]/10 px-1.5 py-0.5 rounded">
                <Check className="w-3 h-3" />
                Applied
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] leading-relaxed">
            {aiRecommendation.message}
          </p>

          {aiRecommendation.context && (
            <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] pt-0.5 font-sans">
              {aiRecommendation.context}
            </p>
          )}
        </div>

        <button
          onClick={() => dismissRecommendation(aiRecommendation.id)}
          className="text-[#55665A] hover:text-[#F3F4F1] p-1 rounded transition-colors dark:text-[#55665A] dark:hover:text-[#F3F4F1] light:text-[#94A3B8] light:hover:text-[#111827]"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      {!aiRecommendation.isApplied && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
          {aiRecommendation.actionLabel && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAction}
            >
              {aiRecommendation.actionLabel === 'Accept' ? 'Accept' : aiRecommendation.actionLabel}
            </Button>
          )}

          {aiRecommendation.secondaryActionLabel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSecondaryAction}
            >
              {aiRecommendation.secondaryActionLabel}
            </Button>
          )}

          {!aiRecommendation.secondaryActionLabel && (
            <Button
              variant="subtle"
              size="sm"
              onClick={() => dismissRecommendation(aiRecommendation.id)}
            >
              Ignore
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
