import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSessionToken,
  verifySessionToken,
} from '../lib/auth/session.js';

const secret = 'test-secret-at-least-32-characters-long';
const profile = {
  id: 'zalo-user-42',
  name: '이순신',
  avatar: 'https://example.com/avatar.jpg',
};

test('creates a readable session for a verified Zalo profile', () => {
  // Given
  const now = 1_800_000_000;

  // When
  const token = createSessionToken({ profile, secret, now });
  const session = verifySessionToken({ token, secret, now });

  // Then
  assert.deepEqual(session, {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    issuedAt: now,
    expiresAt: now + 60 * 60 * 24 * 7,
  });
});

test('rejects a session after its authentication tag is changed', () => {
  // Given
  const now = 1_800_000_000;
  const token = createSessionToken({ profile, secret, now });
  const tokenParts = token.split('.');
  const authenticationTag = Buffer.from(tokenParts[3], 'base64url');
  authenticationTag[0] ^= 1;
  tokenParts[3] = authenticationTag.toString('base64url');

  // When
  const session = verifySessionToken({
    token: tokenParts.join('.'),
    secret,
    now,
  });

  // Then
  assert.equal(session, null);
});

test('keeps Zalo profile fields confidential inside the session token', () => {
  // Given
  const now = 1_800_000_000;

  // When
  const token = createSessionToken({ profile, secret, now });
  const decodedSegments = token
    .split('.')
    .map((segment) => Buffer.from(segment, 'base64url').toString('utf8'))
    .join('');

  // Then
  assert.equal(decodedSegments.includes(profile.name), false);
  assert.equal(decodedSegments.includes(profile.id), false);
});

test('rejects an expired session', () => {
  // Given
  const issuedAt = 1_800_000_000;
  const token = createSessionToken({ profile, secret, now: issuedAt });

  // When
  const session = verifySessionToken({
    token,
    secret,
    now: issuedAt + 60 * 60 * 24 * 7 + 1,
  });

  // Then
  assert.equal(session, null);
});
