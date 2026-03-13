/**
 * SvelteKit Server Hooks
 * Sets up Dependency Injection container at startup
 */

import type { Handle } from '@sveltejs/kit';
import { LoginUseCase } from './application/use-cases/login/LoginUseCase';
import { RegisterUseCase } from './application/use-cases/register/RegisterUseCase';
import { GetProfileUseCase } from './application/use-cases/get-profile/GetProfileUseCase';

// Infrastructure adapters
import { PostgresUserRepository } from './infrastructure/adapters/repositories/PostgresUserRepository';
import { BcryptPasswordAdapter } from './infrastructure/adapters/password/BcryptPasswordAdapter';
import { JwtTokenAdapter } from './infrastructure/adapters/token/JwtTokenAdapter';

/**
 * Initialize Dependency Injection Container
 * This runs once when the server starts
 */
function initializeDependencies() {
  // Get configuration from environment
  const jwtSecret = process.env.JWT_SECRET ?? 'test-secret-key';

  // Create infrastructure adapters
  const userRepository = new PostgresUserRepository();
  const passwordHasher = new BcryptPasswordAdapter();
  const tokenGenerator = new JwtTokenAdapter(jwtSecret);

  // Create application use cases
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenGenerator);
  const registerUseCase = new RegisterUseCase(userRepository, passwordHasher, tokenGenerator);
  const getProfileUseCase = new GetProfileUseCase(userRepository);

  return {
    userRepository,
    passwordHasher,
    tokenGenerator,
    loginUseCase,
    registerUseCase,
    getProfileUseCase,
  };
}

// Initialize dependencies at server startup
const deps = initializeDependencies();

// Export to global for use in route handlers
if (typeof global !== 'undefined') {
  (global as unknown).__authDeps = deps;
}

export const handle: Handle = async ({ event, resolve }) => {
  // CORS configuration for production (34.132.93.171) and development
  const allowedOrigins = [
    'http://localhost:3000',    // Local development
    'http://localhost:3003',    // 99_home local
    'http://34.132.93.171',     // Production
    'https://34.132.93.171',    // Production HTTPS
  ];

  const origin = event.request.headers.get('origin');
  const isAllowedOrigin = allowedOrigins.includes(origin || '');

  // Handle CORS preflight requests
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin! : 'http://localhost:3003',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // Inject dependencies into event.locals
  event.locals.deps = deps;

  const response = await resolve(event);

  // Add CORS headers to response
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
};
