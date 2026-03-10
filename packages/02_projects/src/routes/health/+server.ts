import type { RequestHandler } from './$types';

/**
 * GET /health
 * Health check endpoint for Docker health checks and monitoring
 */
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'projects',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
