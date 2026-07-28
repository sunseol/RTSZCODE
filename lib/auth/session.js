import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

export const SESSION_COOKIE = 'yeokjeon_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const TOKEN_VERSION = 'v1';

function deriveKey(secret) {
  return createHash('sha256').update(secret).digest();
}

function hasValidProfile(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (typeof value.avatar === 'string' || value.avatar === null) &&
    Number.isInteger(value.issuedAt) &&
    Number.isInteger(value.expiresAt)
  );
}

export function createSessionToken({ profile, secret, now }) {
  const payload = JSON.stringify({
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE,
  });
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), initializationVector);
  cipher.setAAD(Buffer.from(TOKEN_VERSION));
  const ciphertext = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();

  return [
    TOKEN_VERSION,
    initializationVector.toString('base64url'),
    ciphertext.toString('base64url'),
    authenticationTag.toString('base64url'),
  ].join('.');
}

export function verifySessionToken({ token, secret, now }) {
  if (typeof token !== 'string' || typeof secret !== 'string') return null;

  const [version, encodedVector, encodedCiphertext, encodedTag, extra] = token.split('.');
  if (
    version !== TOKEN_VERSION ||
    !encodedVector ||
    !encodedCiphertext ||
    !encodedTag ||
    extra
  ) return null;

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      deriveKey(secret),
      Buffer.from(encodedVector, 'base64url'),
    );
    decipher.setAAD(Buffer.from(TOKEN_VERSION));
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
    const payload = Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
    const session = JSON.parse(payload);
    if (!hasValidProfile(session) || session.expiresAt <= now) return null;
    return Object.freeze(session);
  } catch {
    return null;
  }
}
