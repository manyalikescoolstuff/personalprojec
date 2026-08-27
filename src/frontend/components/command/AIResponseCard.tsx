'use client';

import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Priority, Task } from '@/types';
import { haptics } from '@/lib/haptics';
import { soundManager } from '@/lib/soundEffects';

export const AIResponseCard: React.FC = () => {
  const {
    aiRecommendation,
    setAiRecommendation,
    acceptRecommendation,
    dismissRecommendation,
    setExhaustionModalOpen,
    startFocusSession,
    setSelectedTaskDetail,
    addTask,
    tasks,
    setActiveScreen,
  } = useApp();

  if (!aiRecommendation || aiRecommendation.isDismissed) {
    return null;
  }

  const handleSelectPriority = (priority: Priority) => {
    if (!aiRecommendation.pendingTaskData) return;

    haptics.medium();
    soundManager.playSparkle();

    const title = aiRecommendation.pendingTaskData.title || 'New Priority';
    addTask({
      ...aiRecommendation.pendingTaskData,
      priority,
    });

    setAiRecommendation({
      id: `rec-confirmed-${Date.now()}`,
      type: 'right_now',
      title: 'Priority Set',
      message: `Assigned "${title}" as a ${priority.toUpperCase()} priority for today.`,
      actionLabel: 'View in Tasks',
    });
  };

  const handleAction = () => {
    if (aiRecommendation.type === 'exhaustion_reduction') {
      setExhaustionModalOpen(true);
      return;
    }

    if (aiRecommendation.type === 'right_now') {
      if (aiRecommendation.recommendedTaskId) {
        const target = tasks.find((t: Task) => t.id === aiRecommendation.recommendedTaskId);
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
      const target = tasks.find((t: Task) => t.id === aiRecommendation.recommendedTaskId);
      if (target) {
        setSelectedTaskDetail(target);
        return;
      }
    }
    dismissRecommendation(aiRecommendation.id);
  };

  const isPriorityPrompt = aiRecommendation.type === 'priority_prompt';

  return (
    <div className="w-full bg-[var(--bg-card)] border-2 border-[var(--border-highlight)]/70 rounded-2xl p-4 sm:p-5 text-[var(--text-primary)] relative transition-all duration-200 shadow-lg font-kalam">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[var(--accent-primary)] font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isPriorityPrompt ? 'Set Priority Level' : 'AI Suggestion'}</span>
            </span>
            {aiRecommendation.isApplied && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 px-2 py-0.5 rounded-full font-bold">
                <Check className="w-3 h-3" />
                Applied
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-medium">
            {aiRecommendation.message}
          </p>

          {aiRecommendation.context && (
            <p className="text-xs text-[var(--text-secondary)] pt-0.5 font-medium">
              {aiRecommendation.context}
            </p>
          )}
        </div>

        <button
          onClick={() => dismissRecommendation(aiRecommendation.id)}
          className="text-[var(--text-secondary)] hover:text-white p-1 rounded transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Priority Choice Buttons (when user didn't specify priority) */}
      {isPriorityPrompt && (
        <div className="pt-3 mt-2 border-t border-[var(--border-subtle)] space-y-2">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
            Tap a priority to confirm:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPriority('urgent')}
              className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ghibli-btn shadow-sm"
            >
              <span>🌰</span>
              <span>Urgent</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPriority('high')}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ghibli-btn shadow-sm"
            >
              <span>🍃</span>
              <span>High</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPriority('medium')}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ghibli-btn shadow-sm"
            >
              <span>🌱</span>
              <span>Medium</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPriority('low')}
              className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ghibli-btn shadow-sm"
            >
              <span>⭐</span>
              <span>Low</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons for other recommendations */}
      {!isPriorityPrompt && !aiRecommendation.isApplied && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-[var(--border-subtle)]">
          {aiRecommendation.actionLabel && (
            <Button variant="primary" size="sm" onClick={handleAction}>
              {aiRecommendation.actionLabel === 'Accept' ? 'Accept' : aiRecommendation.actionLabel}
            </Button>
          )}

          {aiRecommendation.secondaryActionLabel && (
            <Button variant="secondary" size="sm" onClick={handleSecondaryAction}>
              {aiRecommendation.secondaryActionLabel}
            </Button>
          )}

          {!aiRecommendation.secondaryActionLabel && (
            <Button variant="subtle" size="sm" onClick={() => dismissRecommendation(aiRecommendation.id)}>
              Ignore
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
