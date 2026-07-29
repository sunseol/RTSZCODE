import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const PROFILE_URL = 'https://graph.zalo.me/v2.0/me';
const MAX_BODY_BYTES = 8 * 1024;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function isAuthorized(authorization, secret) {
  const received = Buffer.from(authorization ?? '', 'utf8');
  const expected = Buffer.from(`Bearer ${secret}`, 'utf8');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function createZaloRelayServer({ secret, fetchImpl = fetch }) {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new TypeError('ZALO_RELAY_SECRET is required');
  }

  return createServer((request, response) => {
    void (async () => {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

      if (request.method === 'GET' && pathname === '/health') {
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method !== 'POST' || pathname !== '/zalo/profile') {
        sendJson(response, 404, { error: 'not_found' });
        return;
      }

      if (!isAuthorized(request.headers.authorization, secret)) {
        sendJson(response, 401, { error: 'unauthorized' });
        return;
      }

      const chunks = [];
      let bodySize = 0;
      for await (const chunk of request) {
        bodySize += chunk.length;
        if (bodySize > MAX_BODY_BYTES) {
          sendJson(response, 413, { error: 'payload_too_large' });
          return;
        }
        chunks.push(chunk);
      }

      let payload;
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        sendJson(response, 400, { error: 'invalid_json' });
        return;
      }

      if (
        typeof payload !== 'object' ||
        payload === null ||
        Array.isArray(payload) ||
        typeof payload.accessToken !== 'string' ||
        payload.accessToken.length === 0 ||
        payload.accessToken.length > 4096
      ) {
        sendJson(response, 400, { error: 'invalid_access_token' });
        return;
      }

      const profileUrl = new URL(PROFILE_URL);
      profileUrl.search = new URLSearchParams({
        access_token: payload.accessToken,
        fields: 'id,name,picture',
      }).toString();
      const upstream = await fetchImpl(profileUrl.toString(), {
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      });
      sendJson(response, upstream.status, await upstream.json());
    })().catch((error) => {
      console.error('zalo_relay.request_failed', {
        message: error instanceof Error ? error.message : 'unknown error',
      });
      if (!response.headersSent) sendJson(response, 502, { error: 'upstream_failed' });
      else response.end();
    });
  });
}
