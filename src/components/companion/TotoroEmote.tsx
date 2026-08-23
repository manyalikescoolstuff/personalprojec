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

  const pendingUrgent = tasks.filter((t) => !t.isCompleted && t.priority === 'urgent').length;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-8 z-50 select-none font-kalam pointer-events-auto">
      {/* Interactive Speech Bubble */}
      {isBubbleOpen && (
        <div className="absolute bottom-32 right-0 w-72 p-4.5 rounded-3xl bg-[var(--bg-surface)] backdrop-blur-2xl border-2 border-[var(--border-highlight)] shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left space-y-3 z-20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)]">
              <span>🍃</span>
              <span>Totoro Forest Spirit</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBubbleOpen(false);
              }}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
            &ldquo;{bubbleQuote}&rdquo;
          </p>

          {/* Quick Action Shortcuts */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[11px]">
            <button
              onClick={() => {
                setActiveScreen('braindump');
                setIsBubbleOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-bold flex items-center gap-1 ghibli-btn shadow-sm"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
              <span>Dump Workload</span>
            </button>

            <button
              onClick={() => {
                startFocusSession();
                setIsBubbleOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-1 shadow-md ghibli-btn"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Rain Focus</span>
            </button>
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
