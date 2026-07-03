import { Game } from './Game.js';

// 진입점 — 캔버스 설정, 시작 버튼 처리, 게임 인스턴스 생성
const canvas = document.getElementById('game-canvas');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');

let game = null;

// 우클릭 메뉴(컨텍스트 메뉴)만 차단.
// 주의: 브라우저의 "마우스 제스처(우클릭 드래그로 뒤로가기)"는 pointerdown/mousedown의
// preventDefault로는 막을 수 없고, 오히려 게임의 mousedown 입력을 깨먹을 뿐이다.
// 제스처는 CSS overscroll-behavior와 브라우저 설정으로만 완화 가능하다.
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function startGame() {
  if (!game) {
    game = new Game(canvas);
  }
  overlay.classList.add('fade');
  // 페이드 후 완전 숨김
  setTimeout(() => { overlay.style.display = 'none'; }, 500);
  game.start();
}

startBtn.addEventListener('click', startGame);

// 스페이스/엔터로도 시작
window.addEventListener('keydown', (e) => {
  if (!game && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
  }
});
