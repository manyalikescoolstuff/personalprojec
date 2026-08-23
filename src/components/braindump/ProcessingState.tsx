'use client';

import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2 } from 'lucide-react';

interface ProcessingStateProps {
  onComplete: () => void;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Reading raw thoughts & transcripts...',
    'Scanning attachments for deadlines & rubrics...',
    'Extracting tasks, reminders, and calendar events...',
    'Synthesizing actionable structure...',
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setCurrentStep(2), 1200);
    const timer3 = setTimeout(() => setCurrentStep(3), 1800);
    const timer4 = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center space-y-6 font-kalam select-none animate-in fade-in duration-300">
      {/* Calm glowing orb */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#18221E] border border-[#9ED8A3]/50 text-[#9ED8A3] shadow-[0_0_30px_rgba(158,216,163,0.15)] dark:bg-[#18221E] dark:border-[#9ED8A3]/50 dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:border-[#2563EB] light:text-[#2563EB] light:shadow-[0_0_30px_rgba(37,99,235,0.1)]">
          <Brain className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-lg font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Organizing your thoughts
        </h3>
        <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
          Converting your raw brain dump into clean, actionable priorities.
        </p>
      </div>

      {/* Progressive Step Indicators */}
      <div className="w-full max-w-sm space-y-2 text-left">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-all duration-200 ${
                isDone
                  ? 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]'
                  : isCurrent
                  ? 'text-[#F3F4F1] font-medium dark:text-[#F3F4F1] light:text-[#111827]'
                  : 'text-[#55665A] dark:text-[#55665A] light:text-[#CBD5E1]'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : isCurrent ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-current shrink-0 opacity-40" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
