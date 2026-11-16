import http from 'node:http';

const port = Number(process.env.PORT ?? 4000);
const targets = {
  auth: process.env.ACCESS_SERVICE_URL ?? 'http://acesso:3001',
  credits: process.env.CREDITS_SERVICE_URL ?? 'http://creditos:3001',
  captures: process.env.CAPTURE_SERVICE_URL ?? 'http://captura:3001',
  media: process.env.MEDIA_SERVICE_URL ?? 'http://midia:3001',
};
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
  const path = new URL(request.url ?? '/', 'http://gateway').pathname;
  if (path === '/gateway/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', component: 'api-gateway' }));
    return;
  }
  const service = path.startsWith('/auth')
    ? targets.auth
    : path.startsWith('/credits')
      ? targets.credits
      : path.startsWith('/captures')
        ? targets.captures
        : path.startsWith('/media')
          ? targets.media
          : null;
  if (!service) {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 404, message: 'Route not found' }));
    return;
  }
  const url = new URL(request.url ?? '/', service);
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
