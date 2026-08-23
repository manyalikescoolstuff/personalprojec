'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AppScreen } from '@/types';

export const BottomNav: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();

  const navItems: { id: AppScreen; label: string; icon: string }[] = [
    { id: 'home', label: 'Sanctuary', icon: '🏡' },
    { id: 'braindump', label: 'Catbus', icon: '🚌' },
    { id: 'plan', label: 'Glade', icon: '🌿' },
    { id: 'tasks', label: 'Acorns', icon: '🌰' },
    { id: 'settings', label: 'Spirits', icon: '🍃' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] backdrop-blur-2xl border-t border-[var(--border-subtle)] font-kalam select-none px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ghibli-btn ${
                isActive
                  ? 'text-[var(--accent-primary)] font-bold scale-105'
                  : 'text-[var(--text-secondary)] opacity-80'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-0.5 shadow-[0_0_6px_#a3e635]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
