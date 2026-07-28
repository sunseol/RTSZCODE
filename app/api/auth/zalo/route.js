import { NextResponse } from 'next/server';

import { readAuthConfiguration } from '@/lib/auth/config';
import {
  buildAuthorizationUrl,
  createOAuthAttempt,
  OAUTH_MAX_AGE,
  OAUTH_STATE_COOKIE,
  PKCE_VERIFIER_COOKIE,
} from '@/lib/auth/zalo';

export const dynamic = 'force-dynamic';

export function GET(request) {
  let config;
  try {
    config = readAuthConfiguration();
  } catch {
    return NextResponse.redirect(new URL('/play?auth_error=configuration', request.url));
  }

  const attempt = createOAuthAttempt();
  const response = NextResponse.redirect(
    buildAuthorizationUrl({
      appId: config.appId,
      redirectUri: config.redirectUri,
      challenge: attempt.challenge,
      state: attempt.state,
    }),
  );
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/zalo/callback',
    maxAge: OAUTH_MAX_AGE,
  };

  response.cookies.set(OAUTH_STATE_COOKIE, attempt.state, cookieOptions);
  response.cookies.set(PKCE_VERIFIER_COOKIE, attempt.verifier, cookieOptions);
  return response;
}
