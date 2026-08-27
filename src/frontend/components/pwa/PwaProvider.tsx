'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, WifiOff, Check } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { soundManager } from '@/lib/soundEffects';

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    }

    // 2. Capture Android 'beforeinstallprompt' Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed recently
      const dismissed = localStorage.getItem('getdone_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Track App Installed Event
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setInstalledSuccess(true);
      haptics.success();
      soundManager.playQuestComplete();
      setTimeout(() => setInstalledSuccess(false), 4000);
    });

    // 4. Track Online / Offline Connectivity
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      haptics.warning();
    };

    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    haptics.medium();
    soundManager.playClick();

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted installation prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissBanner = () => {
    haptics.light();
    setShowInstallBanner(false);
    localStorage.setItem('getdone_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Bar Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600/95 backdrop-blur-md text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-amber-400/30 font-kalam animate-fadeIn">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Sanctuary Mode — All notes, tasks & dumps are safely preserved locally</span>
        </div>
      )}

      {/* Installed Confirmation Toast */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce font-kalam">
          <Check className="w-5 h-5" />
          <span>GetDone is installed on your Android Home Screen! 📲✨</span>
        </div>
      )}

      {/* Android Custom Install Banner */}
      {showInstallBanner && deferredPrompt && (
        <aside
          aria-label="Android App Installation"
          className="fixed bottom-24 md:bottom-6 left-4 md:left-72 right-auto max-w-sm z-50 p-4 rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-highlight)] backdrop-blur-2xl shadow-2xl space-y-3 font-kalam animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-xl shadow-md shrink-0">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent-primary)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Android App Ready</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-tight">
                  Add GetDone to Home Screen
                </h4>
              </div>
            </div>

            <button
              onClick={handleDismissBanner}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-white"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
            Install for full-screen standalone mode, offline access, and 1-tap voice capture.
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleDismissBanner}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Maybe Later
            </button>

            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md ghibli-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </aside>
      )}

      {children}
    </>
  );
};
