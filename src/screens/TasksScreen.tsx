'use client';

import React, { useState } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TaskRow } from '@/components/tasks/TaskRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TaskCategory } from '@/types';

export const TasksScreen: React.FC = () => {
  const { tasks, setQuickAddOpen } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'urgent' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories list
  const categories: ('all' | TaskCategory)[] = [
    'all',
    'Academics',
    'Projects',
    'Personal',
    'Health',
    'Admin',
  ];

  // Filtering logic
  const filteredTasks = tasks.filter((task) => {
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (activeFilter === 'today' && !task.isPriorityToday && !task.deadline?.includes('Today')) {
      return false;
    }
    if (activeFilter === 'urgent' && task.priority !== 'urgent' && task.priority !== 'high') {
      return false;
    }
    if (activeFilter === 'completed' && !task.isCompleted) {
      return false;
    }
    if (activeFilter !== 'completed' && task.isCompleted) {
      return false;
    }

    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const totalCompleted = tasks.filter((t) => t.isCompleted).length;
  const totalPending = tasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-20 font-kalam">
      {/* 1. Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌰</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Acorn Priorities
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            🌿 {totalPending} active seeds · 🌸 {totalCompleted} harvested blooms
          </p>
        </div>

        <Button
          variant="leaf"
          size="sm"
          onClick={() => setQuickAddOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="font-bold shadow-md"
        >
          Plant Priority
        </Button>
      </section>

      {/* 2. Filter Bar & Search */}
      <div className="space-y-3.5">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: 'All Active', icon: '🌱' },
              { id: 'today', label: 'Today', icon: '☀️' },
              { id: 'urgent', label: 'Urgent Acorns', icon: '🌰' },
              { id: 'completed', label: 'Harvested', icon: '🌸' },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as 'all' | 'today' | 'urgent' | 'completed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ghibli-btn ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forest seeds..."
              className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl pl-9 pr-3.5 py-1.5 text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[var(--text-muted)] mr-1 text-[11px] uppercase tracking-wider font-bold">
            Grove:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ghibli-btn ${
                selectedCategory === cat
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/50 shadow-sm'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat === 'all' ? 'All Groves' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Task List */}
      <section className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <Card variant="subtle" className="text-center py-14 rounded-3xl space-y-3">
            <span className="text-3xl">🍃</span>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              No tasks found in this grove.
            </p>
            <Button
              variant="command"
              size="sm"
              onClick={() => {
                setActiveFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              Reset Grove Filters
            </Button>
          </Card>
        ) : (
          filteredTasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </section>
    </div>
  );
};
