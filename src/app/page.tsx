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
import { LibraryScreen } from '@/screens/LibraryScreen';
import { IncubatorScreen } from '@/screens/IncubatorScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

// Dynamic Totoro Emote Companion & Glowing Fireflies
import { TotoroEmote } from '@/components/companion/TotoroEmote';
import { FirefliesGlow } from '@/components/ambient/FirefliesGlow';
import { MobileQuickCaptureDock } from '@/components/mobile/MobileQuickCaptureDock';

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
      {/* Intense Glowing Bioluminescent Fireflies Layer */}
      <FirefliesGlow />

      {/* 1. Desktop Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <AppHeader />

        {/* Dynamic Screen View */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-6xl w-full mx-auto pb-24 md:pb-12">
          {activeScreen === 'home' && <HomeScreen />}
          {activeScreen === 'incubator' && <IncubatorScreen />}
          {activeScreen === 'library' && <LibraryScreen />}
          {activeScreen === 'braindump' && <BrainDumpScreen />}
          {activeScreen === 'plan' && <WeekPlanScreen />}
          {activeScreen === 'tasks' && <TasksScreen />}
          {activeScreen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation & Quick-Capture Dock */}
      <BottomNav />
      <MobileQuickCaptureDock />

      {/* 4. Interactive Animated Totoro Companion */}
      <TotoroEmote />

      {/* 5. Modals & Overlays */}
      <TaskDetailModal />
      <QuickAddTaskModal />
      <ExhaustionModal />
      <FocusTimerModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
