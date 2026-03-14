/**
 * SvelteKit Server Hooks — 01_auth-profile
 *
 * 1. Verifica o cookie de sessão Firebase em cada request
 * 2. Popula event.locals.user com os dados do token
 * 3. Inicializa o container de DI (legacy — mantido para compatibilidade)
 * 4. Configura CORS
 */

import type { Handle } from '@sveltejs/kit';
import { verifyFirebaseToken } from '$lib/server/verifyToken';

// ── Legacy DI (mantido para os endpoints antigos /api/auth, /api/profile) ──
import { LoginUseCase } from './application/use-cases/login/LoginUseCase';
import { RegisterUseCase } from './application/use-cases/register/RegisterUseCase';
import { GetProfileUseCase } from './application/use-cases/get-profile/GetProfileUseCase';
import { PostgresUserRepository } from './infrastructure/adapters/repositories/PostgresUserRepository';
import { BcryptPasswordAdapter } from './infrastructure/adapters/password/BcryptPasswordAdapter';
import { JwtTokenAdapter } from './infrastructure/adapters/token/JwtTokenAdapter';

function initializeDependencies() {
  const jwtSecret = process.env.JWT_SECRET ?? 'test-secret-key';
  const userRepository = new PostgresUserRepository();
  const passwordHasher = new BcryptPasswordAdapter();
  const tokenGenerator = new JwtTokenAdapter(jwtSecret);
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenGenerator);
  const registerUseCase = new RegisterUseCase(userRepository, passwordHasher, tokenGenerator);
  const getProfileUseCase = new GetProfileUseCase(userRepository);
  return { userRepository, passwordHasher, tokenGenerator, loginUseCase, registerUseCase, getProfileUseCase };
}

const deps = initializeDependencies();
if (typeof global !== 'undefined') {
  (global as unknown as Record<string, unknown>).__authDeps = deps;
}

// ── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3003',
  'https://oute.pro',
  'http://34.132.93.171',
  'https://34.132.93.171',
];

// ── Handle ──────────────────────────────────────────────────────────────────
export const handle: Handle = async ({ event, resolve }) => {
  // 1. Firebase session verification
  event.locals.user = null;
  const sessionToken = event.cookies.get('session');
  if (sessionToken) {
    const payload = await verifyFirebaseToken(sessionToken);
    if (payload) {
      event.locals.user = payload;
    } else {
      event.cookies.delete('session', { path: '/' });
    }
  }

  // 2. Legacy DI injection
  event.locals.deps = deps;

  // 3. CORS preflight
  const origin = event.request.headers.get('origin');
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin ?? '');

  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin! : 'https://oute.pro',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await resolve(event);

  // 4. CORS headers na response
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
};
