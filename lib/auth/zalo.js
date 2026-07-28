import { createHash, randomBytes } from 'node:crypto';

const AUTHORIZATION_URL = 'https://oauth.zaloapp.com/v4/permission';
const TOKEN_URL = 'https://oauth.zaloapp.com/v4/access_token';
const PROFILE_URL = 'https://graph.zalo.me/v2.0/me';

export const OAUTH_STATE_COOKIE = 'zalo_oauth_state';
export const PKCE_VERIFIER_COOKIE = 'zalo_pkce_verifier';
export const OAUTH_MAX_AGE = 60 * 10;

export class ZaloOAuthError extends Error {
  constructor(stage, message) {
    super(message);
    this.name = 'ZaloOAuthError';
    this.stage = stage;
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createOAuthAttempt() {
  const verifier = randomBytes(32).toString('base64url');
  return Object.freeze({
    verifier,
    challenge: createHash('sha256').update(verifier, 'ascii').digest('base64url'),
    state: randomBytes(32).toString('base64url'),
  });
}

export function buildAuthorizationUrl({ appId, redirectUri, challenge, state }) {
  const url = new URL(AUTHORIZATION_URL);
  url.search = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    state,
  }).toString();
  return url.toString();
}

export async function exchangeAuthorizationCode(input, fetchImpl = fetch) {
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      secret_key: input.secretKey,
    },
    body: new URLSearchParams({
      code: input.code,
      app_id: input.appId,
      grant_type: 'authorization_code',
      code_verifier: input.verifier,
    }),
    cache: 'no-store',
  });
  const payload = await response.json();

  if (!response.ok || !isRecord(payload) || typeof payload.access_token !== 'string') {
    throw new ZaloOAuthError('token', 'Zalo access token exchange failed');
  }

  return payload.access_token;
}

export async function fetchZaloProfile(accessToken, fetchImpl = fetch) {
  const url = new URL(PROFILE_URL);
  url.search = new URLSearchParams({
    accesstoken: accessToken,
    fields: 'id,name,picture',
  }).toString();

  const response = await fetchImpl(url.toString(), { cache: 'no-store' });
  const payload = await response.json();
  const picture = isRecord(payload) && isRecord(payload.picture) ? payload.picture : null;
  const pictureData = picture && isRecord(picture.data) ? picture.data : null;

  if (
    !response.ok ||
    !isRecord(payload) ||
    typeof payload.id !== 'string' ||
    typeof payload.name !== 'string'
  ) {
    throw new ZaloOAuthError('profile', 'Zalo profile request failed');
  }

  return Object.freeze({
    id: payload.id,
    name: payload.name,
    avatar: pictureData && typeof pictureData.url === 'string' ? pictureData.url : null,
  });
}
