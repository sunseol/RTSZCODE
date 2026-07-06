import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medieval-rts.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    template: '%s | 역전(歷戰)',
  },
  description:
    '고조선부터 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임. 브라우저에서 바로, 역사를 살워보세요. 지금 얼리 액세스로 개발 중.',
  keywords: [
    '한국 역사 게임',
    '역사 게임',
    '한국사',
    '고구려',
    '백제',
    '신라',
    '고조선',
    '발해',
    'RTS',
    '실시간 전략 게임',
    '3D 게임',
    'Three.js',
    '교육 게임',
  ],
  authors: [{ name: '역전(歷戰) 팀' }],
  creator: '역전(歷戰)',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: '역전(歷戰)',
    title: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    description:
      '고조선부터 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임. 브라우저에서 바로 플레이하세요.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    description:
      '고조선부터 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#0B0B0C',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* 웹폰트: 빌드 시 다운로드하지 않고 런타임에 로드 (오프라인 빌드 대응) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
