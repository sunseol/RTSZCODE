import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAuthorizationUrl,
  createOAuthAttempt,
  exchangeAuthorizationCode,
  fetchZaloProfile,
  parseZaloAuthError,
  ZaloOAuthError,
} from '../lib/auth/zalo.js';

test('creates a distinct PKCE attempt for every login request', () => {
  // Given
  const first = createOAuthAttempt();

  // When
  const second = createOAuthAttempt();

  // Then
  assert.match(first.verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.match(first.challenge, /^[A-Za-z0-9_-]{43}$/);
  assert.match(first.state, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first.verifier, second.verifier);
  assert.notEqual(first.state, second.state);
});

test('builds the Zalo v4 permission request with PKCE and state', () => {
  // Given
  const input = {
    appId: '123456789',
    redirectUri: 'https://game.example/api/auth/zalo/callback',
    challenge: 'challenge-value',
    state: 'state-value',
  };

  // When
  const url = new URL(buildAuthorizationUrl(input));

  // Then
  assert.equal(url.origin + url.pathname, 'https://oauth.zaloapp.com/v4/permission');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    app_id: input.appId,
    redirect_uri: input.redirectUri,
    code_challenge: input.challenge,
    state: input.state,
  });
});

test('exchanges the authorization code only through the server endpoint', async () => {
  // Given
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url, init });
    return Response.json({ access_token: 'zalo-access-token', expires_in: '3600' });
  };

  // When
  const token = await exchangeAuthorizationCode(
    {
      appId: '123456789',
      secretKey: 'server-secret',
      code: 'one-time-code',
      verifier: 'pkce-verifier',
    },
    fetchImpl,
  );

  // Then
  assert.equal(token, 'zalo-access-token');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://oauth.zaloapp.com/v4/access_token');
  assert.equal(requests[0].init.method, 'POST');
  assert.equal(requests[0].init.headers.secret_key, 'server-secret');
  assert.deepEqual(Object.fromEntries(requests[0].init.body), {
    code: 'one-time-code',
    app_id: '123456789',
    grant_type: 'authorization_code',
    code_verifier: 'pkce-verifier',
  });
});

test('reads only the Zalo profile fields needed by the game session', async () => {
  // Given
  const requests = [];
  const fetchImpl = async (url) => {
    requests.push(url);
    return Response.json({
      id: 'zalo-user-42',
      name: '이순신',
      picture: { data: { url: 'https://example.com/avatar.jpg' } },
    });
  };

  // When
  const profile = await fetchZaloProfile('zalo-access-token', fetchImpl);

  // Then
  const url = new URL(requests[0]);
  assert.equal(url.origin + url.pathname, 'https://graph.zalo.me/v2.0/me');
  assert.equal(url.searchParams.get('access_token'), 'zalo-access-token');
  assert.equal(url.searchParams.has('accesstoken'), false);
  assert.equal(url.searchParams.get('fields'), 'id,name,picture');
  assert.deepEqual(profile, {
    id: 'zalo-user-42',
    name: '이순신',
    avatar: 'https://example.com/avatar.jpg',
  });
});

test('routes the Zalo profile request through the configured proxy', async () => {
  // Given
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url, init });
    return Response.json({
      id: 'zalo-user-42',
      name: '이순신',
      picture: { data: { url: 'https://example.com/avatar.jpg' } },
    });
  };

  // When
  await fetchZaloProfile(
    'zalo-access-token',
    fetchImpl,
    'http://proxy-user:proxy-password@proxy.example:8080',
  );

  // Then
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.dispatcher?.constructor.name, 'ProxyAgent');
});

test('bounds the Zalo profile request duration when the proxy stalls', async () => {
  // Given
  let requestSignal;
  const fetchImpl = async (_url, init) => {
    requestSignal = init.signal;
    return Response.json({ id: 'zalo-user-42', name: '이순신' });
  };

  // When
  await fetchZaloProfile('zalo-access-token', fetchImpl);

  // Then
  assert.equal(requestSignal instanceof AbortSignal, true);
});

test('preserves the safe Zalo error code when profile access is rejected', async () => {
  // Given
  const fetchImpl = async () =>
    Response.json({
      error: 452,
      message: 'Session key invalid',
    });

  // When / Then
  await assert.rejects(
    () => fetchZaloProfile('rejected-token', fetchImpl),
    (error) => error instanceof ZaloOAuthError && error.code === 452,
  );
});

test('shows signed Zalo error codes returned by the OAuth callback', () => {
  // Given
  const callbackError = 'profile:-201';

  // When
  const parsed = parseZaloAuthError(callbackError);

  // Then
  assert.deepEqual(parsed, {
    error: 'profile',
    errorCode: '-201',
  });
});
