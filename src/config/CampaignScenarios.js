import { DEFAULT_NATION, findNationById, nationFlagHtml } from './Nations.js';

// allow: SIZE_OK - Static campaign scenario table keeps historical copy together.
export const CAMPAIGN_SCENARIOS = [
  {
    id: 'wanggeom-fortress',
    nationId: 'gojoseon',
    title: '왕검성 최후 방어전',
    battle: '한-고조선 전쟁',
    year: '기원전 108년',
    location: '대동강 유역',
    map: { x: 48, y: 25 },
    opponent: '한 원정군',
    role: '성문 방어 사령관',
    briefing:
      '왕검성의 보급로가 끊겼다. 성벽 아래로 밀려오는 원정군을 늦추고 마지막 금광을 지켜야 한다.',
    objective: '북쪽 성채를 보전하며 적의 공성 거점을 파괴',
    startingResources: { gold: 180, food: 130 },
    wave: { firstDelay: 28, interval: 32, scale: 1.1 },
    startingUnits: [
      { type: 'Archer', count: 2 },
      { type: 'Knight', count: 1 },
    ],
  },
  {
    id: 'salsu-river',
    nationId: 'goguryeo',
    title: '살수 대첩',
    battle: '고구려-수 전쟁',
    year: '612년',
    location: '청천강',
    map: { x: 50, y: 31 },
    opponent: '수 별동대',
    role: '을지문덕의 후방 지휘관',
    briefing:
      '긴 행군으로 지친 적 주력이 강가에 몰렸다. 기동대를 운용해 퇴로와 보급선을 동시에 압박한다.',
    objective: '강변 거점을 지키고 적 주력 격파',
    startingResources: { gold: 220, food: 120 },
    wave: { firstDelay: 24, interval: 30, scale: 1.2 },
    startingUnits: [
      { type: 'Archer', count: 2 },
      { type: 'Cavalry', count: 1 },
    ],
  },
  {
    id: 'hwangsanbeol',
    nationId: 'baekje',
    title: '황산벌 결전',
    battle: '백제-신라 전쟁',
    year: '660년',
    location: '충청남도 논산',
    map: { x: 48, y: 67 },
    opponent: '신라 원정군',
    role: '계백의 결사대장',
    briefing:
      '수적으로 열세인 결사대가 평야 입구를 틀어막았다. 짧은 시간 안에 병영을 세우고 돌파를 저지한다.',
    objective: '소수 정예로 첫 네 차례 공세를 막고 적 성채를 역습',
    startingResources: { gold: 160, food: 120 },
    wave: { firstDelay: 22, interval: 28, scale: 1.25 },
    startingUnits: [
      { type: 'Knight', count: 2 },
      { type: 'Healer', count: 1 },
    ],
  },
  {
    id: 'maeso-fortress',
    nationId: 'silla',
    title: '매소성 전투',
    battle: '나당 전쟁',
    year: '675년',
    location: '경기 북부',
    map: { x: 51, y: 46 },
    opponent: '당 기병대',
    role: '신라 북방군 지휘관',
    briefing:
      '당의 대군이 성 아래로 밀려든다. 포로와 유민까지 편성한 혼성군으로 성문 앞 병참선을 끊어야 한다.',
    objective: '기병 돌파를 막고 적 병영을 불태워 철수로를 열기',
    startingResources: { gold: 210, food: 140 },
    wave: { firstDelay: 30, interval: 34, scale: 1.15 },
    startingUnits: [
      { type: 'Archer', count: 3 },
    ],
  },
  {
    id: 'daegaya-last-stand',
    nationId: 'gaya',
    title: '대가야 최후 방어전',
    battle: '신라의 대가야 정벌',
    year: '562년',
    location: '경상북도 고령',
    map: { x: 61, y: 75 },
    opponent: '신라 남진군',
    role: '철기 동맹 방어대장',
    briefing:
      '고령의 철 생산지가 위협받고 있다. 짧은 보급선과 중무장 보병을 살려 남쪽 진입로를 봉쇄한다.',
    objective: '철광 거점을 지키고 적 선봉 병영을 파괴',
    startingResources: { gold: 240, food: 90 },
    wave: { firstDelay: 26, interval: 31, scale: 1.05 },
    startingUnits: [
      { type: 'Knight', count: 2 },
      { type: 'Cavalry', count: 1 },
    ],
  },
  {
    id: 'okjeo-coast',
    nationId: 'okjeo',
    title: '옥저 해안 방어선',
    battle: '고구려 북동 진출',
    year: '1세기',
    location: '함경도 동해안',
    map: { x: 66, y: 27 },
    opponent: '고구려 징발대',
    role: '해안 곡창 수비장',
    briefing:
      '소금과 어물 창고를 노린 북방 세력이 동해안 길목에 도착했다. 지형을 이용해 징발대를 늦춰야 한다.',
    objective: '해안 보급 창고를 지키며 적의 전초 기지를 제거',
    startingResources: { gold: 170, food: 180 },
    wave: { firstDelay: 32, interval: 36, scale: 1 },
    startingUnits: [
      { type: 'Archer', count: 2 },
      { type: 'Healer', count: 1 },
    ],
  },
  {
    id: 'dongye-forest',
    nationId: 'dongye',
    title: '동예 숲길 매복전',
    battle: '동해안 부족 연맹 방어전',
    year: '1세기',
    location: '강원 북부',
    map: { x: 63, y: 44 },
    opponent: '북방 기동대',
    role: '무천 제천지 수비장',
    briefing:
      '제천 의식이 열리는 계곡으로 적 척후가 접근한다. 숲길을 장악하고 기병의 속도를 꺾어야 한다.',
    objective: '중앙 계곡을 사수하고 적 척후 병영을 제거',
    startingResources: { gold: 185, food: 145 },
    wave: { firstDelay: 30, interval: 34, scale: 1 },
    startingUnits: [
      { type: 'Cavalry', count: 1 },
      { type: 'Archer', count: 2 },
    ],
  },
  {
    id: 'samhan-iron-route',
    nationId: 'samhan',
    title: '삼한 철의 길 방어전',
    battle: '낙동강 철기 교역로 분쟁',
    year: '3세기',
    location: '낙동강 하류',
    map: { x: 58, y: 82 },
    opponent: '주변 성읍 연합군',
    role: '변한 철기 호송대장',
    briefing:
      '철정과 농기구를 실은 행렬이 강변 길목에 묶였다. 성읍 연맹군을 모아 교역로를 다시 연다.',
    objective: '철기 보급로를 확보하고 적 야영지를 밀어내기',
    startingResources: { gold: 230, food: 115 },
    wave: { firstDelay: 27, interval: 33, scale: 1.08 },
    startingUnits: [
      { type: 'Knight', count: 1 },
      { type: 'Archer', count: 2 },
    ],
  },
  {
    id: 'hangpaduri',
    nationId: 'tamna',
    title: '항파두리 최후 항전',
    battle: '삼별초 항쟁',
    year: '1273년',
    location: '제주 항파두리',
    map: { x: 36, y: 94 },
    opponent: '여몽 연합군',
    role: '탐라 성책 지휘관',
    briefing:
      '섬의 마지막 성책에 여몽 연합군이 상륙했다. 바람과 좁은 진입로를 이용해 시간을 벌어야 한다.',
    objective: '섬 성책을 사수하고 상륙 병영을 파괴',
    startingResources: { gold: 190, food: 150 },
    wave: { firstDelay: 25, interval: 30, scale: 1.2 },
    startingUnits: [
      { type: 'Archer', count: 3 },
    ],
  },
  {
    id: 'gwiju',
    nationId: 'goryeo',
    title: '귀주 대첩',
    battle: '고려-거란 전쟁',
    year: '1019년',
    location: '평안북도 구성 일대',
    map: { x: 47, y: 35 },
    opponent: '거란 철기군',
    role: '강감찬 휘하 별동대장',
    briefing:
      '퇴각하는 거란군이 북방 길목으로 몰린다. 매복한 병력을 나눠 선봉과 후미를 동시에 압박한다.',
    objective: '강변 길목을 지키며 적 주력의 퇴로를 차단',
    startingResources: { gold: 230, food: 140 },
    wave: { firstDelay: 23, interval: 29, scale: 1.22 },
    startingUnits: [
      { type: 'Cavalry', count: 2 },
      { type: 'Healer', count: 1 },
    ],
  },
  {
    id: 'myeongnyang',
    nationId: 'joseon',
    title: '명량 해협 결전',
    battle: '임진왜란',
    year: '1597년',
    location: '진도 울돌목',
    map: { x: 39, y: 83 },
    opponent: '일본 수군 지원대',
    role: '조선 수군 육상 지원장',
    briefing:
      '해협의 물살이 적 함대를 붙잡는 동안 육상 지원 거점을 지켜야 한다. 적 상륙대를 성채 밖에서 끊어낸다.',
    objective: '해협 보급 거점을 지키고 적 상륙 병영을 파괴',
    startingResources: { gold: 205, food: 155 },
    wave: { firstDelay: 26, interval: 31, scale: 1.18 },
    startingUnits: [
      { type: 'Archer', count: 2 },
      { type: 'Knight', count: 1 },
    ],
  },
  {
    id: 'tianmenling',
    nationId: 'balhae',
    title: '천문령 돌파전',
    battle: '발해 건국 전투',
    year: '698년',
    location: '북방 산악로',
    map: { x: 69, y: 14 },
    opponent: '주 추격군',
    role: '대조영 휘하 선봉장',
    briefing:
      '고구려 유민과 말갈 병력이 산악로를 넘어 새 거점을 찾아간다. 추격군을 끊고 피난 행렬을 보호한다.',
    objective: '산악 관문을 장악하고 적 추격 병영을 제거',
    startingResources: { gold: 215, food: 135 },
    wave: { firstDelay: 24, interval: 30, scale: 1.16 },
    startingUnits: [
      { type: 'Cavalry', count: 1 },
      { type: 'Archer', count: 2 },
      { type: 'Healer', count: 1 },
    ],
  },
];

export const DEFAULT_CAMPAIGN_SCENARIO = CAMPAIGN_SCENARIOS[1];

export function findCampaignScenarioById(id) {
  return (
    CAMPAIGN_SCENARIOS.find((scenario) => scenario.id === id) ||
    DEFAULT_CAMPAIGN_SCENARIO
  );
}

export function getCampaignNation(scenario) {
  return findNationById(scenario?.nationId || DEFAULT_NATION.id);
}

export function campaignMarkerHtml(scenario) {
  const nation = getCampaignNation(scenario);
  return `
    <button
      type="button"
      class="campaign-marker"
      data-scenario-id="${scenario.id}"
      style="--marker-x: ${scenario.map.x}%; --marker-y: ${scenario.map.y}%; --scenario-accent: ${nation.accent};"
      aria-pressed="false"
      aria-label="${scenario.title} 선택"
    >
      <span class="campaign-marker__pin" aria-hidden="true"></span>
      <span class="campaign-marker__label">${nation.name}</span>
    </button>
  `;
}

export function campaignScenarioSummaryHtml(scenario) {
  const nation = getCampaignNation(scenario);
  return `
    <div class="campaign-detail__eyebrow">역사 캠페인 · ${scenario.battle}</div>
    <div class="campaign-detail__title-row">
      ${nationFlagHtml(nation)}
      <div>
        <h2 id="campaign-scenario-title">${scenario.title}</h2>
        <p>${nation.name} · ${scenario.year} · ${scenario.location}</p>
      </div>
    </div>
    <dl class="campaign-facts">
      <div><dt>상대</dt><dd>${scenario.opponent}</dd></div>
      <div><dt>역할</dt><dd>${scenario.role}</dd></div>
      <div><dt>목표</dt><dd>${scenario.objective}</dd></div>
    </dl>
    <p class="campaign-briefing">${scenario.briefing}</p>
  `;
}
