import GameClient from '@/components/GameClient';

export const metadata = {
  title: '게임 플레이 — 중세 왕국 전쟁',
  description:
    '고조선부터 발해까지, 당신의 국가를 선택해 적의 성을 파괴하라. 브라우저에서 바로 플레이하는 3D 실시간 전략 게임.',
  robots: { index: false, follow: true },
};

export default function PlayPage() {
  return <GameClient />;
}
