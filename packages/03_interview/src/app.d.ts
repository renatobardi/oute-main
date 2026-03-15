// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

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
    }
  }
}

export {};
