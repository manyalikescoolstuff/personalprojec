'use client';

import React from 'react';
import { Check, CheckSquare, Clock, PhoneCall, Calendar } from 'lucide-react';
import { ExtractedBrainItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ReviewChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ExtractedBrainItem[];
  onConfirmAdd: () => void;
}

export const ReviewChangesModal: React.FC<ReviewChangesModalProps> = ({
  isOpen,
  onClose,
  items,
  onConfirmAdd,
}) => {
  const selectedItems = items.filter((i) => i.selected);

  const tasks = selectedItems.filter((i) => i.type === 'task');
  const deadlines = selectedItems.filter((i) => i.type === 'deadline');
  const reminders = selectedItems.filter((i) => i.type === 'reminder');
  const events = selectedItems.filter((i) => i.type === 'event');

  const handleConfirm = () => {
    onConfirmAdd();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Workspace Changes"
      subtitle={`${selectedItems.length} items will be added to your active priorities`}
      maxWidth="md"
    >
      <div className="space-y-4 font-kalam">
        <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] leading-relaxed">
          The following items have been organized and will be synced directly into your Tasks registry and Weekly Plan:
        </p>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {/* Tasks */}
          {tasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                <span>Tasks ({tasks.length})</span>
              </span>
              <div className="space-y-1">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded bg-[#111816] border border-[#1E2824] text-xs text-[#F3F4F1] flex items-center justify-between dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]"
                  >
                    <span className="truncate pr-2">{t.title}</span>
                    <span className="text-[10px] text-[#8C9E90] shrink-0 font-sans">
                      {t.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadlines */}
          {deadlines.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#E07A7A] dark:text-[#E07A7A] light:text-[#DC2626] font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Deadlines ({deadlines.length})</span>
              </span>
              <div className="space-y-1">
                {deadlines.map((d) => (
                  <div
                    key={d.id}
                    className="p-2 rounded bg-[#111816] border border-[#1E2824] text-xs text-[#F3F4F1] flex items-center justify-between dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]"
                  >
                    <span className="truncate pr-2">{d.title}</span>
                    <span className="text-[10px] text-[#E07A7A] shrink-0">
                      {d.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminders */}
          {reminders.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#D8B07A] dark:text-[#D8B07A] light:text-[#D97706] font-medium flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                <span>Reminders ({reminders.length})</span>
              </span>
              <div className="space-y-1">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-2 rounded bg-[#111816] border border-[#1E2824] text-xs text-[#F3F4F1] flex items-center justify-between dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]"
                  >
                    <span className="truncate pr-2">{r.title}</span>
                    <span className="text-[10px] text-[#D8B07A] shrink-0">
                      {r.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {events.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Calendar Events ({events.length})</span>
              </span>
              <div className="space-y-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded bg-[#111816] border border-[#1E2824] text-xs text-[#F3F4F1] flex items-center justify-between dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]"
                  >
                    <span className="truncate pr-2">{ev.title}</span>
                    <span className="text-[10px] text-[#8C9E90] shrink-0">
                      {ev.timeSlot || ev.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
          <Button variant="subtle" size="sm" onClick={onClose}>
            Back to Edit
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Confirm &amp; Add Everything
          </Button>
        </div>
      </div>
    </Modal>
  );
};
