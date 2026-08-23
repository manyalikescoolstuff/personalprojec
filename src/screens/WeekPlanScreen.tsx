'use client';

import React, { useState } from 'react';
import {
  Clock,
  X,
  Sparkles,
  Sun,
  Moon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DayOfWeek } from '@/types';

export const WeekPlanScreen: React.FC = () => {
  const {
    schedule,
    aiRecommendation,
    acceptRecommendation,
    dismissRecommendation,
  } = useApp();

  const days: { id: DayOfWeek; label: string; full: string; date: string; icon: string }[] = [
    { id: 'Mon', label: 'Mon', full: 'Monday', date: 'Aug 17', icon: '🌱' },
    { id: 'Tue', label: 'Tue', full: 'Tuesday', date: 'Aug 18', icon: '🍃' },
    { id: 'Wed', label: 'Wed', full: 'Wednesday', date: 'Aug 19', icon: '🌿' },
    { id: 'Thu', label: 'Thu', full: 'Thursday', date: 'Aug 20', icon: '🌰' },
    { id: 'Fri', label: 'Fri', full: 'Friday', date: 'Aug 21', icon: '✨' },
    { id: 'Sat', label: 'Sat', full: 'Saturday', date: 'Aug 22', icon: '🌻' },
    { id: 'Sun', label: 'Sun', full: 'Sunday', date: 'Aug 23', icon: '🌙' },
  ];

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Wed');

  const activeDayBlocks = schedule.filter((b) => b.day === selectedDay);

  const getDayBlockCount = (day: DayOfWeek) => {
    return schedule.filter((b) => b.day === day).length;
  };

  const isScheduleRec = aiRecommendation?.type === 'schedule_optimization';

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-20 font-kalam">
      {/* 1. Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Weekly Focus Glade
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Sun &amp; Moon time blocks to keep your study sessions peaceful and balanced.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--accent-primary)] font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Calm Forest Rhythm</span>
        </div>
      </section>

      {/* 2. AI Scheduling Suggestion Banner */}
      {isScheduleRec && !aiRecommendation?.isDismissed && (
        <Card variant="accent" className="p-5 relative rounded-3xl backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider flex items-center gap-1">
                  <span>🍃</span>
                  <span>Spirit Schedule Advice</span>
                </span>
                {aiRecommendation.isApplied && (
                  <span className="text-[11px] text-lime-400 bg-lime-500/15 border border-lime-500/30 px-2 py-0.5 rounded-full font-bold">
                    Rescheduled
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {aiRecommendation.message}
              </h3>

              {aiRecommendation.context && (
                <p className="text-xs text-[var(--text-secondary)]">
                  {aiRecommendation.context}
                </p>
              )}
            </div>

            <button
              onClick={() => dismissRecommendation(aiRecommendation.id)}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors ghibli-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!aiRecommendation.isApplied && (
            <div className="flex items-center gap-2.5 pt-3.5 mt-2 border-t border-[var(--border-subtle)]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => acceptRecommendation(aiRecommendation.id)}
              >
                Accept Optimization
              </Button>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => dismissRecommendation(aiRecommendation.id)}
              >
                Keep Current
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 3. 7-Day Nature Selector Bar */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = selectedDay === day.id;
          const count = getDayBlockCount(day.id);
          const isToday = day.id === 'Wed';

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 text-center ghibli-btn ${
                isSelected
                  ? 'bg-gradient-to-b from-[var(--accent-primary)]/25 to-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--text-primary)] shadow-lg'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="text-sm">{day.icon}</span>
              <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">
                {day.label}
              </span>
              <span
                className={`text-sm sm:text-base font-bold ${
                  isToday ? 'text-[var(--accent-primary)]' : ''
                }`}
              >
                {day.date.split(' ')[1]}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {count} blocks
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Selected Day Focus Workspace */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {days.find((d) => d.id === selectedDay)?.full} Schedule
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">
              ({days.find((d) => d.id === selectedDay)?.date})
            </span>
          </div>

          <span className="text-xs font-bold text-[var(--accent-primary)]">
            {activeDayBlocks.length} planned blocks
          </span>
        </div>

        {/* Time Blocks List */}
        <div className="space-y-2.5">
          {activeDayBlocks.length === 0 ? (
            <Card variant="subtle" className="text-center py-12 rounded-3xl space-y-2">
              <span className="text-3xl">🍃</span>
              <p className="text-sm font-bold text-[var(--text-primary)]">No blocks scheduled for this day.</p>
              <p className="text-xs text-[var(--text-secondary)]">Time to explore the forest or take a rest!</p>
            </Card>
          ) : (
            activeDayBlocks.map((block) => (
              <div
                key={block.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 sm:py-4 rounded-2xl border transition-all duration-200 backdrop-blur-xl shadow-sm ghibli-btn ${
                  block.isAIRecommended
                    ? 'bg-[var(--bg-card)] border-2 border-emerald-400/50 text-[var(--text-primary)] shadow-[0_0_15px_rgba(158,216,163,0.1)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-primary)]'
                }`}
              >
                {/* Time & Title */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] font-bold min-w-[100px] bg-[var(--bg-surface-subtle)] px-2.5 py-1 rounded-xl border border-[var(--border-subtle)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {block.startTime} - {block.endTime}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold">
                        {block.title}
                      </span>
                      {block.isAIRecommended && (
                        <span className="text-[10px] text-lime-400 bg-lime-500/15 border border-lime-500/30 px-2 py-0.5 rounded-full font-bold">
                          ✨ Optimized
                        </span>
                      )}
                    </div>

                    {block.notes && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        {block.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Category */}
                <div className="flex items-center gap-2 mt-2.5 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    {block.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
