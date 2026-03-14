/**
 * Firebase Authentication — client-side utilities para 01_auth-profile
 * Centraliza login/logout para todos os serviços OUTE.
 *
 * Após login bem-sucedido:
 *   1. Seta o cookie de sessão via /auth/api/session
 *   2. Sincroniza o usuário no PostgreSQL via /auth/api/sync-user
 *   3. O chamador redireciona para o destino final
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

// ── Helpers internos ───────────────────────────────────────────────────────
async function establishSession(user: FirebaseUser): Promise<void> {
  const idToken = await user.getIdToken();

  // 1. Seta o cookie HttpOnly de sessão
  await fetch('/auth/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  // 2. Upsert do usuário no PostgreSQL
  await fetch('/auth/api/sync-user', { method: 'POST' });
}

// ── Auth state listener ────────────────────────────────────────────────────
// Roda apenas no client; mantém o cookie de sessão atualizado quando o token rota
if (typeof window !== 'undefined') {
  onIdTokenChanged(auth, async (fbUser) => {
    firebaseUser.set(fbUser);
    isAuthenticated.set(fbUser !== null);
    authLoading.set(false);

    if (fbUser) {
      await establishSession(fbUser);
    }
  });
}

// ── Sign in methods ────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<void> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await establishSession(cred.user);
}

export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await establishSession(result.user);
}

export async function loginWithGitHub(): Promise<void> {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await establishSession(result.user);
}

// ── Sign out ───────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
  await fetch('/auth/api/session', { method: 'DELETE' });
}
