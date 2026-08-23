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
      className={`flex min-h-screen font-kalam antialiased transition-colors duration-200 ${
        isDark ? 'bg-[#0A0F0D] text-[#F3F4F1]' : 'bg-[#FFFFFF] text-[#111827]'
      }`}
    >
      {/* 1. Desktop Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
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
