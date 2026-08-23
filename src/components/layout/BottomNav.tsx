'use client';

import React from 'react';
import { Home, PenLine, Calendar, CheckSquare, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AppScreen } from '@/types';

export const BottomNav: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'braindump', label: 'Brain Dump', icon: <PenLine className="w-4 h-4" /> },
    { id: 'plan', label: 'Plan', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111816]/95 backdrop-blur-md border-t border-[#1E2824] font-kalam select-none px-2 py-1.5 dark:bg-[#111816]/95 dark:border-[#1E2824] light:bg-[#FFFFFF]/95 light:border-[#E2E8F0]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-md transition-all duration-150 relative ${
                isActive
                  ? 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]'
                  : 'text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]'
              }`}
            >
              <span className="p-0.5">{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
