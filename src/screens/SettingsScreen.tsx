'use client';

import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Bell,
  Mic,
  Calendar,
  Shield,
  Brain,
  Check,
  Cloud,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { isFirebaseConfigured } from '@/lib/firebase/config';

type SettingsTab =
  | 'profile'
  | 'cloud'
  | 'appearance'
  | 'notifications'
  | 'voice'
  | 'calendar'
  | 'privacy'
  | 'memory';

export const SettingsScreen: React.FC = () => {
  const { profile, updateProfile, theme, setTheme, authUser, setAuthModalOpen, syncStatus } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [voiceFeedback, setVoiceFeedback] = useState(false);
  const [calendarSync, setCalendarSync] = useState(true);
  const [localEncryption, setLocalEncryption] = useState(true);
  const [memoryRetentionDays, setMemoryRetentionDays] = useState('30');

  const isConfigured = isFirebaseConfigured();

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'cloud', label: 'Cloud Backend', icon: <Cloud className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Sun className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice', icon: <Mic className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory', icon: <Brain className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-16 font-kalam">
      {/* 1. Header */}
      <section className="space-y-1 pt-2">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          Personal workspace and assistant preferences.
        </p>
      </section>

      {/* 2. Horizontal Minimal Nav for Settings */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
        {navItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#18221E] text-[#9ED8A3] border border-[#283630] font-medium dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                  : 'text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content */}
      <div className="space-y-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Profile Information
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Your personal identifier used in greetings and assistant context.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                  Your Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                  Workspace Description
                </label>
                <input
                  type="text"
                  value={profile.roleTitle}
                  onChange={(e) => updateProfile({ roleTitle: e.target.value })}
                  className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                  Daily Focus Limit (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.dailyFocusLimitHours}
                  onChange={(e) => updateProfile({ dailyFocusLimitHours: parseFloat(e.target.value) || 4 })}
                  className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:focus:border-[#2563EB]"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Cloud Backend Tab */}
        {activeTab === 'cloud' && (
          <Card variant="default" className="space-y-5 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    Firebase Cloud Backend
                  </h3>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    Multi-device synchronization for tasks, schedules, attachments, and brain dumps.
                  </p>
                </div>
                <div
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
                    isConfigured
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : 'bg-amber-950/80 border border-amber-800 text-amber-300'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isConfigured ? 'Connected' : 'Credentials Needed'}</span>
                </div>
              </div>
            </div>

            {/* Status & Account Card */}
            <div className="p-4 rounded-xl bg-[#111816] border border-[#1E2824] space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs uppercase tracking-wider text-[#8C9E90]">Active Cloud User</h4>
                  <p className="text-sm font-medium text-[#F3F4F1]">
                    {authUser
                      ? authUser.displayName || authUser.email || `Guest (${authUser.uid.slice(0, 8)}...)`
                      : 'Not signed in (Local Storage Mode)'}
                  </p>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  {authUser ? 'Manage Account' : 'Connect Firebase'}
                </button>
              </div>

              <div className="pt-2 border-t border-[#1E2824]/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#63756A] block text-[11px]">Database:</span>
                  <span className="text-[#8C9E90] font-medium">Cloud Firestore</span>
                </div>
                <div>
                  <span className="text-[#63756A] block text-[11px]">Sync Status:</span>
                  <span className="text-[#8C9E90] font-medium capitalize">{syncStatus}</span>
                </div>
                <div>
                  <span className="text-[#63756A] block text-[11px]">Project:</span>
                  <span className="text-[#8C9E90] font-medium truncate block">
                    {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Configured in .env.local'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step-by-step Setup Guide */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-xs text-[#F3F4F1]">Connecting your Firebase Project:</h4>
              <ol className="list-decimal list-inside space-y-1 text-[#8C9E90] pl-1">
                <li>Create a project at <span className="text-emerald-400 font-mono">console.firebase.google.com</span></li>
                <li>Add a Web App and enable <strong className="text-[#D8E2DC]">Firestore Database</strong> &amp; <strong className="text-[#D8E2DC]">Authentication</strong> (Google / Anonymous / Email).</li>
                <li>Add your credentials into <span className="text-emerald-400 font-mono">.env.local</span>:
                  <code className="block mt-1 p-2 rounded bg-[#0A0F0D] border border-[#1E2824] text-[11px] text-[#9ED8A3]">
                    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...<br />
                    NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project-id<br />
                    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-project-id.firebaseapp.com
                  </code>
                </li>
              </ol>
            </div>
          </Card>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Appearance
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Choose your preferred interface theme.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border text-left flex items-start justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-[#18221E] border-[#9ED8A3] text-[#F3F4F1] shadow-sm'
                    : 'bg-[#111816] border-[#1E2824] text-[#8C9E90] hover:text-[#F3F4F1]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-[#9ED8A3]" />
                    <span className="text-sm font-semibold">Dark Mode</span>
                  </div>
                  <p className="text-xs text-[#8C9E90]">
                    #0A0F0D &amp; Soft Sage Green (#9ED8A3)
                  </p>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-[#9ED8A3]" />}
              </button>

              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg border text-left flex items-start justify-between transition-all ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] border-[#2563EB] text-[#111827] shadow-sm'
                    : 'bg-[#111816] border-[#1E2824] text-[#8C9E90] hover:text-[#F3F4F1] dark:bg-[#111816] light:bg-[#FFFFFF]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-sm font-semibold">Light Mode</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Pure White (#FFFFFF) &amp; Primary Blue (#2563EB)
                  </p>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Notifications
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Configure quiet reminders and morning briefing alerts.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    Enable Push Notifications
                  </span>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    Receive alerts only for urgent deadlines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    notificationsEnabled
                      ? 'bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]'
                      : 'bg-[#1E2824] dark:bg-[#1E2824] light:bg-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
                <div>
                  <span className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    Morning Briefing
                  </span>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    Receive a concise breakdown of what matters today at 8:30 AM.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMorningBriefing(!morningBriefing)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    morningBriefing
                      ? 'bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]'
                      : 'bg-[#1E2824] dark:bg-[#1E2824] light:bg-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      morningBriefing ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Voice &amp; Audio
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Dictation preferences and speech responses.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    Spoken Feedback
                  </span>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    Let assistant read out focus recommendations quietly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceFeedback(!voiceFeedback)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    voiceFeedback
                      ? 'bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]'
                      : 'bg-[#1E2824] dark:bg-[#1E2824] light:bg-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      voiceFeedback ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Calendar Integration
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Synchronize lectures, labs, and deep work blocks with external calendars.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    Two-Way Calendar Sync
                  </span>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    Sync scheduled blocks with Google Calendar / Apple Calendar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarSync(!calendarSync)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    calendarSync
                      ? 'bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]'
                      : 'bg-[#1E2824] dark:bg-[#1E2824] light:bg-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      calendarSync ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Privacy &amp; Security
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Your data stays local and confidential.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    Local Storage Encryption
                  </span>
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                    All brain dumps and priorities are stored with client-side encryption.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalEncryption(!localEncryption)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    localEncryption
                      ? 'bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]'
                      : 'bg-[#1E2824] dark:bg-[#1E2824] light:bg-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      localEncryption ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Memory Tab */}
        {activeTab === 'memory' && (
          <Card variant="default" className="space-y-4 p-5">
            <div className="border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
              <h3 className="text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                Assistant Memory
              </h3>
              <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Manage context retention and personal workflow habits learned over time.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                  Context Memory Window
                </label>
                <select
                  value={memoryRetentionDays}
                  onChange={(e) => setMemoryRetentionDays(e.target.value)}
                  className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-sm font-kalam focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                >
                  <option value="7">7 Days</option>
                  <option value="30">30 Days (Recommended)</option>
                  <option value="90">90 Days</option>
                  <option value="infinite">Indefinite (Full Memory)</option>
                </select>
              </div>

              <div className="p-3 bg-[#111816] border border-[#1E2824] rounded-md text-xs text-[#8C9E90] dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#64748B]">
                Learned preferences: Morning deep work windows preferred on Thursdays. High-priority submissions handled before 5:00 PM.
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
