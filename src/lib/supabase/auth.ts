import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './client';

export type { User };

export const subscribeToAuthState = (
  callback: (user: User | null) => void
): (() => void) => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    callback(null);
    return () => {};
  }

  // Get current user initially
  supabase.auth.getUser().then(({ data }) => {
    callback(data?.user || null);
  }).catch(() => {
    callback(null);
  });

  // Subscribe to real-time auth changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user || null);
    }
  );

  return () => {
    authListener?.subscription?.unsubscribe();
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const signInWithGoogle = async (): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.');
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
    },
  });

  if (error) throw error;
};

export const signInAnonymouslyUser = async (): Promise<User> => {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('Failed to create guest session.');
  return data.user;
};

export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user returned from login.');
  return data.user;
};

export const signUpWithEmail = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<User> => {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: displayName ? { full_name: displayName, name: displayName } : undefined,
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed.');
  return data.user;
};

export const signOutUser = async (): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
};
