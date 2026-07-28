import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const alt = '역전(歷戰)';

// iOS 홈스크린용 애플 터치 아이콘 (PNG 자동 생성)
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0C',
          color: '#C9A24B',
          fontSize: 60,
          fontWeight: 900,
          fontFamily: 'serif',
          letterSpacing: 4,
        }}
      >
        歷戰
      </div>
    ),
    { ...size }
  );
}
