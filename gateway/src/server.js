import http from 'node:http';

const port = Number(process.env.PORT ?? 4000);
const target = process.env.BACKEND_URL ?? 'http://backend:3001';
const windowMs = 15 * 60 * 1000;
const limit = 100;
const requests = new Map();

function allowed(request) {
  const address = request.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const current = requests.get(address);
  if (!current || now - current.startedAt >= windowMs) {
    requests.set(address, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

const server = http.createServer(async (request, response) => {
  if (!allowed(request)) {
    response.writeHead(429, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 429, message: 'Too many requests' }));
    return;
  }
  const url = new URL(request.url ?? '/', target);
  if (url.pathname === '/gateway/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', component: 'api-gateway' }));
    return;
  }
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : request;
  try {
    const upstream = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body,
      duplex: body ? 'half' : undefined,
    });
    response.writeHead(upstream.status, Object.fromEntries(upstream.headers));
    if (upstream.body) {
      for await (const chunk of upstream.body) response.write(chunk);
    }
    response.end();
  } catch {
    response.writeHead(502, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 502, message: 'Upstream unavailable' }));
  }
});

server.listen(port, () => {
  console.log(`Veridit gateway listening on ${port}`);
});
