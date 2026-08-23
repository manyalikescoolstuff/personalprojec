'use client';

import React from 'react';
import { Check, ChevronRight, Play } from 'lucide-react';
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

  const priorityColor = {
    urgent: 'text-[#E07A7A] dark:text-[#E07A7A] light:text-[#DC2626]',
    high: 'text-[#D8B07A] dark:text-[#D8B07A] light:text-[#D97706]',
    medium: 'text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]',
    low: 'text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]',
  }[task.priority];

  const completedSubtasksCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      onClick={() => setSelectedTaskDetail(task)}
      className={`group flex items-center justify-between p-3 sm:px-4 sm:py-3 rounded-lg border transition-all duration-150 cursor-pointer ${
        task.isCompleted
          ? 'bg-[#111816]/50 border-[#1A231F] text-[#55665A] opacity-60 dark:bg-[#111816]/50 dark:border-[#1A231F] light:bg-[#F8FAFC] light:border-[#E2E8F0]'
          : 'bg-[#151D1A] border-[#1E2824] hover:border-[#9ED8A3]/50 hover:bg-[#18221E] text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#1E2824] dark:hover:border-[#9ED8A3]/50 light:bg-[#FFFFFF] light:border-[#E2E8F0] light:hover:border-[#2563EB]/40 light:hover:bg-[#F8FAFC] light:text-[#111827]'
      }`}
    >
      {/* Left side: Checkbox + Title + Meta */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Minimal Square Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-4 h-4 rounded-sm shrink-0 flex items-center justify-center border transition-colors ${
            task.isCompleted
              ? 'bg-[#9ED8A3] border-[#9ED8A3] text-[#0A0F0D] dark:bg-[#9ED8A3] dark:border-[#9ED8A3] dark:text-[#0A0F0D] light:bg-[#2563EB] light:border-[#2563EB] light:text-white'
              : 'border-[#283630] hover:border-[#9ED8A3] dark:border-[#283630] light:border-[#CBD5E1] light:hover:border-[#2563EB]'
          }`}
          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-kalam text-sm sm:text-base tracking-normal truncate ${
                task.isCompleted
                  ? 'line-through text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]'
                  : 'font-normal text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]'
              }`}
            >
              {task.title}
            </span>
          </div>

          {/* Context Line: Due time · Priority · Estimated duration · Subtasks */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] font-kalam">
            {task.deadline && (
              <span>{task.deadline}</span>
            )}

            {task.priority !== 'low' && (
              <>
                <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                <span className={priorityColor}>
                  {task.priority === 'urgent' ? 'High Priority' : task.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                </span>
              </>
            )}

            {task.estimatedTime && (
              <>
                <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                <span className="font-sans text-[11px]">{task.estimatedTime}</span>
              </>
            )}

            {totalSubtasks > 0 && (
              <>
                <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                <span className="text-[11px]">
                  {completedSubtasksCount}/{totalSubtasks} steps
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Category & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {showCategory && (
          <span className="hidden sm:inline-block text-[11px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] font-kalam px-1.5 py-0.5 rounded">
            {task.category}
          </span>
        )}

        {!task.isCompleted && (
          <button
            onClick={handlePlayClick}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-[#9ED8A3] hover:bg-[#18221E] transition-all dark:text-[#9ED8A3] dark:hover:bg-[#18221E] light:text-[#2563EB] light:hover:bg-[#EFF6FF]"
            title="Start focus timer for this task"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        <ChevronRight className="w-4 h-4 text-[#3D4A3E] group-hover:text-[#9ED8A3] transition-colors dark:text-[#3D4A3E] dark:group-hover:text-[#9ED8A3] light:text-[#CBD5E1] light:group-hover:text-[#2563EB]" />
      </div>
    </div>
  );
};
