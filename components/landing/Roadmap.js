import Link from 'next/link';
import { Taegeuk } from './Dancheong';

export default function Roadmap() {
  return (
    <section className="section" id="roadmap">
      <div className="container">
        <div className="roadmap">
          <div className="roadmap__corner" aria-hidden="true">
            <Taegeuk size={140} />
          </div>

          <div className="roadmap__status">
            <span className="dot" />
            개발 진행 중 · EARLY ACCESS
          </div>

          <h2>
            지금은 미완성.
            <br />
            함께 만들 분을 찾습니다.
          </h2>

          <p>
            역전(歷戰)은 아직 초기 단계입니다. 핵심 전투 시스템은 이미 작동하지만,
            더 많은 국가의 고유 유닛, 역사적 시나리오, 교육 콘텐츠가 더해져야
            합니다. 이 여정에 함께해줄 플레이어를 기다립니다.
          </p>

          <ul className="roadmap__list">
            <li className="done">11개 한국 고대 국가 선택 시스템</li>
            <li className="done">3D 실시간 전투 — 자원·건설·유닛 생산</li>
            <li className="done">브라우저 무설치 플레이</li>
            <li>국가별 고유 유닛과 특성 (예정)</li>
            <li>역사적 전투 시나리오 모드 (예정)</li>
            <li>교육용 백과사전 연동 (예정)</li>
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Link href="/play" className="btn btn--primary">
              지금 플레이해보기 →
            </Link>
            <a
              href="#community"
              className="btn btn--ghost"
            >
              소식 받기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
