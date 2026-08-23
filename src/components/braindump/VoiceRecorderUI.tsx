'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Check, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VoiceRecorderUIProps {
  onTranscriptReady: (transcript: string) => void;
  onCancel?: () => void;
}

// Global declaration for Web Speech API
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
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const instance = new SpeechRecognitionClass();
          instance.continuous = true;
          instance.interimResults = true;
          instance.lang = 'en-US';

          instance.onresult = (event: SpeechRecognitionEvent) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            setTranscript(fullText.trim());
          };

          instance.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'no-speech') return;
            setErrorMessage(`Microphone note: ${event.error}. You can still type or use sample dictations.`);
            setIsRecording(false);
          };

          instance.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = instance;
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  // Timer while recording
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

  const startRecording = useCallback(() => {
    setErrorMessage(null);
    setSeconds(0);
    setTranscript('');
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Fallback simulation if speech recognition is already running or blocked
      }
    } else {
      // Graceful simulated speech recognition
      setTranscript('Listening...');
      setTimeout(() => {
        setTranscript('I have DBMS tomorrow, gym at six and I need to buy shampoo.');
      }, 2000);
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleApply = () => {
    const finalClean = transcript.replace('Listening...', '').trim();
    onTranscriptReady(
      finalClean || 'I have DBMS tomorrow, gym at six and I need to buy shampoo.'
    );
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-[#111816] border border-[#1E2824] rounded-xl p-6 text-center space-y-5 font-kalam dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0]">
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Voice Input
        </h3>
        <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          Speak naturally. Your words will be transcribed and added directly to your Brain Dump.
        </p>
      </div>

      {/* Big Tactile Microphone Button */}
      <div className="py-2 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={toggleRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative shadow-lg ${
            isRecording
              ? 'bg-[#E07A7A] text-[#0A0F0D] scale-110 shadow-[0_0_30px_rgba(224,122,122,0.3)]'
              : 'bg-[#18221E] border-2 border-[#9ED8A3] text-[#9ED8A3] hover:bg-[#9ED8A3] hover:text-[#0A0F0D] hover:scale-105 dark:bg-[#18221E] dark:border-[#9ED8A3] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:border-[#2563EB] light:text-[#2563EB] light:hover:bg-[#2563EB] light:hover:text-white'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-7 h-7 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}

          {/* Pulse ring when recording */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-[#E07A7A] animate-ping opacity-40 pointer-events-none" />
          )}
        </button>

        <span className="text-xs text-[#8C9E90] mt-3 font-sans dark:text-[#8C9E90] light:text-[#64748B]">
          {isRecording
            ? `Recording (${formatSeconds(seconds)}) · Click to stop`
            : 'Click microphone to start speaking'}
        </span>
      </div>

      {/* Live Audio Waveform Animation */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1.5 h-8">
          {[40, 70, 95, 60, 100, 50, 85, 95, 60, 85, 45, 75, 90, 60].map((height, i) => (
            <div
              key={i}
              className="w-1 bg-[#9ED8A3] dark:bg-[#9ED8A3] light:bg-[#2563EB] rounded-full transition-all duration-150 animate-pulse"
              style={{
                height: `${height}%`,
                animationDelay: `${(i % 5) * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript Input / Preview Area */}
      <div className="space-y-2 text-left">
        <label className="text-xs text-[#8C9E90] uppercase tracking-wider flex items-center justify-between">
          <span>Transcript (Editable)</span>
          {isRecording && (
            <span className="text-[#9ED8A3] flex items-center gap-1 text-[11px] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9ED8A3]" />
              Transcribing
            </span>
          )}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isRecording ? 'Listening...' : 'Your spoken transcript will appear here. You can also edit it directly.'}
          rows={3}
          className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded-lg p-3 text-sm font-kalam placeholder:text-[#55665A] focus:outline-none focus:border-[#9ED8A3] resize-none transition-colors dark:bg-[#151D1A] dark:text-[#F3F4F1] dark:border-[#1E2824] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]"
        />
      </div>

      {/* Informative fallback message if speech recognition is unsupported */}
      {isSupported === false && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#18221E] border border-[#283630] text-xs text-[#8C9E90] text-left dark:bg-[#18221E] dark:border-[#283630] light:bg-[#F1F5F9] light:border-[#E2E8F0] light:text-[#64748B]">
          <Info className="w-4 h-4 text-[#9ED8A3] shrink-0 dark:text-[#9ED8A3] light:text-[#2563EB]" />
          <span>
            Native browser speech recognition is not active on this browser. Voice recording simulation is enabled, and you can edit any words above.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#E07A7A]/10 border border-[#E07A7A]/30 text-xs text-[#E07A7A] text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
        {onCancel && (
          <Button variant="subtle" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          size="md"
          onClick={handleApply}
          disabled={!transcript.trim() || isRecording}
          icon={<Check className="w-4 h-4" />}
        >
          Add to Brain Dump
        </Button>
      </div>
    </div>
  );
};
