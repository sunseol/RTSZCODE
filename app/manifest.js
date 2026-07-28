export default function manifest() {
  return {
    name: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    short_name: '역전',
    description:
      '고조선부터 탐라와 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#0B0B0C',
    theme_color: '#0B0B0C',
    lang: 'ko-KR',
    dir: 'ltr',
    categories: ['games', 'education'],
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      // 권장: 192x192, 512x512 PNG 마스커블 아이콘을 public/ 에 추가 후 아래에 기재
      // { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      // { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
