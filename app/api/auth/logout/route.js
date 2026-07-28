import { NextResponse } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/session';

export function POST(request) {
  const response = NextResponse.redirect(new URL('/play', request.url), 303);
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
