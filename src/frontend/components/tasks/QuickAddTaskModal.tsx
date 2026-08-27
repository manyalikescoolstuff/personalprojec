'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { TaskCategory, Priority } from '@/types';

export const QuickAddTaskModal: React.FC = () => {
  const { isQuickAddOpen, setQuickAddOpen, addTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Academics');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('30m');
  const [deadline, setDeadline] = useState('Today');
  const [priorityError, setPriorityError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!priority) {
      setPriorityError(true);
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      estimatedTime,
      deadline,
      isPriorityToday: true,
    });

    setTitle('');
    setDescription('');
    setPriority(null);
    setPriorityError(false);
    setQuickAddOpen(false);
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={() => {
        setPriorityError(false);
        setQuickAddOpen(false);
      }}
      title="Create New Priority"
      subtitle="Add a direct actionable item to your workspace"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-kalam">
        <Input
          label="Priority Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish DBMS assignment"
          required
          autoFocus
        />

        <Textarea
          label="Context / Notes (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Key problem sets, reference chapters, or links..."
          rows={2}
        />

        {/* Priority Selection Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
              Select Priority Level <span className="text-red-400">*</span>
            </label>
            {priorityError && (
              <span className="text-xs text-red-400 font-bold animate-pulse">
                Please pick a priority level below!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'urgent', label: 'Urgent', icon: '🌰', bg: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30' },
              { id: 'high', label: 'High', icon: '🍃', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' },
              { id: 'medium', label: 'Medium', icon: '🌱', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' },
              { id: 'low', label: 'Low', icon: '⭐', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30' },
            ].map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPriority(p.id as Priority);
                    setPriorityError(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ghibli-btn ${
                    isSelected
                      ? 'ring-2 ring-[var(--accent-primary)] shadow-md scale-105 ' + p.bg
                      : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-kalam focus:outline-none focus:border-[var(--accent-primary)] font-bold"
            >
              <option value="Academics">Academics</option>
              <option value="Projects">Projects</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <Input
            label="Estimated Time"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g. 45m"
          />

          <Input
            label="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g. Today"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
          <Button
            variant="subtle"
            size="sm"
            type="button"
            onClick={() => setQuickAddOpen(false)}
          >
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit">
            Add Priority
          </Button>
        </div>
      </form>
    </Modal>
  );
};
