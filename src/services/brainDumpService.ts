import {
  BrainDump,
  BrainDumpAttachment,
  BrainDumpAnalysisResult,
  BrainDumpSource,
  ExtractedBrainItem,
  Task,
} from '@/types';
import { mockProcessor } from './mockProcessor';

const DRAFT_STORAGE_KEY = 'getdone_braindump_draft';

export interface BrainDumpDraftData {
  text: string;
  voiceTranscript: string;
  attachments: BrainDumpAttachment[];
  updatedAt: number;
}

export const brainDumpService = {
  /**
   * Save unfinished Brain Dump draft to localStorage
   */
  saveDraft(draft: { text: string; voiceTranscript: string; attachments: BrainDumpAttachment[] }): void {
    if (typeof window === 'undefined') return;

    const hasContent =
      draft.text.trim().length > 0 ||
      draft.voiceTranscript.trim().length > 0 ||
      draft.attachments.length > 0;

    if (!hasContent) {
      this.clearDraft();
      return;
    }

    try {
      const data: BrainDumpDraftData = {
        ...draft,
        updatedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore localStorage write limits or errors gracefully
    }
  },

  /**
   * Retrieve active draft from localStorage
   */
  getDraft(): BrainDumpDraftData | null {
    if (typeof window === 'undefined') return null;

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BrainDumpDraftData;
      if (!parsed || (!parsed.text && !parsed.voiceTranscript && (!parsed.attachments || parsed.attachments.length === 0))) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  /**
   * Clear active draft from localStorage
   */
  clearDraft(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  },

  /**
   * Determine whether input is text, voice, image, or mixed
   */
  determineSource(
    text: string,
    voiceTranscript: string,
    attachments: BrainDumpAttachment[]
  ): BrainDumpSource {
    const hasText = text.trim().length > 0;
    const hasVoice = voiceTranscript.trim().length > 0;
    const hasAttachments = attachments.length > 0;

    const sourceCount = (hasText ? 1 : 0) + (hasVoice ? 1 : 0) + (hasAttachments ? 1 : 0);

    if (sourceCount > 1) return 'mixed';
    if (hasAttachments) return 'image';
    if (hasVoice) return 'voice';
    return 'text';
  },

  /**
   * Create a new raw BrainDump record before processing
   */
  createRawDump(
    text: string,
    voiceTranscript: string,
    attachments: BrainDumpAttachment[]
  ): BrainDump {
    const source = this.determineSource(text, voiceTranscript, attachments);

    // Combine readable raw representation
    const textPieces: string[] = [];
    if (text.trim()) textPieces.push(text.trim());
    if (voiceTranscript.trim()) textPieces.push(`[Voice]: ${voiceTranscript.trim()}`);
    if (attachments.length > 0) {
      textPieces.push(`[Attachments]: ${attachments.map((a) => a.name).join(', ')}`);
    }

    const rawText = textPieces.join('\n\n');

    return {
      id: `dump-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      rawText,
      attachments,
      source,
      inputType: source,
      timestamp: 'Just now',
      status: 'processing',
      extractedItems: [],
      acceptedItemIds: [],
    };
  },

  /**
   * Process Brain Dump: Routes images to Vision AI Backend, and normalizes text/voice input
   */
  async process(
    dump: BrainDump,
    text: string,
    voiceTranscript: string,
    attachments: BrainDumpAttachment[]
  ): Promise<{ dump: BrainDump; result: BrainDumpAnalysisResult }> {
    const hasAttachments = attachments && attachments.length > 0;
    const combinedContextText = `${text} ${voiceTranscript}`.trim();

    // 1. If images are present, send to Vision API route
    if (hasAttachments) {
      try {
        const imagesPayload = attachments
          .filter((att) => att.previewUrl || att.extractedText)
          .map((att) => ({
            data: att.previewUrl || '',
            name: att.name,
            mimeType: 'image/png',
          }));

        if (imagesPayload.length > 0 && imagesPayload.some((img) => img.data.length > 0)) {
          const response = await fetch('/api/vision/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              images: imagesPayload,
              userContextText: combinedContextText,
            }),
          });

          if (response.ok) {
            const visionData = await response.json();

            // Check if vision is configured
            if (visionData.configured && visionData.items && visionData.items.length > 0) {
              // Also extract any purely textual side notes if user typed independent thoughts
              const textOnlyResult = combinedContextText
                ? mockProcessor.process(text, voiceTranscript, [])
                : { items: [], summary: '', counts: { tasks: 0, deadlines: 0, reminders: 0, events: 0 } };

              // Merge items (prevent direct duplicates by title)
              const existingTitles = new Set(visionData.items.map((i: ExtractedBrainItem) => i.title.toLowerCase().trim()));
              const additionalTextItems = textOnlyResult.items.filter(
                (t) => !existingTitles.has(t.title.toLowerCase().trim())
              );

              const mergedItems = [...visionData.items, ...additionalTextItems];

              const result: BrainDumpAnalysisResult = {
                summary: visionData.summary || `Extracted ${mergedItems.length} items from image and text.`,
                items: mergedItems,
                counts: {
                  tasks: mergedItems.filter((i) => i.type === 'task').length,
                  deadlines: mergedItems.filter((i) => i.type === 'deadline').length,
                  reminders: mergedItems.filter((i) => i.type === 'reminder').length,
                  events: mergedItems.filter((i) => i.type === 'event' || i.type === 'routine').length,
                },
                visionConfigured: true,
                visionProviderUsed: visionData.providerUsed,
                rawVisionSummary: visionData.summary,
              };

              const updatedDump: BrainDump = {
                ...dump,
                status: 'review',
                extractedItems: result.items,
                extractedSummary: result.summary,
              };

              return { dump: updatedDump, result };
            } else if (!visionData.configured) {
              // Vision provider not configured in environment
              // Extract text/voice if available, but do NOT fake image results
              const textResult = combinedContextText
                ? mockProcessor.process(text, voiceTranscript, [])
                : { items: [], summary: 'No text input provided.', counts: { tasks: 0, deadlines: 0, reminders: 0, events: 0 } };

              const result: BrainDumpAnalysisResult = {
                summary: combinedContextText
                  ? `Processed your text notes. (Image understanding is not configured).`
                  : `Image attached safely. (Image understanding is not configured).`,
                items: textResult.items,
                counts: textResult.counts,
                visionConfigured: false,
                visionProviderUsed: visionData.providerUsed || 'Unconfigured',
                visionStatusMessage:
                  visionData.errorMessage ||
                  "Image understanding isn't configured yet. Set GEMINI_API_KEY in .env.local to enable real screenshot AI extraction.",
              };

              const updatedDump: BrainDump = {
                ...dump,
                status: 'review',
                extractedItems: result.items,
                extractedSummary: result.summary,
              };

              return { dump: updatedDump, result };
            }
          }
        }
      } catch (err) {
        console.warn('Vision API call failed, falling back to local processor:', err);
      }
    }

    // 2. Fallback or pure text/voice input: Process with local multi-modal processor
    const result = mockProcessor.process(text, voiceTranscript, attachments);

    const updatedDump: BrainDump = {
      ...dump,
      status: 'review',
      extractedItems: result.items,
      extractedSummary: result.summary,
    };

    return {
      dump: updatedDump,
      result,
    };
  },

  /**
   * Convert an ExtractedBrainItem into a Task ready for the existing Task system
   */
  convertExtractedItemToTask(item: ExtractedBrainItem): Partial<Task> {
    return {
      title: item.title,
      description: item.notes || '',
      category: item.category,
      priority: item.priority,
      estimatedTime: item.type === 'routine' ? '45m' : item.type === 'reminder' ? '15m' : '30m',
      estimatedMinutes: item.type === 'routine' ? 45 : item.type === 'reminder' ? 15 : 30,
      deadline: item.deadline || 'Today',
      scheduledDay: item.day || 'Wed',
      isCompleted: false,
      isPriorityToday: true,
      subtasks: [],
      tags: [item.category, item.type],
      notes: item.notes || '',
    };
  },
};
