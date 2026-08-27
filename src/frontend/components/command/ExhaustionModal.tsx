'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const ExhaustionModal: React.FC = () => {
  const { isExhaustionModalOpen, setExhaustionModalOpen, tasks, applyExhaustionPlan } = useApp();

  const candidateTasks = tasks.filter(
    (t) => !t.isCompleted && (t.priority === 'low' || t.priority === 'medium')
  ).slice(0, 3);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
    candidateTasks.map((t) => t.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    applyExhaustionPlan(selectedTaskIds);
  };

  return (
    <Modal
      isOpen={isExhaustionModalOpen}
      onClose={() => setExhaustionModalOpen(false)}
      title="Workload Easing"
      subtitle="Reduce pressure and protect focus recovery"
      maxWidth="md"
    >
      <div className="space-y-4 font-kalam">
        <div className="bg-[#111816] border border-[#1E2824] rounded-md p-3.5 text-sm text-[#F3F4F1] dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]">
          <p className="leading-relaxed">
            &ldquo;I&apos;ll ease today&apos;s load. You have{' '}
            <span className="font-semibold text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]">
              {candidateTasks.length} non-essential tasks
            </span>
            . Let&apos;s move them to Thursday so you can rest tonight.&rdquo;
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
            Tasks to postpone to Thursday:
          </label>

          {candidateTasks.length === 0 ? (
            <p className="text-xs text-[#8C9E90] italic py-2">
              No non-essential tasks remaining today. Your schedule is already light.
            </p>
          ) : (
            <div className="space-y-1.5">
              {candidateTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleSelect(task.id)}
                    className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#18221E] border-[#9ED8A3]/60 text-[#F3F4F1] dark:bg-[#18221E] dark:border-[#9ED8A3]/60 light:bg-[#EFF6FF] light:border-[#BFDBFE] light:text-[#111827]'
                        : 'bg-[#111816] border-[#1E2824] text-[#8C9E90] dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#9ED8A3] border-[#9ED8A3] text-[#0A0F0D] dark:bg-[#9ED8A3] light:bg-[#2563EB] light:border-[#2563EB] light:text-white'
                            : 'border-[#55665A]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8C9E90] font-sans">
                        {task.estimatedTime || '30m'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExhaustionModalOpen(false)}
          >
            Keep Today&apos;s Schedule
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={selectedTaskIds.length === 0}
          >
            Move {selectedTaskIds.length} Tasks to Thursday
          </Button>
        </div>
      </div>
    </Modal>
  );
};
