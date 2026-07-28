export class AuthConfigurationError extends Error {
  constructor() {
    super('Zalo authentication environment variables are incomplete');
    this.name = 'AuthConfigurationError';
  }
}

export function hasAuthConfiguration() {
  try {
    readAuthConfiguration();
    return true;
  } catch {
    return false;
  }
}

export function validateRedirectUri(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new AuthConfigurationError();
  }

  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/api/auth/zalo/callback' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new AuthConfigurationError();
  }

  return url.toString();
}

export function readAuthConfiguration() {
  const appId = process.env.ZALO_APP_ID?.trim();
  const secretKey = process.env.ZALO_APP_SECRET?.trim();
  const authSecret = process.env.AUTH_SECRET?.trim();
  const rawRedirectUri = process.env.ZALO_REDIRECT_URI?.trim();

  if (!appId || !secretKey || !authSecret || authSecret.length < 32 || !rawRedirectUri) {
    throw new AuthConfigurationError();
  }

  const redirectUri = validateRedirectUri(rawRedirectUri);
  return Object.freeze({ appId, secretKey, authSecret, redirectUri });
}
