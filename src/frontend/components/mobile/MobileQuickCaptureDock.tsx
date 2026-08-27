'use client';

import React, { useState, useRef } from 'react';
import {
  Plus,
  Mic,
  Camera,
  Lightbulb,
  X,
  Sparkles,
  Zap,
  BrainCircuit,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { haptics } from '@/lib/haptics';
import { soundManager } from '@/lib/soundEffects';

export const MobileQuickCaptureDock: React.FC = () => {
  const { setActiveScreen, setQuickAddOpen, addBrainDump } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const toggleDock = () => {
    haptics.medium();
    soundManager.playClick();
    setIsOpen((prev) => !prev);
  };

  const handleAction = (callback: () => void) => {
    haptics.light();
    soundManager.playSparkle();
    setIsOpen(false);
    callback();
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    haptics.success();
    soundManager.playSparkle();
    const reader = new FileReader();
    reader.onloadend = () => {
      // Add as screenshot brain dump
      addBrainDump(file.name || 'Mobile Camera Capture', 'screenshot');
      setActiveScreen('braindump');
    };
    reader.readAsDataURL(file);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-40 font-kalam select-none">
      {/* Hidden Mobile Camera Input */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 animate-fadeIn"
        />
      )}

      {/* Quick Action Circular Buttons (Floating Fan / Stack) */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 z-40 flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* 1. Voice Dump */}
          <button
            type="button"
            onClick={() =>
              handleAction(() => {
                setActiveScreen('braindump');
              })
            }
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-emerald-500/50 shadow-xl text-xs font-bold text-[var(--text-primary)] hover:border-emerald-400 ghibli-btn"
          >
            <span>🎙️ Voice Dump Workload</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
          </button>

          {/* 2. Camera / Screenshot OCR */}
          <button
            type="button"
            onClick={() => {
              haptics.light();
              cameraInputRef.current?.click();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-sky-500/50 shadow-xl text-xs font-bold text-[var(--text-primary)] hover:border-sky-400 ghibli-btn"
          >
            <span>📸 Snap Homework / Slide</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </button>

          {/* 3. Sprout Creative Idea */}
          <button
            type="button"
            onClick={() =>
              handleAction(() => {
                setActiveScreen('incubator');
              })
            }
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-purple-500/50 shadow-xl text-xs font-bold text-[var(--text-primary)] hover:border-purple-400 ghibli-btn"
          >
            <span>🌱 Incubate Project Idea</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
          </button>

          {/* 4. Quick Add Priority Task */}
          <button
            type="button"
            onClick={() =>
              handleAction(() => {
                setQuickAddOpen(true);
              })
            }
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-amber-500/50 shadow-xl text-xs font-bold text-[var(--text-primary)] hover:border-amber-400 ghibli-btn"
          >
            <span>🌰 Add Acorn Priority</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={toggleDock}
        aria-label="Quick capture dock"
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative z-40 border-2 ${
          isOpen
            ? 'bg-red-500/90 border-red-300 rotate-45 scale-105'
            : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-lime-600 border-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <div className="flex items-center justify-center relative">
            <Plus className="w-7 h-7 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
          </div>
        )}
      </button>
    </div>
  );
};
