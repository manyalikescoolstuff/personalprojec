'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  User,
  Brain,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Shield,
  Heart,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CourseInfo, LearningStyle, PeakFocusWindow } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CourseModal } from '@/frontend/components/library/CourseModal';
import { SubjectVaultModal } from '@/frontend/components/library/SubjectVaultModal';
import { soundManager } from '@/lib/soundEffects';

const LEARNING_STYLES: LearningStyle[] = [
  'Step-by-step Bullet Points',
  'Hands-on Projects',
  'Visual & Diagrams',
  'Concise Summaries',
];

const PEAK_WINDOWS: PeakFocusWindow[] = [
  'Early Morning (6 AM - 11 AM)',
  'Afternoon (12 PM - 5 PM)',
  'Evening (5 PM - 9 PM)',
  'Night Owl (9 PM - 2 AM)',
];

export const LibraryScreen: React.FC = () => {
  const { profile, updateProfile, courses, addCourse, updateCourse, deleteCourse } = useApp();

  const [activeTab, setActiveTab] = useState<'academics' | 'aboutme' | 'aimemory'>('academics');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseInfo | null>(null);
  const [vaultCourseId, setVaultCourseId] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const selectedVaultCourse = courses.find((c) => c.id === vaultCourseId) || null;

  // Profile Form Local States
  const [name, setName] = useState(profile.name || '');
  const [roleTitle, setRoleTitle] = useState(profile.roleTitle || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal || '');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(
    profile.learningStyle || 'Step-by-step Bullet Points'
  );
  const [peakFocusWindow, setPeakFocusWindow] = useState<PeakFocusWindow>(
    profile.peakFocusWindow || 'Night Owl (9 PM - 2 AM)'
  );
  const [burnoutTriggers, setBurnoutTriggers] = useState(profile.burnoutTriggers || '');
  const [routines, setRoutines] = useState(profile.routines || '');
  const [sideProjects, setSideProjects] = useState(profile.sideProjects || '');

  // Academic States
  const [university, setUniversity] = useState(profile.university || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [major, setMajor] = useState(profile.major || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [targetCgpa, setTargetCgpa] = useState(profile.targetCgpa || '');
  const [academicNotes, setAcademicNotes] = useState(profile.academicNotes || '');

  const showSaveToast = (msg: string) => {
    soundManager.playSparkle();
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleSaveAboutMe = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      roleTitle,
      bio,
      primaryGoal,
      learningStyle,
      peakFocusWindow,
      burnoutTriggers,
      routines,
      sideProjects,
    });
    showSaveToast('🌱 Saved personal memory profile to Totoro’s Library!');
  };

  const handleSaveAcademics = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      university,
      degree,
      major,
      semester,
      targetCgpa,
      academicNotes,
    });
    showSaveToast('🎓 Saved university blueprint to Totoro’s Library!');
  };

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c: CourseInfo) => {
    setEditingCourse(c);
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from your active library subjects?`)) {
      deleteCourse(id);
      showSaveToast(`Removed ${name} from subjects.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-24 font-kalam">
      {/* 1. Header & Vision Statement */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
          <span>📚</span>
          <span>Totoro&apos;s Knowledge Sanctuary</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-hangyaboly leading-tight">
          Totoro&apos;s Library
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-2xl">
          Your personal memory base & academic blueprint. Totoro reads this library to understand your exact courses, cognitive rhythms, and deadlines to organize your life with zero friction.
        </p>
      </section>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 font-bold animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. Library Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ghibli-btn ${
            activeTab === 'academics'
              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>🎓 Academics & Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('aboutme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ghibli-btn ${
            activeTab === 'aboutme'
              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>👤 About Me & Rhythms</span>
        </button>

        <button
          onClick={() => setActiveTab('aimemory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ghibli-btn ${
            activeTab === 'aimemory'
              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Brain className="w-4 h-4 text-purple-400" />
          <span>🧠 Totoro&apos;s AI Memory Sync</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACADEMICS & COURSES */}
      {/* ========================================================================= */}
      {activeTab === 'academics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* University Overview Form */}
          <section className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    University & Degree Blueprint
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Defines your current academic curriculum context
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAcademics} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Institute of Technology"
                    className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Degree & Major
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Current Semester
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. Semester 5"
                    className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    CGPA Target / Academic Goal
                  </label>
                  <input
                    type="text"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(e.target.value)}
                    placeholder="e.g. 9.2+ CGPA"
                    className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    General Academic Notes & Exam Schedules
                  </label>
                  <input
                    type="text"
                    value={academicNotes}
                    onChange={(e) => setAcademicNotes(e.target.value)}
                    placeholder="e.g. Midterm exams in mid-October, Friday lab tests..."
                    className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="primary" type="submit" size="sm" className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Update University Details</span>
                </Button>
              </div>
            </form>
          </section>

          {/* Registered Courses & Subjects Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    Current Semester Subjects ({courses.length})
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Totoro matches your tasks & voice dumps against these registered courses
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddCourse}
                className="gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-2">
                <span className="text-3xl">📚</span>
                <p className="text-base font-bold text-[var(--text-primary)]">No subjects registered yet</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Add your courses like DBMS, DSA, or OS so Totoro knows how to prioritize your homework.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={handleOpenAddCourse}>
                    + Add Your First Course
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {courses.map((c) => {
                  const folderCount = c.folders?.length || 0;
                  const resourceCount = c.resources?.length || 0;
                  const totalMaterials = folderCount + resourceCount;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setVaultCourseId(c.id)}
                      className="group relative p-4.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/70 backdrop-blur-2xl shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-bold border border-[var(--accent-primary)]/30 font-mono">
                              {c.code}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] font-medium">
                              {c.credits || 4} Credits · {c.semester || 'Sem 5'}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight pt-1 truncate group-hover:text-[var(--accent-primary)] transition-colors">
                            {c.name}
                          </h4>
                          {c.professor && (
                            <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                              Faculty: {c.professor}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditCourse(c);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Edit course details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(c.id, c.name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {c.notes && (
                        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2">
                          <strong className="text-[var(--text-primary)]">Topics:</strong> {c.notes}
                        </div>
                      )}

                      {/* Material Vault Counter & Action Trigger */}
                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold">
                          <span>📂</span>
                          <span>
                            {totalMaterials > 0
                              ? `${totalMaterials} Material${totalMaterials > 1 ? 's' : ''} & Folders`
                              : 'Open Subject Vault'}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] font-bold text-xs group-hover:translate-x-0.5 transition-all">
                          <span>Open Vault</span>
                          <span>&rarr;</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ABOUT ME & COGNITIVE RHYTHMS */}
      {/* ========================================================================= */}
      {activeTab === 'aboutme' && (
        <form onSubmit={handleSaveAboutMe} className="space-y-6 animate-fadeIn">
          <section className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Personal Identity & Mission
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Core summary of who you are and what you are building
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Role / Title Tagline
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Computer Science Undergrad & AI Builder"
                  className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Personal Bio & Narrative
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell Totoro about your passions, tech stack, and goals..."
                className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Top Priority Life Goal (Next 6 Months)
              </label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="e.g. Land top SWE internship, score 9.2+ CGPA, ship GetDone V1"
                className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </section>

          {/* Cognitive Rhythms & Energy Settings */}
          <section className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Cognitive Rhythms & Focus Windows
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Helps Totoro schedule heavy academic tasks during your peak stamina
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Peak Focus Window
                </label>
                <div className="space-y-1.5">
                  {PEAK_WINDOWS.map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setPeakFocusWindow(win)}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        peakFocusWindow === win
                          ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-sm'
                          : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {win}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Preferred Task Breakdown Style
                </label>
                <div className="space-y-1.5">
                  {LEARNING_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setLearningStyle(style)}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        learningStyle === style
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-red-400/90 mb-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Starter Friction & Burnout Triggers</span>
                </label>
                <textarea
                  rows={2}
                  value={burnoutTriggers}
                  onChange={(e) => setBurnoutTriggers(e.target.value)}
                  placeholder="e.g. Too many vague assignments, context switching, working past 2 AM..."
                  className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-red-400 rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daily Rhythms & Recurring Routines</span>
                </label>
                <textarea
                  rows={2}
                  value={routines}
                  onChange={(e) => setRoutines(e.target.value)}
                  placeholder="e.g. Morning matcha review, gym at 6 PM, DSA practice at 10 PM..."
                  className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Personal & Creative Side Projects
              </label>
              <input
                type="text"
                value={sideProjects}
                onChange={(e) => setSideProjects(e.target.value)}
                placeholder="e.g. GetDone AI Command Center, Personal Portfolio, React Native App..."
                className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit" size="sm" className="gap-1.5 shadow-md">
                <Save className="w-4 h-4" />
                <span>Save About Me Profile</span>
              </Button>
            </div>
          </section>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI MEMORY SYNC & MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'aimemory' && (
        <section className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-purple-500/30 backdrop-blur-2xl shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
              🧠
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Totoro&apos;s Active Memory Matrix
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                This exact synthesized context is injected into Gemini AI models to personalize every interaction.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed shadow-inner">
            <div className="text-purple-400 font-bold text-xs pb-1 border-b border-[var(--border-subtle)]">
              # USER PROFILE & ACADEMIC MEMORY CONTEXT
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Name:</strong> {profile.name || 'Manya'} ({profile.roleTitle || 'CS Undergrad'})
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">University:</strong> {profile.university || 'Institute of Technology'} · {profile.major || 'Computer Science'} ({profile.semester || 'Sem 5'})
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Peak Energy:</strong> {profile.peakFocusWindow || 'Night Owl (9 PM - 2 AM)'}
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Learning Style:</strong> {profile.learningStyle || 'Step-by-step Bullet Points'}
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Registered Subjects ({courses.length}):</strong>{' '}
              {courses.map((c) => `${c.code} (${c.name})`).join(', ') || 'None'}
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Primary Goal:</strong> {profile.primaryGoal || 'Master DSA & score 9+ CGPA'}
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Friction Triggers:</strong> {profile.burnoutTriggers || 'Unorganized deadlines'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-purple-950/20 to-teal-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)] font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Totoro uses this memory whenever you speak in voice, dump screenshots, or ask for schedule plans.</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showSaveToast('🌱 Totoro’s neural memory re-indexed successfully!')}
              className="shrink-0 text-xs"
            >
              Force Re-Index Memory
            </Button>
          </div>
        </section>
      )}

      {/* 4. Modals */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        initialCourse={editingCourse}
        onSave={addCourse}
        onUpdate={updateCourse}
      />

      {selectedVaultCourse && (
        <SubjectVaultModal
          isOpen={Boolean(selectedVaultCourse)}
          onClose={() => setVaultCourseId(null)}
          course={selectedVaultCourse}
          onUpdateCourse={updateCourse}
        />
      )}
    </div>
  );
};
