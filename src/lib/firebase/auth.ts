import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();

export const subscribeToAuthState = (callback: (user: User | null) => void): (() => void) => {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  return auth.currentUser;
};

export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please check your .env.local configuration.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInAnonymouslyUser = async (): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please check your .env.local configuration.');
  }
  const result = await signInAnonymously(auth);
  return result.user;
};

export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signUpWithEmail = async (email: string, pass: string, displayName?: string): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
};

export const signOutUser = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};
