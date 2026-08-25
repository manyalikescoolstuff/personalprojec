'use client';

import React, { useState, useEffect } from 'react';
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

  const [todayFormatted, setTodayFormatted] = useState<string>('');

  useEffect(() => {
    setTodayFormatted(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
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
    <div className="max-w-3xl mx-auto space-y-8 pb-20 font-kalam">
      {/* 1. Large Hero Greeting + Date & Day Directly Below */}
      <section className="space-y-2 pt-2">
        <h1
          suppressHydrationWarning
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] font-hangyaboly leading-none"
        >
          {timeOfDay.greeting}, {profile.name}!
        </h1>

        {/* Date and Day positioned directly under the greeting */}
        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-[var(--text-secondary)] font-medium">
          <span suppressHydrationWarning className="flex items-center gap-1.5">
            <span>🗓️</span>
            <span>{todayFormatted}</span>
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--accent-primary)] font-bold">
            {timeOfDay.quote}
          </span>
        </div>
      </section>

      {/* 2. Forest Bloom Progress Gauge */}
      <section className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-2">
          <span className="flex items-center gap-2 text-[var(--text-primary)]">
            <Sprout className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Forest Sanctuary Bloom: {completedCount} of {sortedTasks.length} tasks harvested</span>
          </span>
          <span className="text-[var(--accent-primary)] font-bold">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#86efac]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 3. Immediate Workload Dump Box (Where the user unloads their mental burden first) */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-highlight)]/70 backdrop-blur-2xl shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚌</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight">
                Dump Your Workload First
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Messy is totally fine. Soot sprites will organize your thoughts into prioritized acorns!
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('braindump')}
            className="hidden sm:flex items-center gap-1 text-xs text-[var(--accent-primary)] font-bold hover:underline ghibli-btn"
          >
            <span>Full Catbus Express</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Dump Input Form */}
        <form onSubmit={handleQuickDumpSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={quickDumpText}
              onChange={(e) => setQuickDumpText(e.target.value)}
              placeholder="Dump assignments, exam deadlines, lecture notes, or rough tasks here..."
              rows={2}
              className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-2xl p-3.5 text-xs sm:text-sm placeholder:text-[var(--text-muted)] focus:outline-none transition-all shadow-inner resize-none font-kalam"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveScreen('braindump')}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 ghibli-btn"
              >
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveScreen('braindump')}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 ghibli-btn"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Screenshot</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!quickDumpText.trim() || isDumping}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4E8752] to-[#6BA36F] dark:from-[#5A995F] dark:to-[#74B57A] text-white dark:text-[#0C1A12] font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed ghibli-btn"
            >
              {isDumping ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-lime-300" />
                  <span>Organizing...</span>
                </>
              ) : (
                <>
                  <span>Organize into Priorities</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 4. Sequenced Priorities: Strictly Ordered (Urgent 🌰 -> High 🍃 -> Medium 🌱 -> Low ⭐) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌰</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Sequenced Priorities
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Ranked strictly: Urgent Acorns 🌰 &rarr; High 🍃 &rarr; Medium 🌱 &rarr; Low ⭐
              </p>
            </div>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-xs text-[var(--accent-primary)] font-bold ghibli-btn shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Priority</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {activeTasks.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-2">
              <span className="text-3xl">🌱</span>
              <p className="text-base font-bold text-[var(--text-primary)]">All priorities harvested!</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Dump your next assignment or project above to sprout new tasks.
              </p>
            </div>
          ) : (
            activeTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </section>

      {/* 5. Forest Spirit Recommendations */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            Forest Spirit Suggestions
          </h2>
        </div>
        <AIResponseCard />
      </section>
    </div>
  );
};
