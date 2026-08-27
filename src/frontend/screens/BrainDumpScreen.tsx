'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PenLine,
  Mic,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  Sparkles,
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

    const rawDump = brainDumpService.createRawDump(inputText, voiceTranscript, screenshots);
    setCurrentDump(rawDump);
    addBrainDumpRecord(rawDump);
    setPhase('processing');
  };

  // Processing completed
  const handleProcessingComplete = useCallback(async () => {
    if (!currentDump) return;

    const { dump: processedDump, result } = await brainDumpService.process(
      currentDump,
      inputText,
      voiceTranscript,
      screenshots
    );

    setCurrentDump(processedDump);
    setAnalysisResult(result);
    addBrainDumpRecord(processedDump);

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

  // Accept single item
  const handleAcceptSingleItem = (item: ExtractedBrainItem) => {
    if (!currentDump || !analysisResult) return;

    acceptExtractedItem(currentDump.id, item);

    const updatedItems = analysisResult.items.map((i) =>
      i.id === item.id ? { ...i, isAccepted: true, selected: false } : i
    );

    setAnalysisResult({
      ...analysisResult,
      items: updatedItems,
    });
  };

  // Accept all selected
  const handleConfirmAddEverything = () => {
    if (!currentDump || !analysisResult) return;

    const unacceptedSelected = analysisResult.items.filter(
      (i) => i.selected && !i.isAccepted
    );

    if (unacceptedSelected.length === 0) return;

    acceptAllExtractedItems(currentDump.id, unacceptedSelected);
    setAddedItemCount(unacceptedSelected.length);
    setPhase('success');

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
      {/* 1. Catbus Express Header */}
      <section className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚌</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Catbus Brain Express
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          Dump academic chaos, screenshot slides, voice notes, and thoughts. The soot sprites &amp; forest spirits will organize them into acorns and schedule blocks!
        </p>
      </section>

      {/* 2. Draft Recovery Prompt */}
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
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-lime-500/20 text-lime-400 border border-lime-400/40 text-2xl shadow-[0_0_15px_#a3e635]">
            🍃
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Thoughts Gathered into Acorns! 🌰
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Added {addedItemCount} items to your forest sanctuary. Your schedule and tasks have sprouted.
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
              Dump More Thoughts
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveScreen('tasks')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View in Acorn Tasks
            </Button>
          </div>
        </Card>
      )}

      {/* 6. Main Multimodal Input Workspace */}
      {phase === 'input' && (
        <div className="space-y-5">
          {/* Mode Selector */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ghibli-btn ${
                  activeTab === 'text'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Text Note</span>
                {inputText.trim() && <span className="w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_6px_#bef264]" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ghibli-btn ${
                  activeTab === 'voice'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Whisper</span>
                {voiceTranscript && <span className="w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_6px_#bef264]" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('screenshot')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ghibli-btn ${
                  activeTab === 'screenshot'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Screenshots &amp; Slides</span>
                {screenshots.length > 0 && (
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded-full font-bold">
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
                className="text-xs text-red-400 hover:underline font-bold transition-colors"
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
                placeholder="Spill your academic thoughts, assignment deadlines, or rough study plans here..."
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

          {/* Attached items notice */}
          {activeTab !== 'screenshot' && screenshots.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <ImageIcon className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>{screenshots.length} screenshot image(s) ready for Vision analysis</span>
              <button
                type="button"
                onClick={() => setActiveTab('screenshot')}
                className="text-[var(--accent-primary)] hover:underline ml-auto font-bold"
              >
                Inspect
              </button>
            </div>
          )}

          {/* Empty State Prompt */}
          {!hasAnyInput && activeTab === 'text' && (
            <EmptyBrainState
              onSelectPrompt={(prompt) => {
                setInputText(prompt);
              }}
            />
          )}

          {/* Organize Button */}
          <div className="pt-3">
            <Button
              variant="leaf"
              size="lg"
              className="w-full justify-center text-base py-3.5 shadow-xl font-bold"
              onClick={handleStartOrganizing}
              disabled={!hasAnyInput}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Organize with Forest Spirits
            </Button>
          </div>
        </div>
      )}

      {/* 7. Archive History */}
      <BrainDumpHistory
        dumps={brainDumps}
        onDeleteDump={deleteBrainDump}
      />
    </div>
  );
};
