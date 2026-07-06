'use client';

import dynamic from 'next/dynamic';
import './play-game.css';

const GameView = dynamic(() => import('./GameView'), {
  ssr: false,
  loading: () => (
    <div className="game-loading" role="status" aria-live="polite">
      전장 준비 중...
    </div>
  ),
});

export default function GameClient() {
  return <GameView />;
}
