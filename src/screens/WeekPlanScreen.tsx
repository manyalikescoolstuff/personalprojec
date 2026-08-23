'use client';

import React, { useState } from 'react';
import {
  Clock,
  X,
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

  const days: { id: DayOfWeek; label: string; full: string; date: string }[] = [
    { id: 'Mon', label: 'Mon', full: 'Monday', date: 'Aug 17' },
    { id: 'Tue', label: 'Tue', full: 'Tuesday', date: 'Aug 18' },
    { id: 'Wed', label: 'Wed', full: 'Wednesday', date: 'Aug 19' },
    { id: 'Thu', label: 'Thu', full: 'Thursday', date: 'Aug 20' },
    { id: 'Fri', label: 'Fri', full: 'Friday', date: 'Aug 21' },
    { id: 'Sat', label: 'Sat', full: 'Saturday', date: 'Aug 22' },
    { id: 'Sun', label: 'Sun', full: 'Sunday', date: 'Aug 23' },
  ];

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Wed');

  const activeDayBlocks = schedule.filter((b) => b.day === selectedDay);

  const getDayBlockCount = (day: DayOfWeek) => {
    return schedule.filter((b) => b.day === day).length;
  };

  const isScheduleRec = aiRecommendation?.type === 'schedule_optimization';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-kalam">
      {/* 1. Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
            Weekly Plan
          </h1>
          <p className="text-sm sm:text-base text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
            Workload distribution &amp; time blocks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          <span className="w-2 h-2 rounded-full bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]" />
          <span>Balanced Weekly Schedule</span>
        </div>
      </section>

      {/* 2. AI Scheduling Suggestion Banner */}
      {isScheduleRec && !aiRecommendation?.isDismissed && (
        <Card variant="accent" className="p-4 sm:p-5 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium">
                  AI Schedule Suggestion
                </span>
                {aiRecommendation.isApplied && (
                  <span className="text-[11px] text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] bg-[#9ED8A3]/10 px-1.5 py-0.5 rounded">
                    Rescheduled
                  </span>
                )}
              </div>

              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                {aiRecommendation.message}
              </h3>

              {aiRecommendation.context && (
                <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] font-sans">
                  {aiRecommendation.context}
                </p>
              )}
            </div>

            <button
              onClick={() => dismissRecommendation(aiRecommendation.id)}
              className="text-[#55665A] hover:text-[#F3F4F1] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!aiRecommendation.isApplied && (
            <div className="flex items-center gap-2 pt-3 mt-2 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => acceptRecommendation(aiRecommendation.id)}
              >
                Accept
              </Button>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => dismissRecommendation(aiRecommendation.id)}
              >
                Ignore
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 3. 7-Day Selector Bar */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isSelected = selectedDay === day.id;
          const count = getDayBlockCount(day.id);
          const isToday = day.id === 'Wed';

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border transition-all duration-150 text-center ${
                isSelected
                  ? 'bg-[#18221E] border-[#9ED8A3] text-[#F3F4F1] shadow-sm dark:bg-[#18221E] dark:border-[#9ED8A3] light:bg-[#FFFFFF] light:border-[#2563EB] light:text-[#111827]'
                  : 'bg-[#151D1A] border-[#1E2824] hover:border-[#283630] text-[#8C9E90] hover:text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#64748B]'
              }`}
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                {day.label}
              </span>
              <span
                className={`text-sm sm:text-base font-semibold mt-0.5 ${
                  isToday
                    ? 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]'
                    : ''
                }`}
              >
                {day.date.split(' ')[1]}
              </span>
              <span className="text-[10px] text-[#55665A] mt-1 font-sans">
                {count} blocks
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Selected Day Focus Workspace */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
              {days.find((d) => d.id === selectedDay)?.full} Schedule
            </h2>
            <span className="text-xs text-[#8C9E90] font-sans dark:text-[#8C9E90] light:text-[#64748B]">
              ({days.find((d) => d.id === selectedDay)?.date})
            </span>
          </div>

          <span className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
            {activeDayBlocks.length} time blocks
          </span>
        </div>

        {/* Time Blocks List */}
        <div className="space-y-2">
          {activeDayBlocks.length === 0 ? (
            <Card variant="subtle" className="text-center py-10">
              <p className="text-sm text-[#8C9E90]">No blocks scheduled for this day.</p>
            </Card>
          ) : (
            activeDayBlocks.map((block) => (
              <div
                key={block.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-4 sm:py-3 rounded-lg border transition-colors ${
                  block.isAIRecommended
                    ? 'bg-[#151D1A] border-[#9ED8A3]/50 text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#9ED8A3]/50 light:bg-[#EFF6FF] light:border-[#BFDBFE]'
                    : 'bg-[#151D1A] border-[#1E2824] text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0]'
                }`}
              >
                {/* Time & Title */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-sans min-w-[95px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {block.startTime} - {block.endTime}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-normal">
                        {block.title}
                      </span>
                      {block.isAIRecommended && (
                        <span className="text-[10px] text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] bg-[#9ED8A3]/10 px-1.5 py-0.5 rounded">
                          Optimized
                        </span>
                      )}
                    </div>

                    {block.notes && (
                      <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] font-sans">
                        {block.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Category */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
                  <span className="text-xs text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] font-kalam">
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
