import Hero from '@/components/landing/Hero';
import Concept from '@/components/landing/Concept';
import Nations from '@/components/landing/Nations';
import Features from '@/components/landing/Features';
import Roadmap from '@/components/landing/Roadmap';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { DancheongFlower } from '@/components/landing/Dancheong';
import './landing-full.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://medieval-rts.vercel.app';

// 구조화 데이터 — VideoGame 스키마 (SEO)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: '역전(歷戰) — 중세 왕국 전쟁',
  alternateName: '한국 역사를 직접 싸우며 배우는 3D RTS',
  description:
    '고조선부터 발해까지, 한국 고대사를 직접 전장에서 체험하는 실시간 전략 게임. 브라우저에서 바로 플레이하세요.',
  genre: ['Real-time strategy (RTS)', 'Educational', 'Historical'],
  gamePlatform: ['Web browser'],
  applicationCategory: 'Game',
  operatingSystem: 'Any (Web)',
  url: siteUrl,
  playMode: 'SinglePlayer',
  inLanguage: 'ko-KR',
  publisher: { '@type': 'Organization', name: '역전(歷戰) 팀' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
    availability: 'https://schema.org/InStock',
  },
  playStatus: 'https://schema.org/InDevelopment',
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="nav">
        <a href="/" className="nav__brand">
          역전 <small>歷戰</small>
        </a>
        <div className="nav__links">
          <a href="#concept">컨셉</a>
          <a href="#nations">국가</a>
          <a href="#features">특징</a>
          <a href="#roadmap">로드맵</a>
          <a href="/play" className="nav__cta">
            게임하기
          </a>
        </div>
      </nav>

      <main>
        <Hero />
        <Concept />

        {/* 단청 구분 장식 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 0',
            opacity: 0.5,
            color: 'var(--dancheong-gold)',
          }}
          aria-hidden="true"
        >
          <DancheongFlower size={32} />
        </div>

        <Nations />
        <Features />
        <Roadmap />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
