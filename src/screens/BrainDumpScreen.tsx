'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PenLine,
  Mic,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BrainDumpInput } from '@/components/braindump/BrainDumpInput';
import { VoiceRecorderUI } from '@/components/braindump/VoiceRecorderUI';
import { ScreenshotUploader } from '@/components/braindump/ScreenshotUploader';
import { EmptyBrainState } from '@/components/braindump/EmptyBrainState';
import { ProcessingState } from '@/components/braindump/ProcessingState';
import { AIUnderstandingPreview } from '@/components/braindump/AIUnderstandingPreview';
import { BrainDumpDraftPrompt } from '@/components/braindump/BrainDumpDraftPrompt';
import { BrainDumpHistory } from '@/components/braindump/BrainDumpHistory';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  BrainDumpInputType,
  BrainDumpAttachment,
  ExtractedBrainItem,
  BrainDumpAnalysisResult,
  BrainDump,
} from '@/types';
import { brainDumpService, BrainDumpDraftData } from '@/services/brainDumpService';

export const BrainDumpScreen: React.FC = () => {
  const {
    brainDumps,
    addBrainDumpRecord,
    acceptExtractedItem,
    acceptAllExtractedItems,
    deleteBrainDump,
    setActiveScreen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<BrainDumpInputType>('text');
  const [inputText, setInputText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [screenshots, setScreenshots] = useState<BrainDumpAttachment[]>([]);

  // Draft prompt state initialized safely
  const [activeDraft, setActiveDraft] = useState<BrainDumpDraftData | null>(() => {
    if (typeof window !== 'undefined') {
      return brainDumpService.getDraft();
    }
    return null;
  });

  // State Machine: 'input' | 'processing' | 'review' | 'success'
  const [phase, setPhase] = useState<'input' | 'processing' | 'review' | 'success'>('input');
  const [currentDump, setCurrentDump] = useState<BrainDump | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BrainDumpAnalysisResult | null>(null);
  const [addedItemCount, setAddedItemCount] = useState(0);

  // Autosave draft when input changes during 'input' phase
  const draftTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (phase !== 'input') return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

    draftTimerRef.current = setTimeout(() => {
      brainDumpService.saveDraft({
        text: inputText,
        voiceTranscript,
        attachments: screenshots,
      });
    }, 600);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [inputText, voiceTranscript, screenshots, phase]);

  const hasAnyInput =
    inputText.trim().length > 0 ||
    voiceTranscript.trim().length > 0 ||
    screenshots.length > 0;

  // Restore draft
  const handleContinueDraft = () => {
    if (!activeDraft) return;
    setInputText(activeDraft.text || '');
    setVoiceTranscript(activeDraft.voiceTranscript || '');
    setScreenshots(activeDraft.attachments || []);
    setActiveDraft(null);
  };

  // Discard draft
  const handleDiscardDraft = () => {
    brainDumpService.clearDraft();
    setActiveDraft(null);
  };

  // Start processing dump
  const handleStartOrganizing = () => {
    if (!hasAnyInput) return;

    // 1. Create and save raw Brain Dump record (never destroyed)
    const rawDump = brainDumpService.createRawDump(inputText, voiceTranscript, screenshots);
    setCurrentDump(rawDump);
    addBrainDumpRecord(rawDump);

    // 2. Set phase to processing
    setPhase('processing');
  };

  // Step 2 of processing completed
  const handleProcessingComplete = useCallback(async () => {
    if (!currentDump) return;

    // Run multi-modal / vision processor
    const { dump: processedDump, result } = await brainDumpService.process(
      currentDump,
      inputText,
      voiceTranscript,
      screenshots
    );

    setCurrentDump(processedDump);
    setAnalysisResult(result);
    addBrainDumpRecord(processedDump);

    // Clear saved draft once processed
    brainDumpService.clearDraft();
    setActiveDraft(null);

    setPhase('review');
  }, [currentDump, inputText, voiceTranscript, screenshots, addBrainDumpRecord]);

  // Review screen handlers
  const handleUpdateItem = (updated: ExtractedBrainItem) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      items: analysisResult.items.map((item) => (item.id === updated.id ? updated : item)),
    });
  };

  const handleDeleteItem = (id: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      items: analysisResult.items.filter((item) => item.id !== id),
    });
  };

  const handleToggleSelectItem = (id: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      items: analysisResult.items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    });
  };

  const handleSelectAll = (select: boolean) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      items: analysisResult.items.map((item) =>
        item.isAccepted ? item : { ...item, selected: select }
      ),
    });
  };

  // Accept single item from review
  const handleAcceptSingleItem = (item: ExtractedBrainItem) => {
    if (!currentDump || !analysisResult) return;

    acceptExtractedItem(currentDump.id, item);

    // Update item as accepted in review
    const updatedItems = analysisResult.items.map((i) =>
      i.id === item.id ? { ...i, isAccepted: true, selected: false } : i
    );

    setAnalysisResult({
      ...analysisResult,
      items: updatedItems,
    });
  };

  // Accept all / selected items
  const handleConfirmAddEverything = () => {
    if (!currentDump || !analysisResult) return;

    const unacceptedSelected = analysisResult.items.filter(
      (i) => i.selected && !i.isAccepted
    );

    if (unacceptedSelected.length === 0) return;

    acceptAllExtractedItems(currentDump.id, unacceptedSelected);
    setAddedItemCount(unacceptedSelected.length);
    setPhase('success');

    // Reset input fields
    setInputText('');
    setVoiceTranscript('');
    setScreenshots([]);
    brainDumpService.clearDraft();
  };

  const handleDiscard = () => {
    setPhase('input');
    setAnalysisResult(null);
    setCurrentDump(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-20 font-kalam">
      {/* 1. Notebook Header */}
      <section className="space-y-1.5 pt-2">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Dump everything here.
        </h1>
        <p className="text-sm sm:text-base text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] leading-relaxed">
          Tasks, ideas, reminders, screenshots, random thoughts. Don&apos;t organize anything. I&apos;ll handle that.
        </p>
      </section>

      {/* 2. Draft Recovery Prompt (when active draft exists) */}
      {activeDraft && phase === 'input' && !hasAnyInput && (
        <BrainDumpDraftPrompt
          draftSnippet={
            activeDraft.text ||
            activeDraft.voiceTranscript ||
            (activeDraft.attachments.length > 0 ? `${activeDraft.attachments.length} attachment(s)` : '')
          }
          updatedAt={activeDraft.updatedAt}
          onContinue={handleContinueDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* 3. Processing State View */}
      {phase === 'processing' && (
        <Card variant="default">
          <ProcessingState onComplete={handleProcessingComplete} />
        </Card>
      )}

      {/* 4. AI Understanding & Review View */}
      {phase === 'review' && analysisResult && (
        <AIUnderstandingPreview
          summary={analysisResult.summary}
          items={analysisResult.items}
          visionConfigured={analysisResult.visionConfigured}
          visionProviderUsed={analysisResult.visionProviderUsed}
          visionStatusMessage={analysisResult.visionStatusMessage}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onToggleSelectItem={handleToggleSelectItem}
          onSelectAll={handleSelectAll}
          onConfirmAdd={handleConfirmAddEverything}
          onAcceptSingleItem={handleAcceptSingleItem}
          onDiscard={handleDiscard}
        />
      )}

      {/* 5. Success State View */}
      {phase === 'success' && (
        <Card variant="accent" className="p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#9ED8A3]/15 text-[#9ED8A3] dark:bg-[#9ED8A3]/15 dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
              Unloaded &amp; Organized
            </h3>
            <p className="text-xs sm:text-sm text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] max-w-md mx-auto">
              Added {addedItemCount} items to your workspace. Your priorities and schedule are updated.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPhase('input');
                setInputText('');
                setVoiceTranscript('');
                setScreenshots([]);
              }}
            >
              Dump Another Thought
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveScreen('tasks')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View in Tasks
            </Button>
          </div>
        </Card>
      )}

      {/* 6. Main Multimodal Input Workspace (When in 'input' phase) */}
      {phase === 'input' && (
        <div className="space-y-5">
          {/* Input Mode Selector Bar */}
          <div className="flex items-center justify-between border-b border-[#1E2824] pb-2 dark:border-[#1E2824] light:border-[#E2E8F0]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'text'
                    ? 'bg-[#18221E] text-[#9ED8A3] border border-[#283630] font-medium dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                    : 'text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Text</span>
                {inputText.trim() && <span className="w-1.5 h-1.5 rounded-full bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'voice'
                    ? 'bg-[#18221E] text-[#9ED8A3] border border-[#283630] font-medium dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                    : 'text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice</span>
                {voiceTranscript && <span className="w-1.5 h-1.5 rounded-full bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB]" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('screenshot')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === 'screenshot'
                    ? 'bg-[#18221E] text-[#9ED8A3] border border-[#283630] font-medium dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE]'
                    : 'text-[#8C9E90] hover:text-[#F3F4F1] dark:text-[#8C9E90] light:text-[#64748B]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Screenshots &amp; Photos</span>
                {screenshots.length > 0 && (
                  <span className="text-[10px] bg-[#9ED8A3]/20 text-[#9ED8A3] px-1.5 rounded-full dark:text-[#9ED8A3] light:bg-[#2563EB]/10 light:text-[#2563EB]">
                    {screenshots.length}
                  </span>
                )}
              </button>
            </div>

            {hasAnyInput && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setVoiceTranscript('');
                  setScreenshots([]);
                  brainDumpService.clearDraft();
                }}
                className="text-xs text-[#8C9E90] hover:text-[#E07A7A] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Active Mode Surface */}
          <div className="space-y-4">
            {activeTab === 'text' && (
              <BrainDumpInput
                value={inputText}
                onChange={setInputText}
                placeholder="Type everything. Messy is completely okay."
              />
            )}

            {activeTab === 'voice' && (
              <VoiceRecorderUI
                onTranscriptReady={(transcript) => {
                  setVoiceTranscript(transcript);
                  setInputText((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
                  setActiveTab('text');
                }}
                onCancel={() => setActiveTab('text')}
              />
            )}

            {activeTab === 'screenshot' && (
              <ScreenshotUploader
                screenshots={screenshots}
                onAddScreenshot={(shot) => setScreenshots((prev) => [...prev, shot])}
                onRemoveScreenshot={(id) => setScreenshots((prev) => prev.filter((s) => s.id !== id))}
              />
            )}
          </div>

          {/* Summary of attached elements if switched to another tab */}
          {activeTab !== 'screenshot' && screenshots.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#151D1A] border border-[#1E2824] text-xs text-[#8C9E90]">
              <ImageIcon className="w-3.5 h-3.5 text-[#9ED8A3]" />
              <span>{screenshots.length} image attachment(s) included in this dump</span>
              <button
                type="button"
                onClick={() => setActiveTab('screenshot')}
                className="text-[#9ED8A3] hover:underline ml-auto"
              >
                View attachments
              </button>
            </div>
          )}

          {/* Empty State Prompt if text is empty and no attachments */}
          {!hasAnyInput && activeTab === 'text' && (
            <EmptyBrainState
              onSelectPrompt={(prompt) => {
                setInputText(prompt);
              }}
            />
          )}

          {/* Large Primary Action Button */}
          <div className="pt-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-base py-3.5 shadow-md"
              onClick={handleStartOrganizing}
              disabled={!hasAnyInput}
            >
              Organize
            </Button>
          </div>
        </div>
      )}

      {/* 7. Permanent Brain Dump History Archive */}
      <BrainDumpHistory
        dumps={brainDumps}
        onDeleteDump={deleteBrainDump}
      />
    </div>
  );
};
