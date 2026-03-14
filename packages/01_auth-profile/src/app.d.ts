/**
 * SvelteKit TypeScript declarations
 */
export interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

declare global {
  namespace App {
    interface Locals {
      user: FirebaseUser | null;
      deps: unknown; // DI container (legacy)
    }
  }
}

export {};
