import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRedirectUri } from '../lib/auth/config.js';

test('accepts the registered HTTPS Zalo callback endpoint', () => {
  // Given
  const callback = 'https://game.example/api/auth/zalo/callback';

  // When
  const redirectUri = validateRedirectUri(callback);

  // Then
  assert.equal(redirectUri, callback);
});

test('rejects an insecure Zalo callback endpoint', () => {
  // Given
  const callback = 'http://game.example/api/auth/zalo/callback';

  // When / Then
  assert.throws(() => validateRedirectUri(callback));
});

test('rejects a Zalo callback outside the fixed callback route', () => {
  // Given
  const callback = 'https://attacker.example/collect';

  // When / Then
  assert.throws(() => validateRedirectUri(callback));
});
