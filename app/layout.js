import './globals.css';
import Analytics from '@/components/Analytics';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medieval-rts.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    template: '%s | 역전(歷戰)',
  },
  description:
    '고조선부터 탐라와 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임. 브라우저에서 바로, 역사를 살아보세요. 지금 얼리 액세스로 개발 중.',
  applicationName: '역전(歷戰)',
  category: 'games',
  keywords: [
    '한국 역사 게임',
    '역사 게임',
    '한국사',
    '고구려',
    '백제',
    '신라',
    '고조선',
    '탐라',
    '발해',
    'RTS',
    '실시간 전략 게임',
    '3D 게임',
    'Three.js',
    '교육 게임',
  ],
  authors: [{ name: '역전(歷戰) 팀' }],
  creator: '역전(歷戰)',
  publisher: '역전(歷戰) 팀',
  alternates: {
    canonical: '/',
    // 단일 한국어 사이트 — hreflang 자기 참조로 언어 명시
    languages: {
      'ko-KR': '/',
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: '역전(歷戰)',
    title: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    description:
      '고조선부터 탐라와 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임. 브라우저에서 바로 플레이하세요.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '역전(歷戰) — 한국 역사를 직접 싸우며 배우는 3D RTS',
    description:
      '고조선부터 탐라와 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임.',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    // ▼▼▼ Google Search Console 소유권 인증 코드 입력 (콘솔에서 발급) ▼▼▼
    google: '',
    other: {
      // ▼▼▼ 네이버 서치어드바이저(웹마스터도구) 사이트 인증 코드 입력 ▼▼▼
      'naver-site-verification': '',
    },
  },
};

export const viewport = {
  themeColor: '#0B0B0C',
  colorScheme: 'dark',
};

// 사이트 전역 구조화 데이터 — WebSite + Organization (검색엔진 엔티티 인식)
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '역전(歷戰)',
  alternateName: '역전',
  url: siteUrl,
  inLanguage: 'ko-KR',
  publisher: { '@type': 'Organization', name: '역전(歷戰) 팀' },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '역전(歷戰) 팀',
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="zalo-platform-site-verification"
          content="PTwSDg_FFJzM-f8MqSGx6mZLe2FaetfvCp8t"
        />
        {/* 웹폰트: 빌드 시 다운로드하지 않고 런타임에 로드 (오프라인 빌드 대응) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
