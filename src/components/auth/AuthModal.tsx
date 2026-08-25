'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  signInWithGoogle,
  signInAnonymouslyUser,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useAppContext } from '@/context/AppContext';
import {
  User,
  LogOut,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Database,
  CloudCheck,
  Loader2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { authUser, isSupabaseActive, syncStatus } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      setSuccessMsg('Redirecting to Google OAuth...');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInAnonymouslyUser();
      setSuccessMsg('Signed in as Guest with cloud sync!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Guest sign in failed.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        setSuccessMsg('Account created! Please check your email or sign in.');
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('Successfully logged in!');
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setSuccessMsg('Signed out of cloud session.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={authUser ? 'Cloud Sanctuary Profile' : 'Connect to Supabase Cloud'}
    >
      <div className="space-y-6 font-kalam text-[var(--text-primary)]">
        {/* Status Banner */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isSupabaseActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : configured
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Supabase PostgreSQL Sanctuary</span>
                {isSupabaseActive && <Sparkles className="w-3.5 h-3.5 text-lime-400" />}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {isSupabaseActive
                  ? `Active Sync (${syncStatus})`
                  : configured
                  ? 'Ready to authenticate'
                  : 'Running in Local Offline Mode'}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              isSupabaseActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-500/15 border-zinc-500/30 text-zinc-400'
            }`}
          >
            {isSupabaseActive ? 'ONLINE' : 'LOCAL'}
          </span>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Logged-In User View */}
        {authUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-primary)] font-bold">
                  {authUser.email ? authUser.email[0].toUpperCase() : 'G'}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {authUser.user_metadata?.full_name || authUser.email || 'Guest Explorer'}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {authUser.email || `User ID: ${authUser.id.substring(0, 8)}...`}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Realtime Synchronization</span>
                <span className="text-[var(--accent-primary)] font-bold flex items-center gap-1">
                  <CloudCheck className="w-3.5 h-3.5" />
                  <span>Enabled</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all ghibli-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect & Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up View */
          <div className="space-y-4">
            {/* Quick OAuth & Guest Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-xs font-bold flex items-center justify-center gap-2 transition-all ghibli-btn shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleAnonymousSignIn}
                disabled={isLoading}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-xs font-bold flex items-center justify-center gap-2 transition-all ghibli-btn shadow-sm"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Guest Sync</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[var(--border-subtle)] w-full" />
              <span className="bg-[var(--bg-surface)] px-3 text-[10px] text-[var(--text-muted)] uppercase font-bold absolute">
                or email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Manya"
                    className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-2.5 text-xs placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scholar@amity.edu"
                    className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl py-2.5 pl-9 pr-3 text-xs placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl py-2.5 pl-9 pr-3 text-xs placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all ghibli-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>{mode === 'signup' ? 'Create Supabase Sanctuary' : 'Enter Sanctuary'}</span>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-[var(--accent-primary)] hover:underline font-bold"
              >
                {mode === 'signup'
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up with email"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
