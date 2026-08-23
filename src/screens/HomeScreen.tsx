'use client';

import React from 'react';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
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

  const greeting = React.useMemo(() => {
    if (typeof window === 'undefined') return 'Good morning';
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filter tasks for today's focus
  const todayTasks = tasks.filter((t) => t.isPriorityToday || t.deadline?.includes('Today'));

  // Upcoming deadlines (tasks with a deadline that are pending)
  const upcomingDeadlines = tasks
    .filter((t) => !t.isCompleted && t.deadline)
    .slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-kalam">
      {/* 1. Header Greeting */}
      <section className="space-y-1 pt-2">
        <h1
          suppressHydrationWarning
          className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]"
        >
          {greeting}, {profile.name}.
        </h1>
        <p className="text-sm sm:text-base text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          Here&apos;s what needs your attention today.
        </p>
      </section>

      {/* 2. Command Input */}
      <section>
        <CommandBar placeholder="What should I do right now?" autoFocus />
      </section>

      {/* 3. Today's Priorities */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
            Today&apos;s Priorities
          </h2>
          <button
            onClick={() => setActiveScreen('tasks')}
            className="text-xs text-[#8C9E90] hover:text-[#F3F4F1] flex items-center gap-1 transition-colors dark:text-[#8C9E90] dark:hover:text-[#F3F4F1] light:text-[#64748B] light:hover:text-[#111827]"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <div className="p-6 text-center border border-[#1E2824] rounded-lg bg-[#111816] text-[#8C9E90] text-sm dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#64748B]">
              No pending priorities for today.
            </div>
          ) : (
            todayTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </section>

      {/* 4. Upcoming Deadlines */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
            Upcoming Deadlines
          </h2>
          <Clock className="w-3.5 h-3.5 text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]" />
        </div>

        <div className="space-y-2">
          {upcomingDeadlines.length === 0 ? (
            <div className="p-4 text-center border border-[#1E2824] rounded-lg bg-[#111816] text-[#8C9E90] text-xs dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0]">
              No upcoming deadlines.
            </div>
          ) : (
            upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskDetail(task)}
                className="flex items-center justify-between p-3 rounded-lg border border-[#1E2824] bg-[#151D1A] hover:border-[#9ED8A3]/50 cursor-pointer transition-colors dark:bg-[#151D1A] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:hover:border-[#2563EB]/40"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    {task.deadline}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.priority === 'urgent' && (
                    <span className="text-xs text-[#E07A7A] dark:text-[#E07A7A] light:text-[#DC2626]">
                      Urgent
                    </span>
                  )}
                  {task.priority === 'high' && (
                    <span className="text-xs text-[#D8B07A] dark:text-[#D8B07A] light:text-[#D97706]">
                      High Priority
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-[#55665A] dark:text-[#55665A] light:text-[#CBD5E1]" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. AI Suggestions */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          AI Suggestions
        </h2>
        <AIResponseCard />
      </section>

      {/* 6. Brain Dump (quick access) */}
      <section>
        <div
          onClick={() => setActiveScreen('braindump')}
          className="group p-4 sm:p-5 rounded-lg border border-[#1E2824] bg-[#111816] hover:border-[#9ED8A3]/50 cursor-pointer transition-all duration-150 flex items-center justify-between dark:bg-[#111816] dark:border-[#1E2824] dark:hover:border-[#9ED8A3]/50 light:bg-[#F8FAFC] light:border-[#E2E8F0] light:hover:border-[#2563EB]/40"
        >
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
              Got something on your mind?
            </h3>
            <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              Dump thoughts, tasks, or voice notes here. The AI will organize them.
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm text-[#9ED8A3] group-hover:translate-x-0.5 transition-transform dark:text-[#9ED8A3] light:text-[#2563EB]">
            <span>Dump it here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>
    </div>
  );
};
