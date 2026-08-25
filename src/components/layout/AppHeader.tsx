'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Sun, Moon, Sparkles, Cloud, UserCheck, LogIn, AlertCircle } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    activeScreen,
    theme,
    toggleTheme,
    tasks,
    authUser,
    setAuthModalOpen,
    syncStatus,
  } = useApp();
  const isDark = theme === 'dark';

  const [todayDate, setTodayDate] = useState<string>('');

  useEffect(() => {
    setTodayDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

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

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-2xl sticky top-0 z-30 font-kalam text-[var(--text-primary)] transition-colors shadow-sm">
      {/* Left: Screen breadcrumb & Date */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-1.5 font-bold text-sm tracking-tight text-[var(--accent-primary)]">
          <span>🌿 GetDone</span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 text-xs">
          {todayDate && (
            <span className="text-[var(--text-secondary)] font-medium">
              🗓️ {todayDate}
            </span>
          )}
          {todayDate && <span className="text-[var(--text-muted)]">/</span>}
          <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold">
            <span>{currentMeta.icon}</span>
            <span>{currentMeta.title}</span>
          </div>
        </div>
      </div>

      {/* Right: Cloud Sync, Priority Counter, Day/Night Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firebase Cloud Sync Status */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--accent-primary)] transition-all ghibli-btn"
          title={authUser ? `Synced as ${authUser.email || authUser.id}` : 'Sign in to sync with Supabase Cloud'}
        >
          {authUser ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span className="hidden sm:inline text-[var(--accent-primary)] font-bold">
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sanctuary Synced'}
              </span>
              <UserCheck className="w-3 h-3 text-[var(--accent-primary)]" />
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-amber-400 font-bold">Cloud Sync</span>
            </>
          )}
        </button>

        {/* Urgent Task Acorn Warning Pill */}
        {pendingUrgentCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs shadow-sm">
            <span className="animate-bounce">🌰</span>
            <span>{pendingUrgentCount}</span>
            <span className="hidden md:inline">priority</span>
          </div>
        )}

        {/* Day / Night Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-all ghibli-btn shadow-sm"
          aria-label={isDark ? 'Switch to Sunlit Glade' : 'Switch to Starlit Night'}
          title={isDark ? 'Switch to Sunlit Glade' : 'Switch to Starlit Night'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-700 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
};
