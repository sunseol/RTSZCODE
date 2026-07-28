import { NextResponse } from 'next/server';

import { readAuthConfiguration } from '@/lib/auth/config';
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth/session';
import {
  exchangeAuthorizationCode,
  fetchZaloProfile,
  OAUTH_STATE_COOKIE,
  PKCE_VERIFIER_COOKIE,
  ZaloOAuthError,
} from '@/lib/auth/zalo';

export const dynamic = 'force-dynamic';

function finish(request, error, sessionToken) {
  const destination = new URL('/play', request.url);
  if (error) destination.searchParams.set('auth_error', error);

  const response = NextResponse.redirect(destination);
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/api/auth/zalo/callback',
    expires: new Date(0),
  });
  response.cookies.set(PKCE_VERIFIER_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/api/auth/zalo/callback',
    expires: new Date(0),
  });

  if (sessionToken) {
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
  }
  return response;
}

export async function GET(request) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(PKCE_VERIFIER_COOKIE)?.value;

  if (request.nextUrl.searchParams.has('error')) return finish(request, 'denied');
  if (!code || !state || !expectedState || !verifier || state !== expectedState) {
    return finish(request, 'state');
  }

  let config;
  try {
    config = readAuthConfiguration();
  } catch {
    return finish(request, 'configuration');
  }

  try {
    const accessToken = await exchangeAuthorizationCode({
      appId: config.appId,
      secretKey: config.secretKey,
      code,
      verifier,
    });
    const profile = await fetchZaloProfile(accessToken);
    const sessionToken = createSessionToken({
      profile,
      secret: config.authSecret,
      now: Math.floor(Date.now() / 1000),
    });
    return finish(request, null, sessionToken);
  } catch (error) {
    const stage = error instanceof ZaloOAuthError ? error.stage : 'callback';
    const errorCode = error instanceof ZaloOAuthError ? error.code : null;
    return finish(request, errorCode === null ? stage : `${stage}:${errorCode}`);
  }
}
