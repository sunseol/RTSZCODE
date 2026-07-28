import { cookies } from 'next/headers';

import GameClient from '@/components/GameClient';
import ZaloLoginGate from '@/components/ZaloLoginGate';
import '@/components/zalo-login.css';
import { hasAuthConfiguration } from '@/lib/auth/config';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';
import { parseZaloAuthError } from '@/lib/auth/zalo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '게임 플레이',
  description:
    '고조선부터 발해까지, 당신의 국가를 선택해 적의 성을 파괴하라. 브라우저에서 바로 플레이하는 3D 실시간 전략 게임.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/play' },
};

export default function PlayPage({ searchParams }) {
  const authSecret = process.env.AUTH_SECRET?.trim();
  const token = cookies().get(SESSION_COOKIE)?.value;
  const player = verifySessionToken({
    token,
    secret: authSecret,
    now: Math.floor(Date.now() / 1000),
  });

  if (!player) {
    const rawError =
      typeof searchParams?.auth_error === 'string' ? searchParams.auth_error : null;
    const { error, errorCode } = parseZaloAuthError(rawError);
    return (
      <ZaloLoginGate
        configured={hasAuthConfiguration()}
        error={error}
        errorCode={errorCode}
      />
    );
  }

  return <GameClient player={player} />;
}
