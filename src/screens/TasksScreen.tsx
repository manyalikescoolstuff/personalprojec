'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
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
    // Search query match
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
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

    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const totalCompleted = tasks.filter((t) => t.isCompleted).length;
  const totalPending = tasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-kalam">
      {/* 1. Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
            Tasks
          </h1>
          <p className="text-sm sm:text-base text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
            {totalPending} active · {totalCompleted} completed
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setQuickAddOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Priority
        </Button>
      </section>

      {/* 2. Filter Bar & Search */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2824] pb-3 dark:border-[#1E2824] light:border-[#E2E8F0]">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { id: 'all', label: 'All Active' },
              { id: 'today', label: 'Today' },
              { id: 'urgent', label: 'Urgent & High' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as 'all' | 'today' | 'urgent' | 'completed')}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                    isActive
                      ? 'bg-[#18221E] text-[#9ED8A3] border border-[#283630] font-medium dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                      : 'text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md pl-8 pr-3 py-1.5 text-xs placeholder:text-[#55665A] focus:outline-none focus:border-[#9ED8A3] transition-colors dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:placeholder:text-[#94A3B8] light:focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#55665A] mr-1 text-[11px] uppercase tracking-wider dark:text-[#55665A] light:text-[#94A3B8]">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded text-xs capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#9ED8A3]/15 text-[#9ED8A3] border border-[#9ED8A3]/40 dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                  : 'bg-[#151D1A] text-[#8C9E90] border border-[#1E2824] hover:text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#64748B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Task List */}
      <section className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card variant="subtle" className="text-center py-12 space-y-2">
            <p className="text-sm text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              No tasks match your current filter.
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
              Reset Filters
            </Button>
          </Card>
        ) : (
          filteredTasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </section>
    </div>
  );
};
