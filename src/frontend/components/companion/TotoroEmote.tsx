'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, X, Play, Plus, BrainCircuit } from 'lucide-react';
import { soundManager } from '@/lib/soundEffects';
import { TotoroCharacter } from './TotoroCharacter';

type TotoroState = 'idle' | 'running' | 'jumping' | 'happy';

export const TotoroEmote: React.FC = () => {
  const { activeScreen, setActiveScreen, setQuickAddOpen, startFocusSession, tasks } = useApp();

  const [state, setState] = useState<TotoroState>('idle');
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [bubbleQuote, setBubbleQuote] = useState('');
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef<number>(0);
  const prevScreen = useRef<string>(activeScreen);

  const forestQuotes = [
    'Roaaar! (Dump your workload first, then we conquer each acorn!) 🍃',
    'The soot sprites are ready to organize your academic tasks! ✨',
    'Focus like the giant camphor tree — steady and unshakeable 🌱',
    'Rain or shine, your leafy umbrella protects your progress! 🌧️',
    'Take a breath and harvest your priorities one by one! 🌰',
  ];

  // 1. React to Page Jumps (Screen Changes)
  useEffect(() => {
    if (prevScreen.current !== activeScreen) {
      prevScreen.current = activeScreen;
      setState('jumping');
      soundManager.playSparkle();

      const newSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 80 - 40,
        y: Math.random() * -50 - 30,
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => {
        setState('idle');
        setSparkles([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeScreen]);

  // 2. React to User Scrolling (Running Totoro)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) > 4) {
        setDirection(delta > 0 ? 'right' : 'left');
        setState('running');

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        scrollTimeoutRef.current = setTimeout(() => {
          setState('idle');
        }, 300);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // 3. Click / Pet Interaction
  const handleTotoroClick = () => {
    setState('happy');
    soundManager.playClick();

    const randomQuote = forestQuotes[Math.floor(Math.random() * forestQuotes.length)];
    setBubbleQuote(randomQuote);
    setIsBubbleOpen(true);

    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 90 - 45,
      y: Math.random() * -70 - 20,
    }));
    setSparkles(newSparkles);

    setTimeout(() => {
      setState('idle');
      setSparkles([]);
    }, 1600);
  };

  // Open Totoro's Library when Brain / Thought Cloud is clicked
  const handleOpenLibrary = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playSparkle();
    setActiveScreen('library');
    setIsBubbleOpen(false);
  };

  const pendingUrgent = tasks.filter((t) => !t.isCompleted && t.priority === 'urgent').length;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-8 z-50 select-none font-kalam pointer-events-auto">
      {/* Whimsical Dream / Thought Cloud with Interactive Brain */}
      {isBubbleOpen && (
        <div className="absolute bottom-28 right-0 z-50 flex flex-col items-end pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Main Thought Cloud Container */}
          <div
            onClick={handleOpenLibrary}
            className="group relative w-72 sm:w-80 p-4.5 rounded-3xl bg-[var(--bg-surface)] backdrop-blur-2xl border-2 border-purple-500/40 hover:border-purple-400 shadow-[0_12px_36px_rgba(168,85,247,0.25)] text-left space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Top Banner with Close & Brain Icon */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {/* Pulsing Glowing Brain Avatar */}
                <div
                  onClick={handleOpenLibrary}
                  className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-fuchsia-500/25 to-emerald-500/20 border-2 border-purple-400/60 flex items-center justify-center text-2xl shadow-md group-hover:scale-115 group-hover:rotate-6 transition-all"
                  title="Click my brain to open Totoro's Library!"
                >
                  <span className="animate-pulse">🧠</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Totoro&apos;s Brain</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-purple-300 transition-colors leading-tight">
                    Totoro&apos;s Memory Library 📚
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBubbleOpen(false);
                }}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-soft)] transition-colors"
                title="Close thought cloud"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thought Cloud Prompt Quote */}
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-[var(--text-primary)] font-medium leading-relaxed space-y-1">
              <p className="text-purple-300 font-bold flex items-center gap-1 text-xs">
                <span>✨</span>
                <span>Click my brain to open your library!</span>
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                &ldquo;{bubbleQuote}&rdquo;
              </p>
            </div>

            {/* Interactive Brain Action Pill */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
              <div
                onClick={handleOpenLibrary}
                className="flex items-center gap-1.5 text-xs text-purple-400 font-bold group-hover:text-purple-300 transition-colors"
              >
                <span className="text-base">🧠</span>
                <span>Open Subject Vaults &rarr;</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveScreen('braindump');
                    setIsBubbleOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-400 text-[11px] text-[var(--text-primary)] font-bold flex items-center gap-1 ghibli-btn shadow-sm"
                >
                  <BrainCircuit className="w-3 h-3 text-amber-400" />
                  <span>Dump</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startFocusSession();
                    setIsBubbleOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-md ghibli-btn"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Focus</span>
                </button>
              </div>
            </div>
          </div>

          {/* Whimsical connecting thought bubbles leading down to Totoro */}
          <div className="flex flex-col items-end pr-10 -space-y-1 mt-1 pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-[var(--bg-surface)] border-2 border-purple-500/40 shadow-md animate-bounce" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--bg-surface)] border-2 border-purple-500/30 shadow-sm mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-surface)] border border-purple-500/20 mr-3" />
          </div>
        </div>
      )}

      {/* Floating Sparkles & Konpeito Star Candies */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none text-base animate-bounce"
          style={{
            left: `calc(50% + ${s.x}px)`,
            top: `${s.y}px`,
            transition: 'all 0.5s ease-out',
          }}
        >
          ✨
        </div>
      ))}

      {/* Animated Interactive Totoro Character Figure */}
      <div
        onClick={handleTotoroClick}
        className="group relative cursor-pointer flex flex-col items-center"
      >
        {/* Urgent Task Notification Leaf Badge on Totoro */}
        {pendingUrgent > 0 && (
          <div className="absolute -top-1 -right-2 z-20 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-[0_0_8px_#ef4444] animate-bounce flex items-center gap-0.5">
            <span>🌰</span>
            <span>{pendingUrgent} urgent</span>
          </div>
        )}

        {/* Vector Animated Totoro Character */}
        <TotoroCharacter
          state={state}
          direction={direction}
          className="transition-transform duration-200 group-hover:scale-105"
        />

        {/* Cute label on hover */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[var(--accent-primary)] bg-[var(--bg-surface)] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)] shadow-sm -mt-1 z-10">
          Pet Totoro 🍃
        </span>
      </div>
    </div>
  );
};
