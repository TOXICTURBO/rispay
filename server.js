const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '/', true);
      const pathname = parsedUrl.pathname || '/';

      // Fast health check so Render's load balancer gets 200 without waiting on Next/DB
      if (pathname === '/api/health' || pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('internal server error');
      }
    }
  });

  // Initialize WebSocket (only if socket.io is available)
  try {
    const { initializeWebSocket } = require('./lib/websocket');
    initializeWebSocket(server);
    console.log('WebSocket server initialized');
  } catch (error) {
    console.warn('WebSocket initialization skipped:', error.message);
  }

  // Initialize cron jobs (only in production)
  if (process.env.NODE_ENV === 'production') {
    try {
      const { initializeCronJobs } = require('./lib/cron');
      initializeCronJobs();
      console.log('Cron jobs initialized');
    } catch (error) {
      console.warn('Cron jobs initialization skipped:', error.message);
    }
  }

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
