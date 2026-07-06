import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0C',
          color: '#F5F5F2',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* 단청 포인트 보더 */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: '1px solid #C9A24B',
            opacity: 0.4,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: 52,
            right: 52,
            bottom: 52,
            border: '1px solid #C8102E',
            opacity: 0.3,
            display: 'flex',
          }}
        />

        <div
          style={{
            fontSize: 36,
            color: '#C9A24B',
            letterSpacing: 12,
            marginBottom: 24,
            display: 'flex',
          }}
        >
          歷 戰
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.1,
            display: 'flex',
            textAlign: 'center',
          }}
        >
          한국 역사를,
          <br />
          직접 살워보세요.
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#C8C8C2',
            marginTop: 36,
            display: 'flex',
          }}
        >
          고조선부터 발해까지 · 실시간 전략 게임
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            color: '#C8102E',
          }}
        >
          <span style={{ display: 'flex' }}>●</span> EARLY ACCESS · 개발 중
        </div>
      </div>
    ),
    { ...size }
  );
}
