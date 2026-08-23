'use client';

import React from 'react';
import { ArrowRight, Clock, ChevronRight, Sparkles, Sprout } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CommandBar } from '@/components/command/CommandBar';
import { AIResponseCard } from '@/components/command/AIResponseCard';
import { TaskRow } from '@/components/tasks/TaskRow';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    tasks,
    setActiveScreen,
    setSelectedTaskDetail,
  } = useApp();

  const timeOfDay = React.useMemo(() => {
    if (typeof window === 'undefined') return { greeting: 'Good morning', quote: 'The morning forest breeze is gentle today.' };
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        greeting: 'Good morning',
        quote: 'The forest glade is waking up. Plant your focus seeds for the day! 🌱',
      };
    }
    if (hour < 17) {
      return {
        greeting: 'Good afternoon',
        quote: 'Totoro is holding his leafy umbrella. Keep up the steady pace! 🍃',
      };
    }
    return {
      greeting: 'Peaceful evening',
      quote: 'The stars are shining over the giant camphor tree. Rest well soon. ✨',
    };
  }, []);

  // Filter tasks for today's focus
  const todayTasks = tasks.filter((t) => t.isPriorityToday || t.deadline?.includes('Today'));
  const completedTodayCount = todayTasks.filter((t) => t.isCompleted).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedTodayCount / todayTasks.length) * 100) : 0;

  // Upcoming deadlines (tasks with a deadline that are pending)
  const upcomingDeadlines = tasks
    .filter((t) => !t.isCompleted && t.deadline)
    .slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-kalam">
      {/* 1. Totoro Hero Greeting Banner */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] backdrop-blur-2xl shadow-[var(--shadow-ghibli)]">
        {/* Soft decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Totoro Artwork Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-emerald-400/40 shadow-lg ghibli-btn bg-[#E8F1F2]/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/ghibli/totoro_hero.jpg"
              alt="Totoro Companion"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Greeting & Forest Wisdom Speech Bubble */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {timeOfDay.greeting}, {profile.name}! 🍃
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              &ldquo;{timeOfDay.quote}&rdquo;
            </p>

            {/* Forest Seedling Growth Tracker */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
                <span className="flex items-center gap-1.5 text-[var(--accent-primary)]">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Forest Bloom: {completedTodayCount} of {todayTasks.length} priorities bloomed</span>
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#86efac]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Spotlight Command Input */}
      <section>
        <CommandBar placeholder="Ask Totoro or type an academic priority..." autoFocus />
      </section>

      {/* 3. Today's Acorn Priorities */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌰</span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Today&apos;s Acorn Priorities
            </h2>
          </div>
          <button
            onClick={() => setActiveScreen('tasks')}
            className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1 font-bold transition-all ghibli-btn"
          >
            <span>Explore all tasks</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {todayTasks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-2">
              <span className="text-2xl">🌱</span>
              <p className="text-sm font-bold text-[var(--text-primary)]">No urgent seeds planted for today.</p>
              <p className="text-xs text-[var(--text-secondary)]">Relax under the camphor tree or add a new task!</p>
            </div>
          ) : (
            todayTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </section>

      {/* 4. Upcoming Deadlines */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Upcoming Deadlines
            </h2>
          </div>
          <Clock className="w-4 h-4 text-[var(--text-muted)]" />
        </div>

        <div className="space-y-2.5">
          {upcomingDeadlines.length === 0 ? (
            <div className="p-5 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs backdrop-blur-xl">
              No upcoming deadlines on the horizon.
            </div>
          ) : (
            upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskDetail(task)}
                className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] cursor-pointer transition-all duration-200 backdrop-blur-xl shadow-sm ghibli-btn"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <span>🗓️</span>
                    <span>{task.deadline}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {task.priority === 'urgent' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-500/15 border border-red-500/30 text-red-400 font-bold">
                      🌰 Urgent
                    </span>
                  )}
                  {task.priority === 'high' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                      🍃 High
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. AI Forest Spirit Suggestions */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            Forest Spirit Recommendations
          </h2>
        </div>
        <AIResponseCard />
      </section>

      {/* 6. Catbus Brain Dump Callout Banner */}
      <section>
        <div
          onClick={() => setActiveScreen('braindump')}
          className="group p-5 sm:p-6 rounded-3xl border-2 border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] cursor-pointer transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-2xl shadow-lg ghibli-btn"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-zinc-700/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/ghibli/soot_sprites.jpg"
                alt="Soot Sprites"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-1.5 justify-center sm:justify-start">
                <span>Catch the Catbus Brain Express</span>
                <span>🚌</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Dump messy thoughts, screenshot notes, or voice recordings. Soot sprites will organize them into acorns!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform shrink-0">
            <span>Hop On Express</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
