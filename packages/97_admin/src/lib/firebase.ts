/**
 * Firebase client SDK initialization
 *
 * Firebase config is intentionally public — it is embedded in the client
 * bundle of every Firebase web app and visible to all users by design.
 * Security is enforced via Firebase Auth rules and server-side token verification.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
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
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export default app;
