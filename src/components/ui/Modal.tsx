'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Calm backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0F0D]/80 backdrop-blur-sm transition-opacity dark:bg-[#0A0F0D]/80 light:bg-[#000000]/30"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div
        className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} bg-[#151D1A] border border-[#1E2824] rounded-lg shadow-2xl overflow-hidden font-kalam text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:text-[#111827] animate-in fade-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 border-b border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
            <div>
              {title && <h2 className="text-lg font-medium tracking-tight text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">{title}</h2>}
              {subtitle && <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#8C9E90] hover:text-[#F3F4F1] hover:bg-[#18221E] transition-colors dark:text-[#8C9E90] dark:hover:text-[#F3F4F1] dark:hover:bg-[#18221E] light:text-[#64748B] light:hover:text-[#111827] light:hover:bg-[#F1F5F9]"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
