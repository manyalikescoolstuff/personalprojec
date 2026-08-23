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
      {/* Forest ambiance backdrop */}
      <div
        className="fixed inset-0 bg-[#081018]/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Storybook modal dialog */}
      <div
        className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden font-kalam text-[var(--text-primary)] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl`}
        role="dialog"
        aria-modal="true"
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/60">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🍃</span>
              <div>
                {title && <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>}
                {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors ghibli-btn"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};
