import { createServer } from 'node:http';

// Local test fixture only. Never send these synthetic leads to a real CRM.
let mode = 'success';
let requests = [];
const pending = new Set();

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === '/health') return json(response, 200, { ok: true });
    if (request.url === '/_state' && request.method === 'GET') {
      return json(response, 200, { mode, count: requests.length, requests });
    }
    if (request.url === '/_control' && request.method === 'POST') {
      const input = await readJson(request);
      if (!['success', 'failure', 'timeout', 'pending'].includes(input.mode)) {
        return json(response, 400, { ok: false });
      }
      for (const waiting of pending) waiting.destroy();
      pending.clear();
      requests = [];
      mode = input.mode;
      return json(response, 200, { ok: true });
    }
    if (request.url === '/_release' && request.method === 'POST') {
      for (const waiting of pending) json(waiting, 202, { accepted: true });
      pending.clear();
      return json(response, 200, { ok: true });
    }
    if (request.url === '/leads' && request.method === 'POST') {
      requests.push(await readJson(request));
      if (mode === 'failure') return json(response, 500, { privateError: 'fixture only' });
      if (mode === 'timeout' || mode === 'pending') {
        pending.add(response);
        response.on('close', () => pending.delete(response));
        return;
      }
      return json(response, 202, { accepted: true });
    }
    return json(response, 404, { ok: false });
  } catch {
    return json(response, 400, { ok: false });
  }
});

server.listen(4399, '127.0.0.1');

function stop() {
  for (const waiting of pending) waiting.destroy();
  server.closeAllConnections();
  server.close(() => process.exit(0));
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
