import http from 'node:http';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const port = Number(process.env.PORT ?? 4000);
const targets = {
  auth: process.env.ACCESS_SERVICE_URL ?? 'http://acesso:3001',
  credits: process.env.CREDITS_SERVICE_URL ?? 'http://creditos:3001',
  captures: process.env.CAPTURE_SERVICE_URL ?? 'http://captura:3001',
  media: process.env.MEDIA_SERVICE_URL ?? 'http://midia:3001',
};
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required.');
}
const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const windowMs = 15 * 60 * 1000;
const limit = 100;
const requests = new Map();
let requestCount = 0;
let rejectedAuthenticationCount = 0;

function corsHeaders(request) {
  const origin = request.headers.origin;
  return origin === frontendOrigin
    ? {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers':
          request.headers['access-control-request-headers'] ??
          'Content-Type, Authorization, X-Correlation-Id',
        vary: 'Origin',
      }
    : {};
}

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

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function authenticate(request) {
  const authorization = request.headers.authorization;
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) return null;

  const expected = createHmac('sha256', jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const received = Buffer.from(signature, 'base64url');
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (header.alg !== 'HS256' || typeof payload.sub !== 'string') return null;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) {
      return null;
    }
    return { id: payload.sub, role: String(payload.role ?? '') };
  } catch {
    return null;
  }
}

const server = http.createServer(async (request, response) => {
  requestCount += 1;
  if (!allowed(request)) {
    response.writeHead(429, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 429, message: 'Too many requests' }));
    return;
  }
  const path = new URL(request.url ?? '/', 'http://gateway').pathname;
  const correlationId = request.headers['x-correlation-id'] ?? randomUUID();
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders(request));
    response.end();
    return;
  }
  if (path === '/gateway/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', component: 'api-gateway' }));
    return;
  }
  if (path === '/gateway/metrics') {
    response.writeHead(200, { 'content-type': 'text/plain; version=0.0.4' });
    response.end(
      [
        `veridit_gateway_requests_total ${requestCount}`,
        `veridit_gateway_authentication_rejections_total ${rejectedAuthenticationCount}`,
      ].join('\n'),
    );
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
  const requiresAuthentication =
    (path === '/credits/balance') ||
    (path.startsWith('/credits') && request.method !== 'GET') ||
    path.startsWith('/captures') ||
    path.startsWith('/media');
  const user = requiresAuthentication ? authenticate(request) : null;
  if (requiresAuthentication && !user) {
    rejectedAuthenticationCount += 1;
    response.writeHead(401, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 401, message: 'Autenticação obrigatória.' }));
    return;
  }
  const url = new URL(request.url ?? '/', service);
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : request;
  try {
    const headers = new Headers(request.headers);
    headers.set('x-correlation-id', correlationId);
    if (user) {
      headers.set('x-authenticated-user-id', user.id);
      headers.set('x-authenticated-user-role', user.role);
    }
    const upstream = await fetch(url, {
      method: request.method,
      headers,
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
