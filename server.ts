import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dispatchApiRequest } from './api/lib/devMiddleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveStaticFile(req: http.IncomingMessage, res: http.ServerResponse, filePath: string) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return serveIndexHtml(req, res);
    }

    const contentType = getContentType(filePath);
    const isHashedAsset = filePath.includes(`${path.sep}assets${path.sep}`);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch {
    serveIndexHtml(req, res);
  }
}

function serveIndexHtml(_req: http.IncomingMessage, res: http.ServerResponse) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  try {
    const stat = fs.statSync(indexPath);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(indexPath).pipe(res);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Build output not found. Please run "npm run build" first.');
  }
}

export const server = http.createServer((req, res) => {
  const url = req.url || '/';

  // 1. API routes delegation
  if (url.startsWith('/api/')) {
    return dispatchApiRequest(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Not found: ${req.method} ${url}` }));
    });
  }

  // 2. Health check endpoint for Render / load balancers
  if (url === '/health' || url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }

  // 3. Static files & SPA fallback
  const sanitizedPath = path.normalize(url.split('?')[0]).replace(/^(\.\.[/\\])+/, '');
  const candidatePath = path.join(DIST_DIR, sanitizedPath);

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return serveStaticFile(req, res, candidatePath);
  }

  // SPA fallback
  serveIndexHtml(req, res);
});

// Auto-start server if executed directly
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  server.listen(PORT, HOST, () => {
    console.log(`[Bug Hunt Arena] Server running on http://${HOST}:${PORT}`);
    console.log(`[Bug Hunt Arena] Serving static assets from ${DIST_DIR}`);
  });

  process.on('SIGTERM', () => {
    console.log('[Bug Hunt Arena] Received SIGTERM, shutting down gracefully...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('[Bug Hunt Arena] Received SIGINT, shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}

export default server;
