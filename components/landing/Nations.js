import Link from 'next/link';
import { NATIONS } from '@/src/config/Nations';
import './nation-flags.css';

export default function Nations() {
  return (
    <section className="section" id="nations">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">NATIONS · 국가</span>
          <h2>당신의 왕국을 고르세요.</h2>
          <p>
            단군조선의 고조선부터 해동성국 발해까지. 한반도 위를 흐른 열한 개
            국가의 색깔을, 전장에서 직접 들고 나가십시오.
          </p>
        </div>

        <div className="nations__grid">
          {NATIONS.map((nation) => (
            <div className="nation-card" key={nation.id}>
              <span
                className={`landing-flag landing-flag--${nation.id}`}
                aria-hidden="true"
              />
              <div>
                <div className="nation-card__name">{nation.name}</div>
                <div className="nation-card__epithet">{nation.epithet}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link href="/play" className="btn btn--ghost">
            국가 선택하고 전쟁 시작하기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
