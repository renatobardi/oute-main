/**
 * Firebase client SDK — 01_auth-profile
 * Centralizes Firebase initialization for the auth service.
 * Config values are public by design (Firebase SDK is client-side).
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDLvTDEx_6MmqPp6PwymYidsTAdatdv7Co',
  authDomain: 'oute-mind.firebaseapp.com',
  projectId: 'oute-mind',
  storageBucket: 'oute-mind.firebasestorage.app',
  messagingSenderId: '897931738821',
  appId: '1:897931738821:web:92955a3cc5371ab57ebaac',
};

// Avoid re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
