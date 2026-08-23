'use client';

import React from 'react';
import { Check, ChevronRight, Play, Sparkles } from 'lucide-react';
import { Task } from '@/types';
import { useApp } from '@/context/AppContext';

interface TaskRowProps {
  task: Task;
  showCategory?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, showCategory = true }) => {
  const { toggleTaskComplete, setSelectedTaskDetail, startFocusSession } = useApp();

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskComplete(task.id);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startFocusSession(task);
  };

  const priorityMeta = {
    urgent: { text: 'Urgent Acorn', color: 'text-red-400', icon: '🌰' },
    high: { text: 'High Priority', color: 'text-amber-400', icon: '🍃' },
    medium: { text: 'Steady', color: 'text-emerald-400', icon: '🌱' },
    low: { text: 'Gentle', color: 'text-sky-400', icon: '⭐' },
  }[task.priority];

  const completedSubtasksCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      onClick={() => setSelectedTaskDetail(task)}
      className={`group flex items-center justify-between p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl ghibli-btn ${
        task.isCompleted
          ? 'bg-[var(--bg-surface-subtle)]/70 border-[var(--border-subtle)]/60 text-[var(--text-muted)] opacity-65'
          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] shadow-sm'
      }`}
    >
      {/* Left side: Checkbox + Title + Meta */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Whimsical Round Nature Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border-2 transition-all duration-200 ${
            task.isCompleted
              ? 'bg-gradient-to-tr from-emerald-500 to-lime-400 border-emerald-400 text-white shadow-[0_0_10px_#a3e635]'
              : 'border-[var(--border-highlight)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-soft)]'
          }`}
          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-kalam text-sm sm:text-base tracking-normal truncate font-bold ${
                task.isCompleted
                  ? 'line-through text-[var(--text-muted)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {task.title}
            </span>
          </div>

          {/* Context Line: Due time · Priority · Estimated duration · Subtasks */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-secondary)] font-kalam">
            {task.deadline && (
              <span className="flex items-center gap-1">
                <span>🗓️</span>
                <span>{task.deadline}</span>
              </span>
            )}

            {task.priority !== 'low' && (
              <>
                <span className="text-[var(--text-muted)]">·</span>
                <span className={`font-bold flex items-center gap-0.5 ${priorityMeta.color}`}>
                  <span>{priorityMeta.icon}</span>
                  <span>{priorityMeta.text}</span>
                </span>
              </>
            )}

            {task.estimatedTime && (
              <>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="font-sans text-[11px]">⏱️ {task.estimatedTime}</span>
              </>
            )}

            {totalSubtasks > 0 && (
              <>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[11px]">
                  🌿 {completedSubtasksCount}/{totalSubtasks} steps
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Category & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {showCategory && (
          <span className="hidden sm:inline-block text-xs text-[var(--text-secondary)] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
            {task.category}
          </span>
        )}

        {!task.isCompleted && (
          <button
            onClick={handlePlayClick}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-[var(--accent-primary)] hover:bg-[var(--accent-soft)] transition-all ghibli-btn"
            title="Start Totoro rain focus timer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
      </div>
    </div>
  );
};
