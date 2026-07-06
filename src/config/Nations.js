export const NATIONS = [
  { id: 'gojoseon', name: '고조선', epithet: '새벽의 성곽', accent: '#d8b15f' },
  { id: 'goguryeo', name: '고구려', epithet: '북방의 철기', accent: '#d34b38' },
  { id: 'baekje', name: '백제', epithet: '강과 바다', accent: '#a979d9' },
  { id: 'silla', name: '신라', epithet: '황금의 왕도', accent: '#d8b737' },
  { id: 'gaya', name: '가야', epithet: '철의 동맹', accent: '#9a6a3a' },
  { id: 'okjeo', name: '옥저', epithet: '동해의 곡창', accent: '#54a8c8' },
  { id: 'dongye', name: '동예', epithet: '숲의 제천', accent: '#5ea05c' },
  { id: 'samhan', name: '삼한', epithet: '세 들의 연맹', accent: '#d8a63a' },
  { id: 'tamna', name: '탐라', epithet: '바람의 섬왕국', accent: '#2f9d8f' },
  { id: 'goryeo', name: '고려', epithet: '청자의 왕조', accent: '#4f8ec8' },
  { id: 'joseon', name: '조선', epithet: '궁궐과 활', accent: '#c94545' },
  { id: 'balhae', name: '발해', epithet: '해동성국', accent: '#3b9c8f' },
];

export const DEFAULT_NATION = NATIONS[1];

export function findNationById(id) {
  return NATIONS.find((nation) => nation.id === id) || DEFAULT_NATION;
}

export function nationFlagHtml(nation, extraClass = '') {
  return `<span class="nation-flag nation-flag--${nation.id} ${extraClass}" aria-hidden="true"></span>`;
}
