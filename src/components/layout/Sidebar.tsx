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

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'braindump', label: 'Brain Dump', icon: <PenLine className="w-4 h-4" /> },
    { id: 'plan', label: 'Plan', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#111816] border-r border-[#1E2824] select-none font-kalam text-[#F3F4F1] dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]">
      {/* Top Branding */}
      <div className="p-5 border-b border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]" />
          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
              GetDone
            </h1>
            <p className="text-[11px] text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] tracking-tight">
              Personal AI command center
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Action */}
      <div className="px-3.5 pt-3.5 pb-1">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#151D1A] border border-[#1E2824] hover:border-[#9ED8A3] hover:bg-[#18221E] text-[#9ED8A3] text-xs font-kalam transition-all duration-150 shadow-sm dark:bg-[#151D1A] dark:border-[#1E2824] dark:hover:border-[#9ED8A3] dark:text-[#9ED8A3] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:text-[#2563EB] light:hover:bg-[#EFF6FF] light:hover:border-[#BFDBFE]"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>New Priority</span>
          </span>
          <kbd className="text-[10px] text-[#55665A] bg-[#0A0F0D] px-1.5 py-0.5 rounded border border-[#1E2824] dark:bg-[#0A0F0D] dark:text-[#55665A] dark:border-[#1E2824] light:bg-[#F1F5F9] light:text-[#94A3B8] light:border-[#E2E8F0]">
            N
          </kbd>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#18221E] text-[#F3F4F1] font-medium border border-[#283630] dark:bg-[#18221E] dark:text-[#F3F4F1] dark:border-[#283630] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] shadow-sm'
                  : 'text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#151D1A] dark:text-[#8C9E90] dark:hover:text-[#F3F4F1] dark:hover:bg-[#151D1A] light:text-[#64748B] light:hover:text-[#111827] light:hover:bg-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`${
                    isActive
                      ? 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]'
                      : 'text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Theme Switcher */}
      <div className="p-3.5 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0] flex items-center justify-between">
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity flex-1"
          title={authUser ? `Signed in as ${authUser.email || 'Guest'}` : 'Click to sign in to Firebase'}
        >
          <div className="w-7 h-7 rounded bg-[#18221E] border border-[#283630] flex items-center justify-center text-xs font-semibold text-[#9ED8A3] dark:bg-[#18221E] dark:text-[#9ED8A3] dark:border-[#283630] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]">
            {authUser?.displayName
              ? authUser.displayName.charAt(0).toUpperCase()
              : profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] truncate">
              {authUser?.displayName || profile.name}
            </p>
            <p className="text-[10px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-[#84CC16]'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-zinc-500'
                }`}
              />
              <span>{authUser ? 'Cloud Synced' : 'Local / Offline'}</span>
            </p>
          </div>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#18221E] transition-colors dark:text-[#8C9E90] dark:hover:text-[#F3F4F1] dark:hover:bg-[#18221E] light:text-[#64748B] light:hover:text-[#111827] light:hover:bg-[#F1F5F9] shrink-0"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
