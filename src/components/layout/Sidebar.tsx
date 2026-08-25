'use client';

import React from 'react';
import {
  Home,
  PenLine,
  Calendar,
  CheckSquare,
  Settings,
  Sun,
  Moon,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AppScreen } from '@/types';

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    theme,
    toggleTheme,
    profile,
    setQuickAddOpen,
    authUser,
    setAuthModalOpen,
    syncStatus,
  } = useApp();

  const isDark = theme === 'dark';

  const navItems: { id: AppScreen; label: string; icon: string; subtitle: string }[] = [
    { id: 'home', label: 'Sanctuary', icon: '🏡', subtitle: 'Command Center' },
    { id: 'braindump', label: 'Catbus Dump', icon: '🚌', subtitle: 'AI Thought Sorter' },
    { id: 'plan', label: 'Focus Glade', icon: '🌿', subtitle: 'Weekly Rhythm' },
    { id: 'tasks', label: 'Acorn Tasks', icon: '🌰', subtitle: 'Priority List' },
    { id: 'settings', label: 'Spirits & Config', icon: '🍃', subtitle: 'Preferences' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[var(--bg-surface)] backdrop-blur-2xl border-r border-[var(--border-subtle)] select-none font-kalam text-[var(--text-primary)] transition-all z-20 shadow-xl">
      {/* Top Branding with Totoro Forest Badge */}
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-[var(--accent-primary)]/40 shadow-md ghibli-btn shrink-0 bg-[#E8F1F2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/ghibli/totoro_hero.jpg"
              alt="Totoro mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                GetDone
              </h1>
              <span className="text-xs">🍃</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Totoro Forest Sanctuary
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Action */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--accent-primary)] text-xs font-bold transition-all shadow-sm ghibli-btn"
        >
          <span className="flex items-center gap-2">
            <span className="text-sm">🌰</span>
            <span>Plant New Priority</span>
          </span>
          <kbd className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)]">
            N
          </kbd>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-2 space-y-1.5">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 relative ghibli-btn ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 text-[var(--text-primary)] font-bold border border-[var(--accent-primary)]/40 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <div className="text-left">
                  <p className="leading-none text-sm">{item.label}</p>
                </div>
              </div>

              {isActive && (
                <span className="text-xs text-[var(--accent-primary)] animate-pulse">✨</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Animated Soot Sprite Decorative Box */}
      <div className="mx-4 mb-3 p-3 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-zinc-700/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ghibli/soot_sprites.jpg"
            alt="Soot sprites"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-[11px] leading-tight">
          <p className="font-bold text-[var(--text-primary)]">Soot Sprites Active</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Organizing thoughts &amp; dreams</p>
        </div>
      </div>

      {/* User Info & Theme Switcher */}
      <div className="p-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-subtle)]/50">
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity flex-1"
          title={authUser ? `Signed in as ${authUser.email || 'Guest'}` : 'Click to sign in to Supabase'}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {authUser?.user_metadata?.full_name
              ? authUser.user_metadata.full_name.charAt(0).toUpperCase()
              : profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
              {authUser?.user_metadata?.full_name || authUser?.email || profile.name}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-lime-400 shadow-[0_0_6px_#a3e635]'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-zinc-500'
                }`}
              />
              <span>{authUser ? 'Cloud Spirit Active' : 'Local Sanctuary'}</span>
            </p>
          </div>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors shrink-0 ghibli-btn"
          title={`Switch to ${isDark ? 'Day' : 'Night'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>
    </aside>
  );
};
