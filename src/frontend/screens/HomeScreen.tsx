'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Clock,
  ChevronRight,
  Sparkles,
  Sprout,
  PenLine,
  Mic,
  Image as ImageIcon,
  Send,
  Plus,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TaskRow } from '@/components/tasks/TaskRow';
import { AIResponseCard } from '@/components/command/AIResponseCard';
import { OneNextActionCard } from '@/components/command/OneNextActionCard';
import { Priority, Task, BrainDumpAttachment } from '@/types';
import { brainDumpService } from '@/services/brainDumpService';
import { soundManager } from '@/lib/soundEffects';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    tasks,
    setActiveScreen,
    setSelectedTaskDetail,
    addBrainDumpRecord,
    acceptAllExtractedItems,
    setQuickAddOpen,
  } = useApp();

  const [quickDumpText, setQuickDumpText] = useState('');
  const [isDumping, setIsDumping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [inPlaceScreenshots, setInPlaceScreenshots] = useState<BrainDumpAttachment[]>([]);
  const [inPlaceSuccessMsg, setInPlaceSuccessMsg] = useState<string | null>(null);

  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecRef = useRef<any>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isVoiceActiveRef = useRef(false);

  isVoiceActiveRef.current = isVoiceActive;

  // In-place Voice Dictation Toggle (Dual Engine: Web Speech API + Gemini AI Audio Transcribe)
  const toggleInPlaceVoice = async () => {
    if (isVoiceActive) {
      // 1. Stop SpeechRecognition
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {}
      }

      // 2. Stop MediaRecorder and transcribe if text is empty
      if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
        mediaRecRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      setIsVoiceActive(false);

      // Check if we need Gemini AI audio fallback
      setTimeout(async () => {
        if (!quickDumpText.trim() && audioChunksRef.current.length > 0) {
          setIsTranscribingAudio(true);
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              try {
                const res = await fetch('/api/voice/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    audioData: base64Data,
                    mimeType: audioBlob.type,
                  }),
                });
                if (res.ok) {
                  const json = await res.json();
                  if (json.transcript) {
                    setQuickDumpText(json.transcript);
                  }
                }
              } catch {}
              setIsTranscribingAudio(false);
            };
          } catch {
            setIsTranscribingAudio(false);
          }
        }
      }, 300);
    } else {
      audioChunksRef.current = [];
      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Setup MediaRecorder in parallel
        try {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';
          const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecRef.current = mr;
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          mr.start(250);
        } catch (e) {
          console.warn('MediaRecorder error:', e);
        }

        // Setup SpeechRecognition
        const SpeechRecognitionClass =
          (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

        if (SpeechRecognitionClass) {
          try {
            const recognition = new SpeechRecognitionClass();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-IN'; // Indian English and Hinglish

            let currentBase = quickDumpText ? quickDumpText.trim() + ' ' : '';

            recognition.onresult = (event: any) => {
              let sessionText = '';
              for (let i = 0; i < event.results.length; i++) {
                sessionText += event.results[i][0].transcript + ' ';
              }
              const combined = (currentBase + sessionText).trim();
              if (combined) {
                setQuickDumpText(combined);
              }
            };

            recognition.onerror = (e: any) => {
              if (e.error !== 'no-speech') {
                console.warn('SpeechRecognition error:', e);
              }
            };

            recognition.onend = () => {
              // Smooth restart if user hasn't clicked stop
              if (isVoiceActiveRef.current && speechRecRef.current) {
                try {
                  speechRecRef.current.start();
                } catch {}
              }
            };

            speechRecRef.current = recognition;
            recognition.start();
          } catch (e) {
            console.warn('SpeechRecognition start:', e);
          }
        }

        setIsVoiceActive(true);
      } catch (err) {
        alert('Please allow microphone permissions in your browser to dictate in voice.');
        setIsVoiceActive(false);
      }
    }
  };

  // In-place Screenshot Handling
  const handleScreenshotFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: BrainDumpAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          previewUrl: reader.result as string,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          type: 'custom',
          timestamp: 'Just now',
        };
        setInPlaceScreenshots((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const removeInPlaceScreenshot = (id: string) => {
    setInPlaceScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  // Instant In-Place Quick Dump Action (No page switching!)
  const handleQuickDumpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasInput = quickDumpText.trim().length > 0 || inPlaceScreenshots.length > 0;
    if (!hasInput || isDumping) return;

    if (isVoiceActive && speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
      setIsVoiceActive(false);
    }

    setIsDumping(true);
    setInPlaceSuccessMsg(null);
    soundManager.playSparkle();

    try {
      // 1. Create raw dump in place
      const rawDump = brainDumpService.createRawDump(quickDumpText.trim(), '', inPlaceScreenshots);
      addBrainDumpRecord(rawDump);

      // 2. Process with Gemini AI Brain in place
      const { dump: processed, result } = await brainDumpService.process(
        rawDump,
        quickDumpText.trim(),
        '',
        inPlaceScreenshots
      );
      addBrainDumpRecord(processed);

      // 3. Auto-accept all extracted tasks directly into active priorities
      if (result.items && result.items.length > 0) {
        acceptAllExtractedItems(processed.id, result.items);
        setInPlaceSuccessMsg(`🌱 Added ${result.items.length} prioritized tasks to your sanctuary!`);
      } else {
        setInPlaceSuccessMsg(`🌱 Thoughts organized successfully!`);
      }

      setQuickDumpText('');
      setInPlaceScreenshots([]);

      setTimeout(() => {
        setInPlaceSuccessMsg(null);
      }, 5000);
    } catch {
      setInPlaceSuccessMsg('Processed and added to priorities.');
    } finally {
      setIsDumping(false);
    }
  };

  const [timeOfDay, setTimeOfDay] = useState({
    greeting: 'Good day',
    quote: 'Totoro is watching over your forest sanctuary. 🌱',
  });
  const [todayFormatted, setTodayFormatted] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay({
        greeting: 'Good morning',
        quote: 'The forest glade is waking up. Dump your thoughts or plant your focus seeds! 🌱',
      });
    } else if (hour < 17) {
      setTimeOfDay({
        greeting: 'Good afternoon',
        quote: 'Totoro is holding his leafy umbrella. Keep up your steady focus pace! 🍃',
      });
    } else {
      setTimeOfDay({
        greeting: 'Peaceful evening',
        quote: 'The stars are shining over the giant camphor tree. Harvest your remaining tasks. ✨',
      });
    }

    setTodayFormatted(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  // Strict Priority Sorting: Urgent (0) -> High (1) -> Medium (2) -> Low (3)
  const priorityWeight: Record<Priority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Uncompleted tasks first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // 2. Strict priority order
    const pDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
    if (pDiff !== 0) return pDiff;
    // 3. Today focus priority
    if (a.isPriorityToday !== b.isPriorityToday) {
      return a.isPriorityToday ? -1 : 1;
    }
    return 0;
  });

  const activeTasks = sortedTasks.filter((t) => !t.isCompleted);
  const completedCount = sortedTasks.filter((t) => t.isCompleted).length;
  const progressPercent =
    sortedTasks.length > 0 ? Math.round((completedCount / sortedTasks.length) * 100) : 0;



  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 font-kalam">
      {/* 1. Large Hero Greeting + Date & Day Directly Below */}
      <section className="space-y-2 pt-2">
        <h1
          suppressHydrationWarning
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] font-hangyaboly leading-none"
        >
          {timeOfDay.greeting}, {profile.name}!
        </h1>

        {/* Date and Day positioned directly under the greeting */}
        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-[var(--text-secondary)] font-medium">
          <span suppressHydrationWarning className="flex items-center gap-1.5">
            <span>🗓️</span>
            <span>{todayFormatted}</span>
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--accent-primary)] font-bold">
            {timeOfDay.quote}
          </span>
        </div>
      </section>

      {/* 2. Principle 3: "One Next Action" Dynamic Command Hero */}
      <OneNextActionCard />

      {/* 3. Forest Bloom Progress Gauge */}
      <section className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-2">
          <span className="flex items-center gap-2 text-[var(--text-primary)]">
            <Sprout className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Forest Sanctuary Bloom: {completedCount} of {sortedTasks.length} tasks harvested</span>
          </span>
          <span className="text-[var(--accent-primary)] font-bold">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#86efac]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 4. Immediate Workload Dump Box (Where the user unloads their mental burden first) */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-highlight)]/70 backdrop-blur-2xl shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚌</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight">
                Dump Your Workload First
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Messy is totally fine. Soot sprites will organize your thoughts into prioritized acorns!
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('braindump')}
            className="hidden sm:flex items-center gap-1 text-xs text-[var(--accent-primary)] font-bold hover:underline ghibli-btn"
          >
            <span>Full Catbus Express</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Dump Input Form (In-Place Dictation, Screenshot & Organizing) */}
        <form onSubmit={handleQuickDumpSubmit} className="space-y-3">
          {/* Hidden File Input for in-place screenshots */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleScreenshotFiles}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="relative">
            <textarea
              value={quickDumpText}
              onChange={(e) => setQuickDumpText(e.target.value)}
              placeholder={
                isTranscribingAudio
                  ? 'Totoro is transcribing your voice with Gemini AI...'
                  : isVoiceActive
                  ? 'Listening live... speak your thoughts in English or Hinglish!'
                  : 'Dump assignments, exam deadlines, lecture notes, or thoughts in English or Hinglish...'
              }
              rows={isVoiceActive || inPlaceScreenshots.length > 0 ? 3 : 2}
              className={`w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border rounded-2xl p-3.5 text-xs sm:text-sm placeholder:text-[var(--text-muted)] focus:outline-none transition-all shadow-inner resize-none font-kalam ${
                isVoiceActive
                  ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'border-[var(--border-subtle)] focus:border-[var(--accent-primary)]'
              }`}
            />

            {/* Active Voice Listening Pill */}
            {isVoiceActive && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Listening (Hinglish/English)...</span>
              </div>
            )}

            {/* AI Transcribing Pill */}
            {isTranscribingAudio && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                <span>Transcribing Voice...</span>
              </div>
            )}
          </div>

          {/* Attached Screenshot Previews In-Place */}
          {inPlaceScreenshots.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {inPlaceScreenshots.map((shot) => (
                <div
                  key={shot.id}
                  className="relative group w-16 h-16 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm"
                >
                  <img src={shot.previewUrl} alt={shot.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeInPlaceScreenshot(shot.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* In-Place Success Toast */}
          {inPlaceSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{inPlaceSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              {/* In-Place Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleInPlaceVoice}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ghibli-btn ${
                  isVoiceActive
                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-red-400/40'
                }`}
                title="Tap to speak in English or Hinglish"
              >
                <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-white animate-bounce' : 'text-red-400'}`} />
                <span>{isVoiceActive ? 'Stop Mic' : 'Voice'}</span>
              </button>

              {/* In-Place Screenshot Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-400/40 flex items-center gap-1.5 ghibli-btn text-xs font-bold"
                title="Attach photo or screenshot"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Screenshot {inPlaceScreenshots.length > 0 ? `(${inPlaceScreenshots.length})` : ''}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={(!quickDumpText.trim() && inPlaceScreenshots.length === 0) || isDumping}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed ghibli-btn"
            >
              {isDumping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Totoro is Organizing...</span>
                </>
              ) : (
                <>
                  <span>Organize into Priorities</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 5. Sequenced Priorities: Strictly Ordered (Urgent 🌰 -> High 🍃 -> Medium 🌱 -> Low ⭐) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌰</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Sequenced Priorities
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Ranked strictly: Urgent Acorns 🌰 &rarr; High 🍃 &rarr; Medium 🌱 &rarr; Low ⭐
              </p>
            </div>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-xs text-[var(--accent-primary)] font-bold ghibli-btn shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Priority</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {activeTasks.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-2">
              <span className="text-3xl">🌱</span>
              <p className="text-base font-bold text-[var(--text-primary)]">All priorities harvested!</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Dump your next assignment or project above to sprout new tasks.
              </p>
            </div>
          ) : (
            activeTasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      </section>

      {/* 6. Creative Sprout Incubator Quick Jump */}
      <section
        onClick={() => setActiveScreen('incubator')}
        className="group p-4.5 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-purple-950/25 to-teal-950/30 border-2 border-emerald-500/30 hover:border-emerald-400/70 backdrop-blur-2xl shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Idea Incubator & Enhancer</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
              Turn raw thoughts into blueprints & 1-click milestone tasks
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all self-end sm:self-center">
          <span>Open Sprout Forge</span>
          <span>&rarr;</span>
        </div>
      </section>

      {/* 7. Forest Spirit Recommendations */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            Forest Spirit Suggestions
          </h2>
        </div>
        <AIResponseCard />
      </section>
    </div>
  );
};
