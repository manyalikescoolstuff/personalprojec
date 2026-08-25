'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VoiceRecorderUIProps {
  onTranscriptReady: (transcript: string) => void;
  onCancel?: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

export const VoiceRecorderUI: React.FC<VoiceRecorderUIProps> = ({
  onTranscriptReady,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribingWithAI, setIsTranscribingWithAI] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 20, 30, 50, 25, 35, 60, 30, 20, 15]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);

  isRecordingRef.current = isRecording;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Timer counter
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Audio level visualizer loop
  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 12 frequency bands
    const step = Math.floor(bufferLength / 12);
    const newLevels = [];
    for (let i = 0; i < 12; i++) {
      const val = dataArray[i * step] || 0;
      // Map 0-255 to percentage between 15% and 100%
      const percent = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
      newLevels.push(percent);
    }
    setAudioLevels(newLevels);

    animFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    setSeconds(0);
    audioChunksRef.current = [];

    try {
      // 1. Request actual microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Setup AudioContext for Live Waveform Visualizer
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          animFrameRef.current = requestAnimationFrame(updateAudioLevels);
        }
      } catch (err) {
        console.warn('AudioContext visualization not available:', err);
      }

      // 3. Setup MediaRecorder for AI Audio Transcription fallback
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(250);
      } catch (e) {
        console.warn('MediaRecorder fallback init:', e);
      }

      // 4. Setup SpeechRecognition (Web Speech API)
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          let accumulatedTranscript = transcript ? transcript + ' ' : '';

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let sessionText = '';
            for (let i = 0; i < event.results.length; i++) {
              sessionText += event.results[i][0].transcript + ' ';
            }
            const combined = (accumulatedTranscript + sessionText).trim();
            setTranscript(combined);
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'no-speech') return;
            console.warn('Speech recognition status:', event.error);
          };

          recognition.onend = () => {
            // If the user is still in recording mode, restart speech recognition smoothly
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {}
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          console.warn('SpeechRecognition start error:', e);
        }
      }

      setIsRecording(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone permission denied';
      setErrorMessage(`Microphone access needed: ${msg}. Please allow microphone permissions in your browser.`);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    // Stop visualizer
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Stop MediaStream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Stop MediaRecorder and transcribe if transcript is still empty
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      // If speech recognition didn't capture text (e.g. unsupported browser or noise), send to Gemini AI Transcribe
      if (!transcript.trim()) {
        setIsTranscribingWithAI(true);
        setTimeout(async () => {
          try {
            if (audioChunksRef.current.length > 0) {
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
                      setTranscript(json.transcript);
                    }
                  }
                } catch {}
                setIsTranscribingWithAI(false);
              };
            } else {
              setIsTranscribingWithAI(false);
            }
          } catch {
            setIsTranscribingWithAI(false);
          }
        }, 400);
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleApply = () => {
    const finalClean = transcript.trim();
    if (finalClean) {
      onTranscriptReady(finalClean);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 text-center space-y-6 font-kalam shadow-md">
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--accent-primary)] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Totoro Voice Ear & AI Speech</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          Speak Your Thoughts Naturally
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Totoro is listening. Speak assignments, reminders, gym slots, or random thoughts.
        </p>
      </div>

      {/* Tactile Totoro Microphone Button */}
      <div className="py-3 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isTranscribingWithAI}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative shadow-xl ghibli-btn ${
            isRecording
              ? 'bg-red-500 text-white scale-110 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isTranscribingWithAI ? (
            <Loader2 className="w-9 h-9 animate-spin text-white" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-9 h-9" />
          )}

          {/* Glowing pulse rings when recording */}
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-50 pointer-events-none" />
              <div className="absolute -inset-2 rounded-full border border-red-500/40 animate-pulse pointer-events-none" />
            </>
          )}
        </button>

        <span className="text-xs font-bold text-[var(--text-secondary)] mt-4">
          {isTranscribingWithAI
            ? 'Totoro is transcribing with Gemini AI...'
            : isRecording
            ? `Recording Voice (${formatSeconds(seconds)}) · Tap to Stop`
            : 'Tap the Green Acorn Mic to start speaking'}
        </span>
      </div>

      {/* Dynamic Live Audio Waveform Animation (Reactive to your voice amplitude) */}
      <div className="flex items-center justify-center gap-1.5 h-10 px-4">
        {audioLevels.map((height, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-100 ${
              isRecording
                ? 'bg-gradient-to-t from-emerald-500 to-lime-400 shadow-[0_0_8px_#a3e635]'
                : 'bg-[var(--border-subtle)]'
            }`}
            style={{
              height: isRecording ? `${height}%` : '20%',
            }}
          />
        ))}
      </div>

      {/* Live Transcript Box */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>Voice Transcript (Editable)</span>
            {isRecording && (
              <span className="text-lime-400 flex items-center gap-1 text-[11px] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-lime-400" />
                Live Listening
              </span>
            )}
          </label>
          {transcript && (
            <button
              type="button"
              onClick={() => setTranscript('')}
              className="text-[11px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={
            isRecording
              ? 'Listening to your voice...'
              : 'Your spoken transcript will appear here live. You can also edit, tweak, or add more details directly.'
          }
          rows={3}
          className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl p-3.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] resize-none transition-all shadow-inner"
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2 border-t border-[var(--border-subtle)]">
        {onCancel && (
          <Button variant="subtle" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          size="md"
          onClick={handleApply}
          disabled={!transcript.trim() || isRecording || isTranscribingWithAI}
          icon={<Check className="w-4 h-4" />}
          className="ghibli-btn"
        >
          Organize with AI Brain
        </Button>
      </div>
    </div>
  );
};
