/**
 * Firebase Authentication — client-side utilities
 * Supports: Email/Password, Google, GitHub
 */
import { writable } from 'svelte/store';
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

// ── Stores ─────────────────────────────────────────────────────────────────
export const firebaseUser = writable<FirebaseUser | null>(null);
export const isAuthenticated = writable(false);
export const authLoading = writable(true);

// ── Auth state listener ────────────────────────────────────────────────────
// Runs on client only; refreshes session cookie whenever token rotates
if (typeof window !== 'undefined') {
  onIdTokenChanged(auth, async (fbUser) => {
    firebaseUser.set(fbUser);
    isAuthenticated.set(fbUser !== null);
    authLoading.set(false);

    if (fbUser) {
      // Keep server-side session cookie in sync with refreshed token
      const idToken = await fbUser.getIdToken();
      await fetch('/chat/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // FASE 7: sync Firebase user to PostgreSQL (upsert)
      await fetch('/chat/api/auth/sync-user', { method: 'POST' });
    }
  });
}

// ── Sign in methods ────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function loginWithGitHub(): Promise<void> {
  const provider = new GithubAuthProvider();
  await signInWithPopup(auth, provider);
}

// ── Sign out ───────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
  await fetch('/chat/api/auth/session', { method: 'DELETE' });
}

// ── Helpers ────────────────────────────────────────────────────────────────
export async function getIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}
