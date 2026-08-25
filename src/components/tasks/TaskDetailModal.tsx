'use client';

import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Play,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskDetail,
    setSelectedTaskDetail,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    generateSubtasksWithAI,
    deleteTask,
    startFocusSession,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!selectedTaskDetail) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(selectedTaskDetail.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  const handleAiBreakdown = () => {
    generateSubtasksWithAI(selectedTaskDetail.id);
  };

  const handleStartFocus = () => {
    startFocusSession(selectedTaskDetail);
    setSelectedTaskDetail(null);
  };

  return (
    <Modal
      isOpen={!!selectedTaskDetail}
      onClose={() => setSelectedTaskDetail(null)}
      title="Priority Details"
      subtitle={`Category: ${selectedTaskDetail.category} · Priority: ${selectedTaskDetail.priority}`}
      maxWidth="lg"
    >
      <div className="space-y-5 font-kalam">
        {/* Title and Category */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h3 className="text-lg sm:text-xl font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
              {selectedTaskDetail.title}
            </h3>
            {selectedTaskDetail.description && (
              <p className="text-sm text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] leading-relaxed font-sans">
                {selectedTaskDetail.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CategoryBadge category={selectedTaskDetail.category} />
            <PriorityBadge priority={selectedTaskDetail.priority} />
          </div>
        </div>

        {/* Metadata summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#111816] border border-[#1E2824] rounded-md text-xs dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0]">
          <div>
            <span className="text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] block uppercase tracking-wider text-[10px]">
              Deadline
            </span>
            <span className="text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] font-medium">
              {selectedTaskDetail.deadline || 'No hard deadline'}
            </span>
          </div>

          <div>
            <span className="text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] block uppercase tracking-wider text-[10px]">
              Estimated Duration
            </span>
            <span className="text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] font-medium font-sans">
              {selectedTaskDetail.estimatedTime || '30m'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] block uppercase tracking-wider text-[10px]">
              Status
            </span>
            <span
              className={`font-medium ${
                selectedTaskDetail.isCompleted
                  ? 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]'
                  : 'text-[#D8B07A] dark:text-[#D8B07A] light:text-[#D97706]'
              }`}
            >
              {selectedTaskDetail.isCompleted ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>

        {/* Actionable Subtasks Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              Action Steps ({selectedTaskDetail.subtasks.filter((s) => s.isCompleted).length}/
              {selectedTaskDetail.subtasks.length})
            </label>

            <button
              type="button"
              onClick={handleAiBreakdown}
              className="inline-flex items-center gap-1.5 text-xs text-[#9ED8A3] hover:text-[#B2E2B6] font-kalam transition-colors dark:text-[#9ED8A3] light:text-[#2563EB] light:hover:text-[#1D4ED8]"
            >
              <span>Break into steps</span>
            </button>
          </div>

          {/* Subtask list */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {selectedTaskDetail.subtasks.length === 0 ? (
              <p className="text-xs text-[#55665A] italic py-2">
                No steps yet. Click &quot;Break into steps&quot; to decompose automatically.
              </p>
            ) : (
              selectedTaskDetail.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  onClick={() => toggleSubtask(selectedTaskDetail.id, subtask.id)}
                  className="flex items-center gap-2.5 p-2 rounded bg-[#111816] border border-[#1E2824] hover:border-[#283630] cursor-pointer transition-colors dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0]"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-colors ${
                      subtask.isCompleted
                        ? 'bg-[#9ED8A3] border-[#9ED8A3] text-[#0A0F0D] dark:bg-[#9ED8A3] light:bg-[#2563EB] light:border-[#2563EB] light:text-white'
                        : 'border-[#283630] dark:border-[#283630] light:border-[#CBD5E1]'
                    }`}
                  >
                    {subtask.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs flex-1 ${
                      subtask.isCompleted
                        ? 'line-through text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]'
                        : 'text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick add subtask form */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add next step..."
              className="flex-1 bg-[#111816] text-[#F3F4F1] border border-[#1E2824] rounded px-3 py-1.5 text-xs font-kalam placeholder:text-[#55665A] focus:outline-none focus:border-[#9ED8A3] dark:bg-[#111816] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0] light:focus:border-[#2563EB]"
            />
            <Button variant="secondary" size="sm" type="submit">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Notes */}
        {selectedTaskDetail.notes && (
          <div className="space-y-1 pt-1">
            <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              Notes &amp; Context
            </label>
            <p className="text-xs text-[#F3F4F1] bg-[#111816] border border-[#1E2824] rounded p-2.5 font-sans leading-relaxed dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]">
              {selectedTaskDetail.notes}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              deleteTask(selectedTaskDetail.id);
              setSelectedTaskDetail(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors p-2 rounded-xl hover:bg-red-500/10 ghibli-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="command"
              size="sm"
              onClick={handleStartFocus}
              icon={<Play className="w-3.5 h-3.5" />}
              className="ghibli-btn"
            >
              Start Focus Session
            </Button>

            <Button
              variant={selectedTaskDetail.isCompleted ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                toggleTaskComplete(selectedTaskDetail.id);
              }}
              icon={<Check className="w-3.5 h-3.5" />}
              className="ghibli-btn"
            >
              {selectedTaskDetail.isCompleted ? 'Mark Active' : 'Complete Task'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
