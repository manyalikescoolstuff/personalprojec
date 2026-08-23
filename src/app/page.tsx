'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AppHeader } from '@/components/layout/AppHeader';
import { HomeScreen } from '@/screens/HomeScreen';
import { BrainDumpScreen } from '@/screens/BrainDumpScreen';
import { WeekPlanScreen } from '@/screens/WeekPlanScreen';
import { TasksScreen } from '@/screens/TasksScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

// Command Center Modals
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { QuickAddTaskModal } from '@/components/tasks/QuickAddTaskModal';
import { ExhaustionModal } from '@/components/command/ExhaustionModal';
import { FocusTimerModal } from '@/components/command/FocusTimerModal';
import { AuthModal } from '@/components/auth/AuthModal';

export default function AppMain() {
  const { activeScreen, theme, isAuthModalOpen, setAuthModalOpen } = useApp();
  const isDark = theme === 'dark';

  return (
    <div
      className={`relative flex min-h-screen font-kalam antialiased transition-all duration-300 ${
        isDark ? 'ghibli-bg-night text-[#F4F7F6]' : 'ghibli-bg-day text-[#2C2218]'
      }`}
    >
      {/* Ambient Forest Particles Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-70">
        <div
          className={`absolute top-12 left-1/4 w-2.5 h-2.5 rounded-full ${
            isDark ? 'bg-lime-300 shadow-[0_0_12px_#bef264] animate-firefly' : 'bg-amber-200/80 animate-ghibli-float'
          }`}
          style={{ animationDelay: '0.2s', animationDuration: '3.5s' }}
        />
        <div
          className={`absolute top-1/3 right-1/5 w-2 h-2 rounded-full ${
            isDark ? 'bg-cyan-200 shadow-[0_0_10px_#a5f3fc] animate-firefly' : 'bg-emerald-300/60 animate-leaf-sway'
          }`}
          style={{ animationDelay: '1.2s', animationDuration: '4s' }}
        />
        <div
          className={`absolute bottom-24 left-1/3 w-3 h-3 rounded-full ${
            isDark ? 'bg-amber-300 shadow-[0_0_14px_#fde047] animate-firefly' : 'bg-yellow-200/70 animate-ghibli-float'
          }`}
          style={{ animationDelay: '2s', animationDuration: '5s' }}
        />
        <div
          className={`absolute top-2/3 right-1/3 w-2 h-2 rounded-full ${
            isDark ? 'bg-emerald-300 shadow-[0_0_10px_#86efac] animate-firefly' : 'bg-green-300/50 animate-leaf-sway'
          }`}
          style={{ animationDelay: '0.8s', animationDuration: '3.2s' }}
        />
      </div>

      {/* 1. Desktop Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <AppHeader />

        {/* Dynamic Screen View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {activeScreen === 'home' && <HomeScreen />}
          {activeScreen === 'braindump' && <BrainDumpScreen />}
          {activeScreen === 'plan' && <WeekPlanScreen />}
          {activeScreen === 'tasks' && <TasksScreen />}
          {activeScreen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav />

      {/* 4. Global Modals */}
      <TaskDetailModal />
      <QuickAddTaskModal />
      <ExhaustionModal />
      <FocusTimerModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
