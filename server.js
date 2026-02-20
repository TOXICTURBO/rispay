const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || '/', true);
    const pathname = parsedUrl.pathname || '/';

    // Fast health check so Render's load balancer gets 200 without waiting on Next/DB
    if (pathname === '/api/health' || pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Log so you can see in Render logs that requests reached the server
    console.log(req.method, pathname);

    handle(req, res, parsedUrl).catch((err) => {
        console.error('Error handling', req.method, pathname, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Internal Server Error');
        }
    });
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

  // Must listen on 0.0.0.0 so Render's proxy can reach us
  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});
