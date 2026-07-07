'use client';

import { useEffect, useState } from 'react';

export default function GameView() {
  const [isBooted, setIsBooted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let disposeGame = () => {};

    import('../src/main.js')
      .then(({ bootGame }) => {
        if (cancelled) return;
        disposeGame = bootGame();
        setIsBooted(true);
      })
      .catch((err) => {
        console.error('게임 로드 실패:', err);
      });

    return () => {
      cancelled = true;
      disposeGame();
    };
  }, []);

  return (
    <div id="game-container" aria-busy={!isBooted}>
      <canvas id="game-canvas"></canvas>

      {/* 좌측 상단: 자원 HUD */}
      <div id="resource-hud" className="hud-panel">
        <div id="nation-badge" className="nation-badge"></div>
        <div className="resource">
          <span className="icon gold" aria-hidden="true">
            금
          </span>
          <span id="gold-amount">0</span>
        </div>
        <div className="resource">
          <span className="icon food" aria-hidden="true">
            식
          </span>
          <span id="food-amount">0</span>
        </div>
        <div className="resource">
          <span className="icon wave" aria-hidden="true">
            파
          </span>
          <span id="wave-info">웨이브 1</span>
        </div>
      </div>

      {/* 우측 상단: 승패/시간 */}
      <div id="status-hud" className="hud-panel">
        <div className="castle-hp">
          <span>내 성</span>
          <div className="bar">
            <div id="player-castle-bar" className="fill player"></div>
          </div>
        </div>
        <div className="castle-hp">
          <span>적 성</span>
          <div className="bar">
            <div id="enemy-castle-bar" className="fill enemy"></div>
          </div>
        </div>
        <div id="next-wave">
          다음 웨이브: <span id="wave-timer">30</span>s
        </div>
      </div>

      {/* 우측 하단: 건물 선택 시 생산 메뉴 */}
      <div id="build-menu" className="hud-panel hidden">
        <div className="menu-title" id="build-menu-title">
          선택됨
        </div>
        <div id="build-buttons"></div>
      </div>

      {/* 좌측 하단: 선택된 유닛 정보 */}
      <div id="selection-info" className="hud-panel hidden">
        <div id="selection-summary"></div>
      </div>

      <div id="minimap" className="hud-panel">
        <div className="minimap-title">미니맵</div>
        <canvas id="minimap-canvas" width="168" height="168"></canvas>
      </div>

      <div id="campaign-hud" className="hud-panel hidden">
        <span id="campaign-hud-label">역사 캠페인</span>
        <strong id="campaign-hud-title"></strong>
        <span id="campaign-hud-objective"></span>
      </div>

      {/* 드래그 선택 박스 */}
      <div id="drag-box"></div>

      {/* 안내 */}
      <div id="hint" className="hud-panel">
        드래그: 선택 · 더블클릭: 같은 유닛 선택 · 우클릭:
        이동/공격/치료/채집 · B/F/T: 건설 · WASD/모서리: 카메라 · 휠: 줌
      </div>

      {/* 시작 / 종료 화면 */}
      <div id="overlay" className="overlay">
        <div className="overlay-content">
          <div id="nation-start-panel">
            <h1>중세 왕국 전쟁</h1>
            <p>
              적의 성을 파괴하라. 정기적인 웨이브를 막아내며 병력을 키우세요.
            </p>
            <section className="settings-panel" aria-labelledby="settings-title">
              <div className="settings-heading">
                <div>
                  <h2 id="settings-title">시작 설정</h2>
                  <p id="selected-nation-copy">국가를 선택하세요</p>
                </div>
                <div
                  id="selected-nation-preview"
                  className="selected-nation-preview"
                ></div>
              </div>
              <div
                id="nation-options"
                className="nation-options"
                role="group"
                aria-label="국가 선택"
              ></div>
            </section>
            <div className="start-actions">
              <button type="button" id="start-btn">
                전쟁 시작
              </button>
              <button type="button" id="campaign-mode-btn" className="mode-btn">
                역사 캠페인 모드
              </button>
            </div>
            <ul>
              <li>
                <b>주민</b> 선택 후 금광 우클릭 - 금 채집
              </li>
              <li>성에서 주민 생산 (금 30, 식량 10)</li>
              <li>
                주민 선택 후 <b>B/F/T</b> 또는 건설 버튼 - 병영/농장/감시탑
                건설
              </li>
              <li>병영에서 기사/궁수/기병, 성에서 주민/치료사 생산</li>
            </ul>
            <p className="back-link">
              <a href="/">랜딩으로 돌아가기</a>
            </p>
          </div>

          <section
            id="campaign-map-panel"
            className="campaign-map-panel hidden"
            aria-labelledby="campaign-map-title"
          >
            <div className="campaign-heading">
              <span className="campaign-kicker">역사 캠페인</span>
              <h1 id="campaign-map-title">한반도 전투 지도</h1>
              <p>
                국가와 연결된 전투 지점을 선택하고, 해당 시나리오의 지휘관으로
                전장에 들어갑니다.
              </p>
            </div>
            <div className="campaign-layout">
              <div className="campaign-map-frame">
                <img
                  src="/korean-peninsula-campaign-map.png"
                  alt="한반도 역사 캠페인 지도"
                  className="campaign-map-image"
                  width="1024"
                  height="1536"
                />
                <div
                  id="campaign-markers"
                  className="campaign-markers"
                  role="group"
                  aria-label="역사 전투 지점"
                ></div>
              </div>
              <aside
                id="campaign-detail"
                className="campaign-detail"
                aria-live="polite"
              ></aside>
            </div>
            <div className="campaign-actions">
              <button type="button" id="campaign-back-btn" className="mode-btn">
                국가 선택으로 돌아가기
              </button>
              <button type="button" id="campaign-start-btn">
                해당 시나리오 경험하기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
