import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeWebSocket } from './lib/websocket';
import { initializeCronJobs } from './lib/cron';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket (only if socket.io is available)
  try {
    initializeWebSocket(server);
    console.log('WebSocket server initialized');
  } catch (error: any) {
    console.warn('WebSocket initialization skipped:', error.message);
  }

  // Initialize cron jobs (only in production)
  if (process.env.NODE_ENV === 'production') {
    try {
      initializeCronJobs();
      console.log('Cron jobs initialized');
    } catch (error: any) {
      console.warn('Cron jobs initialization skipped:', error.message);
    }
  }

  server.listen(port, hostname, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
