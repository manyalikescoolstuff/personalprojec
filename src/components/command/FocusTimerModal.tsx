'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const FocusTimerModal: React.FC = () => {
  const { isFocusTimerOpen, closeFocusSession, focusSessionTask, toggleTaskComplete } = useApp();
  
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(true);

  // Sync timer when modal opens or task changes
  const prevTaskIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (isFocusTimerOpen && focusSessionTask?.id !== prevTaskIdRef.current) {
      prevTaskIdRef.current = focusSessionTask?.id || null;
      const minutes = focusSessionTask?.estimatedMinutes || 25;
      const initialMins = minutes <= 60 ? minutes : 45;
      setDurationMinutes(initialMins);
      setSecondsLeft(initialMins * 60);
      setIsActive(true);
    }
  }, [isFocusTimerOpen, focusSessionTask]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const selectDuration = (mins: number) => {
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsActive(true);
  };

  const togglePlayPause = () => {
    setIsActive((prev) => !prev);
  };

  const handleReset = () => {
    setSecondsLeft(durationMinutes * 60);
    setIsActive(false);
  };

  const handleMarkDone = () => {
    if (focusSessionTask) {
      toggleTaskComplete(focusSessionTask.id);
    }
    closeFocusSession();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;

  return (
    <Modal
      isOpen={isFocusTimerOpen}
      onClose={closeFocusSession}
      title="Focus Session"
      subtitle="Deep work interval · Distractions paused"
      maxWidth="sm"
    >
      <div className="space-y-6 text-center font-kalam">
        {/* Active Task Info */}
        {focusSessionTask ? (
          <div className="bg-[#111816] border border-[#1E2824] rounded-md p-3 text-left dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]">
                Target Priority
              </span>
            </div>
            <h4 className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] truncate">
              {focusSessionTask.title}
            </h4>
          </div>
        ) : (
          <p className="text-xs text-[#8C9E90]">Deep Focus Window</p>
        )}

        {/* Minimalist Countdown Display */}
        <div className="relative py-3 flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-6xl font-light tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] font-sans">
            {formatTime(secondsLeft)}
          </div>

          {/* Calm ambient breathing bar */}
          <div className="w-48 h-1 bg-[#1E2824] rounded-full mt-4 overflow-hidden dark:bg-[#1E2824] light:bg-[#E2E8F0]">
            <div
              className="h-full bg-[#9ED8A3] transition-all duration-1000 dark:bg-[#9ED8A3] light:bg-[#2563EB]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-xs text-[#8C9E90] mt-2 font-kalam">
            {isActive ? 'In progress' : secondsLeft === 0 ? 'Completed' : 'Paused'}
          </span>
        </div>

        {/* Duration Selection Chips */}
        <div className="flex items-center justify-center gap-2 text-xs">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => selectDuration(mins)}
              className={`px-2.5 py-1 rounded border transition-colors ${
                durationMinutes === mins
                  ? 'bg-[#18221E] border-[#9ED8A3] text-[#9ED8A3] dark:bg-[#18221E] dark:text-[#9ED8A3] dark:border-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                  : 'bg-[#111816] border-[#1E2824] text-[#8C9E90] hover:text-[#F3F4F1] dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={togglePlayPause}
            className="w-28"
          >
            {isActive ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Pause className="w-4 h-4" />
                Pause
              </span>
            ) : (
              <span className="flex items-center gap-1.5 justify-center">
                <Play className="w-4 h-4" />
                Start
              </span>
            )}
          </Button>

          {focusSessionTask && (
            <Button
              variant="command"
              size="sm"
              onClick={handleMarkDone}
              title="Complete priority"
            >
              <Check className="w-4 h-4 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
