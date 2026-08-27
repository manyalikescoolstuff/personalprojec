'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Shuffle,
  Clock,
  ChevronRight,
  Split,
  Flame,
  Sun,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { aiAssistantService } from '@/services/aiAssistantService';
import { soundManager } from '@/lib/soundEffects';
import confetti from 'canvas-confetti';

export const OneNextActionCard: React.FC = () => {
  const {
    tasks,
    startFocusSession,
    toggleTaskComplete,
    generateSubtasksWithAI,
    setSelectedTaskDetail,
    setActiveScreen,
    setQuickAddOpen,
  } = useApp();

  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Re-calculate the single highest leverage task whenever tasks or skipped IDs change
  const currentHour = typeof window !== 'undefined' ? new Date().getHours() : 12;
  const nextAction = useMemo(() => {
    return aiAssistantService.determineOneNextAction(tasks, currentHour, skippedIds);
  }, [tasks, currentHour, skippedIds]);

  const { task, reason, timeContext, firstStep, hasSubtasks, isUrgent, hasAlternatives } =
    nextAction;

  // Handle Complete Action
  const handleComplete = () => {
    if (!task) return;
    soundManager.playSuccess();

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#86efac', '#6ee7b7', '#34d399', '#fef08a'],
      });
    } catch {}

    setJustCompleted(true);
    setTimeout(() => {
      toggleTaskComplete(task.id);
      setJustCompleted(false);
    }, 400);
  };

  // Handle Focus Window Start
  const handleStartFocus = () => {
    if (!task) return;
    soundManager.playClick();
    startFocusSession(task);
  };

  // Handle Swap / Cycle Candidate
  const handleSwap = () => {
    if (!task) return;
    soundManager.playClick();
    setSkippedIds((prev) => [...prev, task.id]);
  };

  // Handle AI Subtask Breakdown
  const handleBreakdown = async () => {
    if (!task) return;
    soundManager.playSparkle();
    setIsBreakingDown(true);
    try {
      generateSubtasksWithAI(task.id);
    } finally {
      setTimeout(() => setIsBreakingDown(false), 300);
    }
  };

  // 1. All Tasks Clear State
  if (!task) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border-2 border-emerald-500/30 p-6 sm:p-7 backdrop-blur-2xl shadow-lg transition-all font-kalam">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            🌱
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sanctuary is Clear</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              All priorities harvested!
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {reason} Take a deep breath, review your weekly map, or dump new seeds.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-xs text-[var(--accent-primary)] font-bold ghibli-btn shadow-sm"
            >
              + Plant Seed
            </button>
            <button
              onClick={() => setActiveScreen('plan')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs text-emerald-300 font-bold ghibli-btn shadow-sm"
            >
              Weekly Map &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Priority color accents
  const priorityBadgeConfig = {
    urgent: {
      bg: 'bg-red-500/15 border-red-500/40 text-red-400',
      icon: <Flame className="w-3.5 h-3.5 animate-pulse text-red-400" />,
      label: 'Urgent Acorn 🌰',
    },
    high: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      label: 'High Priority 🍃',
    },
    medium: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: <Sun className="w-3.5 h-3.5 text-emerald-400" />,
      label: 'Steady Focus 🌱',
    },
    low: {
      bg: 'bg-teal-500/15 border-teal-500/40 text-teal-400',
      icon: <Coffee className="w-3.5 h-3.5 text-teal-400" />,
      label: 'Quick Win ⭐',
    },
  };

  const badge = priorityBadgeConfig[task.priority] || priorityBadgeConfig.medium;

  return (
    <section className="relative group overflow-hidden rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--accent-primary)]/40 p-5 sm:p-7 backdrop-blur-2xl shadow-xl transition-all hover:border-[var(--accent-primary)]/70 font-kalam">
      {/* Decorative ambient corner glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-4 sm:space-y-5">
        {/* 1. Header Bar: Beacon Pill + Context */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
              <span>ONE NEXT ACTION</span>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>{timeContext}</span>
          </div>
        </div>

        {/* 2. AI Rationale Quote */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] flex items-start gap-2.5 shadow-inner">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong className="text-[var(--text-primary)]">Why now:</strong> {reason}
          </p>
        </div>

        {/* 3. Task Title & Category Badges */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h2
              onClick={() => setSelectedTaskDetail(task)}
              className={`text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight hover:text-[var(--accent-primary)] cursor-pointer transition-colors ${
                justCompleted ? 'line-through opacity-50' : ''
              }`}
            >
              {task.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
              🏷️ {task.category}
            </span>

            {task.deadline && (
              <span
                className={`px-2.5 py-0.5 rounded-lg border font-bold ${
                  isUrgent
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                ⏰ {task.deadline}
              </span>
            )}

            {task.estimatedTime && (
              <span className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                ⏳ {task.estimatedTime}
              </span>
            )}
          </div>
        </div>

        {/* 4. Anti-Procrastination "First Bite" Starter Container */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-teal-950/20 to-lime-950/20 border border-[var(--accent-primary)]/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1.5">
              <span>🎯</span>
              <span>First Step (Zero Starting Friction):</span>
            </span>

            {!hasSubtasks && (
              <button
                type="button"
                onClick={handleBreakdown}
                disabled={isBreakingDown}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-primary)] hover:underline ghibli-btn"
              >
                <Split className="w-3 h-3" />
                <span>{isBreakingDown ? 'Breaking down...' : 'Break Down with AI'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 bg-[var(--bg-card)]/80 p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium flex-1">
              {firstStep}
            </p>
          </div>

          {/* If subtasks exist, show mini progress indicator */}
          {hasSubtasks && (
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1">
              <span>
                Subtasks completed: {task.subtasks.filter((s) => s.isCompleted).length} /{' '}
                {task.subtasks.length}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTaskDetail(task)}
                className="text-[var(--accent-primary)] hover:underline font-bold"
              >
                View all steps &rarr;
              </button>
            </div>
          )}
        </div>

        {/* 5. Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Focus Button */}
            <button
              type="button"
              onClick={handleStartFocus}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-900/30 ghibli-btn"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus Window</span>
            </button>

            {/* Quick Mark Complete Button */}
            <button
              type="button"
              onClick={handleComplete}
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-subtle)] hover:bg-emerald-500/20 border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--text-primary)] hover:text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-1.5 ghibli-btn transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Done</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Swap Candidate without Guilt */}
            {hasAlternatives && (
              <button
                type="button"
                onClick={handleSwap}
                className="px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 ghibli-btn"
                title="Swap to next best alternative without guilt"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Swap Next</span>
              </button>
            )}

            {/* View Details */}
            <button
              type="button"
              onClick={() => setSelectedTaskDetail(task)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
              title="Inspect task details"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
