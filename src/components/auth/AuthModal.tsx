'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  signInWithGoogle,
  signInAnonymouslyUser,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from '@/lib/firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/config';
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
  const { authUser, isFirebaseActive, syncStatus } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const configured = isFirebaseConfigured();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      setSuccessMsg('Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 1000);
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
        setSuccessMsg('Account created and logged in!');
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
      setSuccessMsg('Signed out successfully.');
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
      title={authUser ? 'Firebase Cloud Account' : 'Sign in to GetDone'}
      subtitle={
        authUser
          ? 'Your tasks, schedule, and brain dumps are synced with Cloud Firestore'
          : 'Sync your tasks, schedules, and brain dumps seamlessly across all devices'
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Backend Status Banner */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
            configured
              ? 'bg-[#18261E]/80 border-[#2D4536] text-[#A3E635]'
              : 'bg-[#291B18]/80 border-[#4D2722] text-[#FCA5A5]'
          }`}
        >
          <Database className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-semibold flex items-center gap-1.5">
              <span>Firebase Cloud Backend:</span>
              <span className={configured ? 'text-[#84CC16]' : 'text-[#EF4444]'}>
                {configured ? 'Connected & Ready' : 'Credentials Needed in .env.local'}
              </span>
            </div>
            <p className="text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
              {configured
                ? `Real-time sync active (Status: ${syncStatus})`
                : 'Add NEXT_PUBLIC_FIREBASE_API_KEY & PROJECT_ID in .env.local to activate cloud database.'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-800/60 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-800/60 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authenticated State */}
        {authUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#18221E] border border-[#24332D]">
              <div className="w-12 h-12 rounded-full bg-[#2A4036] flex items-center justify-center text-emerald-400 font-bold text-lg border border-[#3B5B4C]">
                {authUser.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authUser.photoURL}
                    alt={authUser.displayName || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  authUser.displayName?.charAt(0).toUpperCase() ||
                  authUser.email?.charAt(0).toUpperCase() || <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[#F3F4F1] truncate">
                  {authUser.displayName || (authUser.isAnonymous ? 'Guest User' : 'Authenticated User')}
                </h4>
                <p className="text-xs text-[#8C9E90] truncate">{authUser.email || `UID: ${authUser.uid.slice(0, 12)}...`}</p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud Firestore Sync: Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#221B1A] hover:bg-[#2F2120] text-red-400 hover:text-red-300 border border-red-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Unauthenticated State */
          <div className="space-y-4">
            {/* 1-Click Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || !configured}
              className="w-full py-2.5 px-4 rounded-lg bg-[#F3F4F1] hover:bg-white text-[#0A0F0D] font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span>Continue with Google</span>
            </button>

            {/* Anonymous Guest Button */}
            <button
              type="button"
              onClick={handleAnonymousSignIn}
              disabled={isLoading || !configured}
              className="w-full py-2.5 px-4 rounded-lg bg-[#18221E] hover:bg-[#202C27] text-[#D8E2DC] border border-[#24332D] font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Continue as Guest (Instant Cloud Sync)</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#1E2824]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#63756A] uppercase tracking-wider font-mono">
                or with email
              </span>
              <div className="flex-grow border-t border-[#1E2824]"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-[#8C9E90] mb-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-[#63756A]" />
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#111815] border border-[#1E2824] rounded-lg text-[#F3F4F1] focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-[#8C9E90] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#63756A]" />
                  <input
                    type="email"
                    required
                    placeholder="alex@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#111815] border border-[#1E2824] rounded-lg text-[#F3F4F1] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#8C9E90] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#63756A]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#111815] border border-[#1E2824] rounded-lg text-[#F3F4F1] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !configured}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'signup' ? (
                  'Create Cloud Account'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-[#8C9E90] hover:text-emerald-400 transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
