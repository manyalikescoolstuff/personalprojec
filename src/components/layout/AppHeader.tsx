'use client';

import React from 'react';
import { Sun, Moon, Plus, Cloud, Database } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const AppHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    tasks,
    setQuickAddOpen,
    activeScreen,
    authUser,
    setAuthModalOpen,
    syncStatus,
  } = useApp();
  const isDark = theme === 'dark';

  const pendingUrgentCount = tasks.filter(
    (t) => !t.isCompleted && (t.priority === 'urgent' || t.priority === 'high')
  ).length;

  const screenTitles: Record<string, string> = {
    home: 'Command Center',
    braindump: 'Brain Dump',
    plan: 'Weekly Plan',
    tasks: 'Tasks',
    settings: 'Settings',
  };

  const todayDate = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[#1E2824] bg-[#0A0F0D]/90 backdrop-blur-md sticky top-0 z-30 font-kalam text-[#F3F4F1] dark:bg-[#0A0F0D]/90 dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#FFFFFF]/90 light:border-[#E2E8F0] light:text-[#111827]">
      {/* Left: Screen breadcrumb & Date */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-1.5 font-semibold text-xs tracking-tight text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]">
          <span>GetDone</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs">
          <span
            suppressHydrationWarning
            className="text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]"
          >
            {todayDate}
          </span>
          <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">/</span>
          <span className="text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] font-medium">
            {screenTitles[activeScreen] || 'Command Center'}
          </span>
        </div>
      </div>

      {/* Right: Quick actions & indicators */}
      <div className="flex items-center gap-2.5">
        {/* Firebase Cloud Sync Indicator */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors ${
            authUser
              ? 'bg-[#15231B] border-[#254231] text-[#9ED8A3] hover:bg-[#1A2D22]'
              : 'bg-[#151D1A] border-[#1E2824] text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#1A2420]'
          }`}
          title={authUser ? `Logged in: ${authUser.email || 'Guest'} (Cloud Synced)` : 'Click to connect Firebase Cloud'}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {authUser ? (authUser.displayName ? authUser.displayName.split(' ')[0] : 'Cloud Synced') : 'Sync Backend'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-[#84CC16]'
                : syncStatus === 'syncing'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-zinc-500'
            }`}
          />
        </button>

        {pendingUrgentCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#151D1A] border border-[#1E2824] text-[#8C9E90] dark:bg-[#151D1A] dark:border-[#1E2824] dark:text-[#8C9E90] light:bg-[#EFF6FF] light:border-[#BFDBFE] light:text-[#2563EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A7A] dark:bg-[#E07A7A] light:bg-[#DC2626]" />
            <span>{pendingUrgentCount} priority today</span>
          </div>
        )}

        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs bg-[#9ED8A3] text-[#0A0F0D] hover:bg-[#B2E2B6] font-medium transition-colors dark:bg-[#9ED8A3] dark:text-[#0A0F0D] light:bg-[#2563EB] light:text-white light:hover:bg-[#1D4ED8]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>

        {/* Mobile Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="md:hidden p-1.5 rounded text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#151D1A] transition-colors dark:text-[#8C9E90] dark:hover:text-[#F3F4F1] light:text-[#64748B] light:hover:text-[#111827]"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
