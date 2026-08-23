'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles } from 'lucide-react';
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
      title="Totoro Rain Focus Session"
      subtitle="Deep study interval · Calm forest rain rhythm 🌧️"
      maxWidth="sm"
    >
      <div className="space-y-6 text-center font-kalam">
        {/* Active Task Info */}
        {focusSessionTask ? (
          <div className="bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-[var(--accent-primary)] font-bold flex items-center gap-1">
                <span>🌰</span>
                <span>Active Target Seed</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
              {focusSessionTask.title}
            </h4>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-secondary)]">
            <span>🍃</span>
            <span>Deep Sanctuary Focus Window</span>
          </div>
        )}

        {/* Totoro Rain Countdown Display */}
        <div className="relative py-2 flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-6xl font-light tracking-tight text-[var(--text-primary)] font-sans">
            {formatTime(secondsLeft)}
          </div>

          {/* Gentle Forest Bloom Progress Bar */}
          <div className="w-56 h-2 bg-[var(--bg-surface-subtle)] rounded-full mt-4 overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_#a3e635]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-xs text-[var(--text-secondary)] mt-2 font-kalam flex items-center gap-1">
            {isActive ? (
              <>
                <span className="animate-spin text-lime-400">🌧️</span>
                <span>Raindrops falling · Mind in flow</span>
              </>
            ) : secondsLeft === 0 ? (
              <>
                <span>✨</span>
                <span>Sprout bloomed! Take a breath.</span>
              </>
            ) : (
              <span>Paused under the leafy shelter</span>
            )}
          </span>
        </div>

        {/* Duration Selection Chips */}
        <div className="flex items-center justify-center gap-2 text-xs">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => selectDuration(mins)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all ghibli-btn ${
                durationMinutes === mins
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="leaf"
            size="md"
            onClick={togglePlayPause}
            className="w-32"
          >
            {isActive ? (
              <span className="flex items-center gap-2 justify-center font-bold">
                <Pause className="w-4 h-4" />
                Pause
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center font-bold">
                <Play className="w-4 h-4 fill-current" />
                Start Flow
              </span>
            )}
          </Button>

          {focusSessionTask && (
            <Button
              variant="acorn"
              size="sm"
              onClick={handleMarkDone}
              title="Harvest & complete priority"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
