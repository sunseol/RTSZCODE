export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">FEATURES · 특징</span>
          <h2>설치도, 결제도 없이.</h2>
          <p>
            무겁고 복잡한 게임 클라이언트 대신, 링크 하나면 전쟁터에 들어섭니다.
            가볍되 깊이 있는 전략을 브라우저 안에.
          </p>
        </div>

        <div className="features__grid">
          <article className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="10" width="36" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M20 36v6M28 36v6M14 42h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="23" r="5" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            <h3>브라우저에서 바로</h3>
            <p>
              다운로드나 설치 없이, 링크를 열면 즉시 전장입니다. 어디서든
              접속해 한 판의 전쟁을 치를 수 있습니다.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <path d="M8 34 L18 18 L26 28 L34 14 L42 34 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
                <circle cx="18" cy="18" r="2" fill="currentColor" />
                <circle cx="34" cy="14" r="2" fill="currentColor" />
              </svg>
            </div>
            <h3>절차적 3D 세계</h3>
            <p>
              모든 지형과 건물, 유닛을 코드로 생성합니다. 외부 에셋 없이
              매 판 다르게 펼쳐지는 로우폴리 전장을 렌더링합니다.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <path d="M24 6 L30 18 L43 20 L33 29 L36 42 L24 35 L12 42 L15 29 L5 20 L18 18 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
              </svg>
            </div>
            <h3>깊이 있는 RTS 전략</h3>
            <p>
              자원 채집, 건설, 병력 생산, 공수의 균형. 단순한 클릭 게임이
              아닌, 전략가의 머리를 쓰게 만드는 실시간 전쟁 시뮬레이션.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <path d="M24 6v36M6 24h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 14 L24 6 L34 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 34 L24 42 L34 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>역사를 체화하다</h3>
            <p>
              고구려·백제·신라의 이름과 정체성을 전장에서 마주합니다. 즐기면서
              자연스럽게 한국 고대사의 맥을 익히는 교육적 경험.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
