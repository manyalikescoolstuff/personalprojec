'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  ChevronRight,
  Sparkles,
  Sprout,
  PenLine,
  Mic,
  Image as ImageIcon,
  Send,
  Plus,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TaskRow } from '@/components/tasks/TaskRow';
import { AIResponseCard } from '@/components/command/AIResponseCard';
import { Priority, Task } from '@/types';
import { brainDumpService } from '@/services/brainDumpService';
import { soundManager } from '@/lib/soundEffects';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    tasks,
    setActiveScreen,
    setSelectedTaskDetail,
    addBrainDumpRecord,
    acceptAllExtractedItems,
    setQuickAddOpen,
  } = useApp();

  const [quickDumpText, setQuickDumpText] = useState('');
  const [isDumping, setIsDumping] = useState(false);

  // Time of Day Greeting
  const timeOfDay = React.useMemo(() => {
    if (typeof window === 'undefined') return { greeting: 'Good morning', quote: 'The morning forest breeze is gentle today.' };
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        greeting: 'Good morning',
        quote: 'The forest glade is waking up. Dump your thoughts or plant your focus seeds! 🌱',
      };
    }
    if (hour < 17) {
      return {
        greeting: 'Good afternoon',
        quote: 'Totoro is holding his leafy umbrella. Keep up your steady focus pace! 🍃',
      };
    }
    return {
      greeting: 'Peaceful evening',
      quote: 'The stars are shining over the giant camphor tree. Harvest your remaining tasks. ✨',
    };
  }, []);

  // Formatted Current Date & Day
  const todayFormatted = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Strict Priority Sorting: Urgent (0) -> High (1) -> Medium (2) -> Low (3)
  const priorityWeight: Record<Priority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Uncompleted tasks first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // 2. Strict priority order
    const pDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
    if (pDiff !== 0) return pDiff;
    // 3. Today focus priority
    if (a.isPriorityToday !== b.isPriorityToday) {
      return a.isPriorityToday ? -1 : 1;
    }
    return 0;
  });

  const activeTasks = sortedTasks.filter((t) => !t.isCompleted);
  const completedCount = sortedTasks.filter((t) => t.isCompleted).length;
  const progressPercent =
    sortedTasks.length > 0 ? Math.round((completedCount / sortedTasks.length) * 100) : 0;

  // Instant Quick Dump Action
  const handleQuickDumpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDumpText.trim() || isDumping) return;

    setIsDumping(true);
    soundManager.playSparkle();

    try {
      // 1. Create and save dump
      const rawDump = brainDumpService.createRawDump(quickDumpText.trim(), '', []);
      addBrainDumpRecord(rawDump);

      // 2. Process with AI and extract tasks
      const { dump: processed, result } = await brainDumpService.process(rawDump, quickDumpText.trim(), '', []);
      addBrainDumpRecord(processed);

      // 3. Auto-accept extracted tasks directly into workspace
      if (result.items.length > 0) {
        acceptAllExtractedItems(processed.id, result.items);
      }

      setQuickDumpText('');
    } catch {
      // Fallback
    } finally {
      setIsDumping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-[21px] sm:space-y-[34px] pb-24 font-kalam">
      {/* 1. Large Hero Greeting + Date & Day (Scaled via Golden Ratio: 53px -> 68px) */}
      <section className="space-y-[8px] pt-2">
        <h1
          suppressHydrationWarning
          className="text-golden-3xl sm:text-golden-4xl font-bold tracking-tight text-[var(--text-primary)] font-hangyaboly leading-none"
        >
          {timeOfDay.greeting}, {profile.name}!
        </h1>

        {/* Date and Day positioned directly under the greeting (Golden Scale: 16px -> 20px) */}
        <div className="flex flex-wrap items-center gap-2 text-golden-base sm:text-golden-md text-[var(--text-secondary)] font-medium">
          <span suppressHydrationWarning className="flex items-center gap-1.5 font-bold">
            <span>🗓️</span>
            <span>{todayFormatted}</span>
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--accent-primary)] font-bold">
            {timeOfDay.quote}
          </span>
        </div>
      </section>

      {/* 2. Forest Bloom Progress Gauge (Fibonacci 21px & 34px padding) */}
      <section className="p-[21px] rounded-[21px] bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm">
        <div className="flex items-center justify-between text-golden-sm sm:text-golden-base font-bold text-[var(--text-secondary)] mb-2">
          <span className="flex items-center gap-2 text-[var(--text-primary)]">
            <Sprout className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Forest Sanctuary Bloom: {completedCount} of {sortedTasks.length} tasks harvested</span>
          </span>
          <span className="text-[var(--accent-primary)] font-bold text-golden-base sm:text-golden-md">{progressPercent}%</span>
        </div>
        <div className="h-3.5 w-full bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 rounded-full transition-all duration-500 shadow-[0_0_13px_#86efac]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 3. Immediate Workload Dump Box (Golden Scale: Title 33px -> 42px) */}
      <section className="p-[21px] sm:p-[34px] rounded-[34px] bg-[var(--bg-card)] border-2 border-[var(--border-highlight)]/70 backdrop-blur-2xl shadow-xl space-y-[13px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚌</span>
            <div>
              <h2 className="text-golden-xl sm:text-golden-2xl font-bold text-[var(--text-primary)] leading-tight">
                Dump Your Workload First
              </h2>
              <p className="text-golden-sm sm:text-golden-base text-[var(--text-secondary)]">
                Messy is totally fine. Soot sprites will organize your thoughts into prioritized acorns!
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('braindump')}
            className="hidden sm:flex items-center gap-1.5 text-golden-sm text-[var(--accent-primary)] font-bold hover:underline ghibli-btn"
          >
            <span>Full Catbus Express</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Dump Input Form */}
        <form onSubmit={handleQuickDumpSubmit} className="space-y-[13px]">
          <div className="relative">
            <textarea
              value={quickDumpText}
              onChange={(e) => setQuickDumpText(e.target.value)}
              placeholder="Dump assignments, exam deadlines, lecture notes, or rough tasks here..."
              rows={2}
              className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[21px] p-[13px] sm:p-[21px] text-golden-sm sm:text-golden-base placeholder:text-[var(--text-muted)] focus:outline-none transition-all shadow-inner resize-none font-kalam"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-golden-sm">
              <button
                type="button"
                onClick={() => setActiveScreen('braindump')}
                className="px-[13px] py-[8px] rounded-[13px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 ghibli-btn font-bold"
              >
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveScreen('braindump')}
                className="px-[13px] py-[8px] rounded-[13px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 ghibli-btn font-bold"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Screenshot</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!quickDumpText.trim() || isDumping}
              className="px-[21px] py-[10px] rounded-[13px] bg-gradient-to-r from-[#4E8752] to-[#6BA36F] dark:from-[#5A995F] dark:to-[#74B57A] text-white dark:text-[#0C1A12] font-bold text-golden-sm flex items-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed ghibli-btn"
            >
              {isDumping ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-lime-300" />
                  <span>Organizing...</span>
                </>
              ) : (
                <>
                  <span>Organize into Priorities</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 4. Sequenced Priorities: Strictly Ordered (Urgent 🌰 -> High 🍃 -> Medium 🌱 -> Low ⭐) */}
      <section className="space-y-[13px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌰</span>
            <div>
              <h2 className="text-golden-xl sm:text-golden-2xl font-bold text-[var(--text-primary)]">
                Sequenced Priorities
              </h2>
              <p className="text-golden-sm sm:text-golden-base text-[var(--text-secondary)]">
                Ranked strictly: Urgent Acorns 🌰 &rarr; High 🍃 &rarr; Medium 🌱 &rarr; Low ⭐
              </p>
            </div>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-[13px] py-[8px] rounded-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-golden-sm text-[var(--accent-primary)] font-bold ghibli-btn shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Priority</span>
          </button>
        </div>

        <div className="space-y-[13px]">
          {activeTasks.length === 0 ? (
            <div className="p-[34px] text-center rounded-[34px] border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-[8px]">
              <span className="text-4xl">🌱</span>
              <p className="text-golden-lg font-bold text-[var(--text-primary)]">All priorities harvested!</p>
              <p className="text-golden-sm sm:text-golden-base text-[var(--text-secondary)]">
                Dump your next assignment or project above to sprout new tasks.
              </p>
            </div>
          ) : (
            activeTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </section>

      {/* 5. Forest Spirit Recommendations */}
      <section className="space-y-[13px]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-golden-lg sm:text-golden-xl font-bold text-[var(--text-primary)]">
            Forest Spirit Suggestions
          </h2>
        </div>
        <AIResponseCard />
      </section>
    </div>
  );
};
