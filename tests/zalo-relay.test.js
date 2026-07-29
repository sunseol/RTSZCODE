import assert from 'node:assert/strict';
import test from 'node:test';

import { createZaloRelayServer } from '../lib/auth/zalo-relay.js';
import { fetchZaloProfile } from '../lib/auth/zalo.js';

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert.equal(typeof address, 'object');
  return `http://127.0.0.1:${address.port}`;
}

async function close(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test('forwards an authenticated profile request through the local relay', async () => {
  // Given
  const downstreamRequests = [];
  const server = createZaloRelayServer({
    secret: 'relay-secret',
    fetchImpl: async (url) => {
      downstreamRequests.push(url);
      return Response.json({
        id: 'zalo-user-42',
        name: '이순신',
        picture: { data: { url: 'https://example.com/avatar.jpg' } },
      });
    },
  });
  const origin = await listen(server);

  try {
    // When
    const profile = await fetchZaloProfile('zalo-access-token', fetch, {
      relayUrl: `${origin}/zalo/profile`,
      relaySecret: 'relay-secret',
    });

    // Then
    const downstreamUrl = new URL(downstreamRequests[0]);
    assert.equal(downstreamUrl.origin + downstreamUrl.pathname, 'https://graph.zalo.me/v2.0/me');
    assert.equal(downstreamUrl.searchParams.get('access_token'), 'zalo-access-token');
    assert.equal(downstreamUrl.searchParams.get('fields'), 'id,name,picture');
    assert.deepEqual(profile, {
      id: 'zalo-user-42',
      name: '이순신',
      avatar: 'https://example.com/avatar.jpg',
    });
  } finally {
    await close(server);
  }
});

test('rejects relay requests without the shared secret', async () => {
  // Given
  let downstreamCalled = false;
  const server = createZaloRelayServer({
    secret: 'relay-secret',
    fetchImpl: async () => {
      downstreamCalled = true;
      return Response.json({});
    },
  });
  const origin = await listen(server);

  try {
    // When
    const response = await fetch(`${origin}/zalo/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: 'stolen-token' }),
    });

    // Then
    assert.equal(response.status, 401);
    assert.equal(downstreamCalled, false);
  } finally {
    await close(server);
  }
});

test('reports relay health without exposing credentials', async () => {
  // Given
  const server = createZaloRelayServer({
    secret: 'relay-secret',
    fetchImpl: fetch,
  });
  const origin = await listen(server);

  try {
    // When
    const response = await fetch(`${origin}/health`);

    // Then
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  } finally {
    await close(server);
  }
});
