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
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedTime, setEstimatedTime] = useState('30m');
  const [deadline, setDeadline] = useState('Today');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
    setQuickAddOpen(false);
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={() => setQuickAddOpen(false)}
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

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-xs font-kalam focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
            >
              <option value="Academics">Academics</option>
              <option value="Projects">Projects</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded-md px-3 py-2 text-xs font-kalam focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Estimated Time"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g. 45m, 1h 30m"
          />

          <Input
            label="Deadline / Target"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g. Today · 5:00 PM"
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
