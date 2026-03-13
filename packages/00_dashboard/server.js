import http from 'node:http';

// Health check handler — responds before SvelteKit, bypassing the base path
const healthResponse = JSON.stringify({ status: 'ok', service: 'dashboard' });

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(healthResponse);
    return;
  }
  // Forward to SvelteKit handler
  svelteHandler(req, res);
});

// Dynamic import so the SvelteKit build is loaded after our server is set up
const { handler: svelteHandler } = await import('./build/handler.js');

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
