/**
 * Firebase ID token verification — server-side only
 *
 * Does NOT require a service account key or WIF.
 * Uses Firebase's public JWKS endpoint to verify RS256 JWT signatures.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PUBLIC_FIREBASE_PROJECT_ID } from '$env/static/public';

const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Cache the JWKS (auto-refreshed by jose when keys rotate)
const JWKS = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));

export interface FirebaseTokenPayload {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Verify a Firebase ID token and return its payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyFirebaseToken(
  idToken: string
): Promise<FirebaseTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${PUBLIC_FIREBASE_PROJECT_ID}`,
      audience: PUBLIC_FIREBASE_PROJECT_ID,
    });

    return {
      uid: payload.sub as string,
      email: payload['email'] as string | undefined,
      name: payload['name'] as string | undefined,
      picture: payload['picture'] as string | undefined,
      email_verified: payload['email_verified'] as boolean | undefined,
    };
  } catch {
    // Token expired, invalid signature, wrong audience, etc.
    return null;
  }
}
