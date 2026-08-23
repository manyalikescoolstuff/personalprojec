'use client';

import React, { useState } from 'react';
import {
  Trash2,
  ChevronRight,
  PenLine,
  Mic,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { BrainDumpItem, BrainDumpSource } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface BrainDumpHistoryProps {
  dumps: BrainDumpItem[];
  onDeleteDump: (id: string) => void;
}

export const BrainDumpHistory: React.FC<BrainDumpHistoryProps> = ({
  dumps,
  onDeleteDump,
}) => {
  const [selectedDump, setSelectedDump] = useState<BrainDumpItem | null>(null);

  const getSourceIcon = (source?: BrainDumpSource) => {
    switch (source) {
      case 'voice':
        return <Mic className="w-3 h-3 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]" />;
      case 'image':
        return <ImageIcon className="w-3 h-3 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]" />;
      case 'mixed':
        return <Layers className="w-3 h-3 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]" />;
      default:
        return <PenLine className="w-3 h-3 text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]" />;
    }
  };

  const getAcceptedCount = (dump: BrainDumpItem): number => {
    if (dump.acceptedItemIds && dump.acceptedItemIds.length > 0) {
      return dump.acceptedItemIds.length;
    }
    const items = dump.extractedItems || dump.extractedBrainItems || [];
    if (items.length > 0) {
      const accepted = items.filter((i) => i.isAccepted).length;
      if (accepted > 0) return accepted;
      if (dump.status === 'accepted' || dump.status === 'organized') return items.length;
    }
    if (dump.extractedTasks && dump.extractedTasks.length > 0) {
      return dump.extractedTasks.length;
    }
    return 0;
  };

  return (
    <section className="space-y-3 pt-6 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0] font-kalam">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] font-medium">
          Brain Dump History ({dumps.length})
        </h2>
        <span className="text-[11px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]">
          Original raw input is permanently preserved
        </span>
      </div>

      {dumps.length === 0 ? (
        <div className="p-8 text-center border border-[#1E2824] rounded-xl bg-[#111816] space-y-1.5 dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0]">
          <p className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
            Nothing dumped yet.
          </p>
          <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
            Whenever your brain gets noisy, put it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {dumps.map((dump) => {
            const acceptedCount = getAcceptedCount(dump);
            const source = dump.source || (dump.inputType as BrainDumpSource) || 'text';

            return (
              <div
                key={dump.id}
                onClick={() => setSelectedDump(dump)}
                className="group p-3.5 rounded-xl border border-[#1E2824] bg-[#111816] hover:border-[#9ED8A3]/50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:hover:border-[#2563EB]/40"
              >
                <div className="space-y-1 min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#8C9E90] capitalize">
                      {getSourceIcon(source)}
                      <span>{source}</span>
                    </span>
                    <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                    <span className="text-[10px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]">
                      {dump.createdAt || dump.timestamp}
                    </span>
                    {acceptedCount > 0 && (
                      <>
                        <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                        <span className="text-[11px] text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{acceptedCount} item{acceptedCount > 1 ? 's' : ''} accepted</span>
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] line-clamp-1 font-sans">
                    &ldquo;{dump.rawText}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDump(dump.id);
                    }}
                    className="text-[#55665A] hover:text-[#E07A7A] p-1 rounded transition-colors"
                    title="Delete record"
                    aria-label="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-[#55665A] group-hover:text-[#9ED8A3] group-hover:translate-x-0.5 transition-all dark:text-[#55665A] dark:group-hover:text-[#9ED8A3] light:text-[#94A3B8] light:group-hover:text-[#2563EB]" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Inspection Modal */}
      {selectedDump && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDump(null)}
          title="Brain Dump Archive"
          subtitle={`Recorded on ${selectedDump.createdAt || selectedDump.timestamp}`}
          maxWidth="md"
        >
          <div className="space-y-4 font-kalam">
            {/* Raw Input Preservation */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block">
                Original Raw Input
              </label>
              <div className="p-3.5 rounded-lg bg-[#111816] border border-[#1E2824] text-xs text-[#F3F4F1] whitespace-pre-wrap font-sans leading-relaxed dark:bg-[#111816] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]">
                {selectedDump.rawText}
              </div>
            </div>

            {/* Attachments if any */}
            {selectedDump.attachments && selectedDump.attachments.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block">
                  Attachments ({selectedDump.attachments.length})
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDump.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="p-2 rounded bg-[#111816] border border-[#1E2824] flex items-center gap-2 text-xs text-[#F3F4F1]"
                    >
                      <div className="w-8 h-8 rounded bg-[#151D1A] overflow-hidden flex items-center justify-center shrink-0">
                        {a.previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.previewUrl} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-[#9ED8A3]" />
                        )}
                      </div>
                      <span className="truncate text-[11px]">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processed Results */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block">
                Processed Results
              </label>
              {(() => {
                const items = selectedDump.extractedItems || selectedDump.extractedBrainItems || [];
                const tasks = selectedDump.extractedTasks || [];

                if (items.length > 0) {
                  return (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded bg-[#111816] border border-[#1E2824] text-xs flex items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="font-medium text-[#F3F4F1] truncate block">{item.title}</span>
                            <div className="flex items-center gap-2 text-[10px] text-[#8C9E90]">
                              <span>{item.category}</span>
                              {item.deadline && (
                                <>
                                  <span>·</span>
                                  <span>{item.deadline}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-[#9ED8A3] bg-[#9ED8A3]/10 px-1.5 py-0.5 rounded font-medium shrink-0">
                            Extracted
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (tasks.length > 0) {
                  return (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {tasks.map((task, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-[#111816] border border-[#1E2824] text-xs flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-[#F3F4F1] truncate">{task.title}</span>
                          <span className="text-[10px] text-[#8C9E90]">{task.category}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <p className="text-xs text-[#8C9E90]">
                    {selectedDump.extractedSummary || 'No structured items extracted.'}
                  </p>
                );
              })()}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
              <Button variant="subtle" size="sm" onClick={() => setSelectedDump(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
