'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, X, Play, Plus } from 'lucide-react';
import { soundManager } from '@/lib/soundEffects';

type TotoroState = 'idle' | 'running' | 'jumping' | 'happy';

export const TotoroEmote: React.FC = () => {
  const { activeScreen, setQuickAddOpen, startFocusSession, tasks } = useApp();

  const [state, setState] = useState<TotoroState>('idle');
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [bubbleQuote, setBubbleQuote] = useState('');
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef<number>(0);
  const prevScreen = useRef<string>(activeScreen);

  const forestQuotes = [
    'Roaaar! (Let\'s conquer your priorities today!) 🍃',
    'The soot sprites are cheering for your focus! ✨',
    'Did you know? Every finished task plants a sprout in your forest garden! 🌱',
    'Remember to breathe and drink some tea under the trees 🍵',
    'Hold your leafy umbrella high when exams approach! 🌧️',
    'I found a golden acorn for you today! 🌰',
  ];

  // 1. React to Page Jumps (Screen Changes)
  useEffect(() => {
    if (prevScreen.current !== activeScreen) {
      prevScreen.current = activeScreen;
      setState('jumping');
      soundManager.playSparkle();

      // Add celebratory star sparkles
      const newSparkles = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 60 - 30,
        y: Math.random() * -40 - 20,
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => {
        setState('idle');
        setSparkles([]);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [activeScreen]);

  // 2. React to User Scrolling (Running Totoro)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) > 5) {
        setDirection(delta > 0 ? 'right' : 'left');
        setState('running');

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        scrollTimeoutRef.current = setTimeout(() => {
          setState('idle');
        }, 350);
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

    // Pick random forest quote
    const randomQuote = forestQuotes[Math.floor(Math.random() * forestQuotes.length)];
    setBubbleQuote(randomQuote);
    setIsBubbleOpen(true);

    // Star candy sparkles
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 - 40,
      y: Math.random() * -60 - 20,
    }));
    setSparkles(newSparkles);

    setTimeout(() => {
      setState('idle');
      setSparkles([]);
    }, 1500);
  };

  const pendingUrgent = tasks.filter((t) => !t.isCompleted && t.priority === 'urgent').length;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-8 z-50 select-none font-kalam pointer-events-auto">
      {/* Interactive Speech Bubble */}
      {isBubbleOpen && (
        <div className="absolute bottom-24 right-0 w-64 p-4 rounded-3xl bg-[var(--bg-surface)] backdrop-blur-2xl border-2 border-[var(--border-highlight)] shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left space-y-2.5 z-20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)]">
              <span>🍃</span>
              <span>Totoro says:</span>
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

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1.5 text-[11px]">
            <button
              onClick={() => {
                setQuickAddOpen(true);
                setIsBubbleOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-bold flex items-center gap-1 ghibli-btn"
            >
              <Plus className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>Plant Seed</span>
            </button>

            <button
              onClick={() => {
                startFocusSession();
                setIsBubbleOpen(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-1 shadow-sm ghibli-btn"
            >
              <Play className="w-3 h-3 fill-current" />
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

      {/* Totoro Emote Avatar Figure */}
      <div
        onClick={handleTotoroClick}
        className="group relative cursor-pointer flex flex-col items-center"
      >
        {/* Urgent Task Notification Leaf Badge on Totoro */}
        {pendingUrgent > 0 && (
          <div className="absolute -top-2 -right-1 z-10 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-[0_0_8px_#ef4444] animate-bounce flex items-center gap-0.5">
            <span>🌰</span>
            <span>{pendingUrgent}</span>
          </div>
        )}

        {/* Emote Sprite Box */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-emerald-400/40 bg-[#E8F1F2]/80 backdrop-blur-md shadow-2xl transition-all duration-300 ${
            state === 'running'
              ? 'scale-110 -translate-y-2'
              : state === 'jumping'
              ? 'scale-125 -translate-y-6 rotate-6 shadow-[0_0_25px_#a3e635]'
              : state === 'happy'
              ? 'scale-115 -translate-y-3'
              : 'hover:scale-110 hover:-translate-y-1'
          }`}
          style={{
            transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              state === 'running'
                ? '/assets/ghibli/totoro_running.jpg'
                : state === 'jumping'
                ? '/assets/ghibli/totoro_jumping.jpg'
                : '/assets/ghibli/totoro_hero.jpg'
            }
            alt="Totoro Emote"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        {/* Shadow / Dust Puff Effect under Totoro */}
        <div
          className={`h-2 rounded-full bg-black/30 blur-sm transition-all duration-200 mt-1 ${
            state === 'running'
              ? 'w-16 translate-x-1'
              : state === 'jumping'
              ? 'w-8 opacity-20'
              : 'w-14'
          }`}
        />

        {/* Cute label on hover */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[var(--accent-primary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] shadow-sm mt-0.5">
          Pet Totoro 🍃
        </span>
      </div>
    </div>
  );
};
