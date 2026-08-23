'use client';

import React from 'react';
import { Sun, Moon, Plus, Cloud, Sparkles } from 'lucide-react';
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

  const screenTitles: Record<string, { title: string; icon: string; subtitle: string }> = {
    home: { title: 'Forest Sanctuary', icon: '🏡', subtitle: 'Totoro Command Center' },
    braindump: { title: 'Catbus Brain Express', icon: '🚌', subtitle: 'Thought Organizer' },
    plan: { title: 'Weekly Focus Glade', icon: '🌿', subtitle: 'Day & Night Rhythm' },
    tasks: { title: 'Acorn Priorities', icon: '🌰', subtitle: 'Actionable Tasks' },
    settings: { title: 'Spirits & Preferences', icon: '🍃', subtitle: 'Workspace Config' },
  };

  const currentMeta = screenTitles[activeScreen] || screenTitles.home;

  const todayDate = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-2xl sticky top-0 z-30 font-kalam text-[var(--text-primary)] transition-colors shadow-sm">
      {/* Left: Screen breadcrumb & Date */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-1.5 font-bold text-sm tracking-tight text-[var(--accent-primary)]">
          <span>🌿 GetDone</span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 text-xs">
          <span
            suppressHydrationWarning
            className="text-[var(--text-secondary)] font-medium"
          >
            🗓️ {todayDate}
          </span>
          <span className="text-[var(--text-muted)]">/</span>
          <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold">
            <span>{currentMeta.icon}</span>
            <span>{currentMeta.title}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick actions & indicators */}
      <div className="flex items-center gap-2.5">
        {/* Firebase Cloud Sync Indicator */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all ghibli-btn shadow-sm"
          title={authUser ? `Logged in: ${authUser.email || 'Guest'} (Cloud Synced)` : 'Click to connect Firebase Cloud'}
        >
          <Cloud className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="hidden sm:inline">
            {authUser ? (authUser.displayName ? authUser.displayName.split(' ')[0] : 'Cloud Synced') : 'Sync Backend'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-lime-400 shadow-[0_0_8px_#a3e635]'
                : syncStatus === 'syncing'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-zinc-500'
            }`}
          />
        </button>

        {pendingUrgentCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-red-500/15 border border-red-500/30 text-red-400 font-medium">
            <span>🌰</span>
            <span>{pendingUrgentCount} priority today</span>
          </div>
        )}

        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs bg-gradient-to-r from-[#4E8752] to-[#6BA36F] dark:from-[#5A995F] dark:to-[#74B57A] text-white dark:text-[#0C1A12] font-bold transition-all shadow-md ghibli-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Seed</span>
        </button>

        {/* Mobile Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors ghibli-btn"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>
    </header>
  );
};
