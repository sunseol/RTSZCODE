import Link from 'next/link';
import { DancheongFlower } from './Dancheong';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__bg" aria-hidden="true" />

      {/* 우측 세로 한글 장식 */}
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        <span className="vertical-han">學而時習之</span>
      </div>

      <div className="hero__inner">
        <div className="hero__badge">
          <span className="dot" />
          얼리 액세스 · 개발 중
        </div>

        <h1 className="hero__title">
          한국 역사를,
          <br />
          직접 <em>싸워</em>보세요.
        </h1>

        <p className="hero__sub">
          고조선부터 발해까지. 교과서 너머의 역사를 직접 전장에서 체험하는
          실시간 전략 게임. 읽고 외우는 역사가 아니라, 싸우고 부딪으며 익히는
          역사. 브라우저에서 바로 시작합니다.
        </p>

        <div className="hero__actions">
          <Link href="/play" className="btn btn--primary">
            게임 시작하기 →
          </Link>
          <a href="#concept" className="btn btn--ghost">
            더 알아보기
          </a>
        </div>

        <div className="hero__meta">
          <div>
            <strong>12</strong>
            <span>한국 고대 국가</span>
          </div>
          <div>
            <strong>3D</strong>
            <span>실시간 전략</span>
          </div>
          <div>
            <strong>0₩</strong>
            <span>무료 · 설치 없음</span>
          </div>
        </div>
      </div>

      {/* 좌측 하단 단청 장식 */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 40,
          opacity: 0.5,
          zIndex: 1,
          color: 'var(--dancheong-gold)',
        }}
        aria-hidden="true"
      >
        <DancheongFlower size={56} />
      </div>
    </section>
  );
}
