import { Game } from './Game.js';
import { DEFAULT_NATION, NATIONS, findNationById, nationFlagHtml } from './config/Nations.js';

function getGameElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing game element: #${id}`);
  }
  return element;
}

export function bootGame() {
  const canvas = getGameElement('game-canvas');
  const startBtn = getGameElement('start-btn');
  const overlay = getGameElement('overlay');
  const nationOptions = getGameElement('nation-options');
  const nationPreview = getGameElement('selected-nation-preview');
  const selectedNationCopy = getGameElement('selected-nation-copy');

  let game = null;
  let overlayTimer = null;
  let selectedNation = findNationById(
    localStorage.getItem('rtszcode:nation') || DEFAULT_NATION.id
  );

  function renderNationOptions() {
    nationOptions.innerHTML = NATIONS.map((nation) => `
      <button type="button" class="nation-option" data-nation-id="${nation.id}" aria-pressed="false">
        ${nationFlagHtml(nation)}
        <span class="nation-name">${nation.name}</span>
        <span class="nation-epithet">${nation.epithet}</span>
      </button>
    `).join('');
  }

  function selectNation(id) {
    selectedNation = findNationById(id);
    localStorage.setItem('rtszcode:nation', selectedNation.id);
    document.documentElement.style.setProperty('--nation-accent', selectedNation.accent);
    nationPreview.innerHTML = `${nationFlagHtml(selectedNation, 'nation-flag--large')}<strong>${selectedNation.name}</strong>`;
    selectedNationCopy.textContent = `${selectedNation.name} · ${selectedNation.epithet}`;
    for (const button of nationOptions.querySelectorAll('.nation-option')) {
      const selected = button.dataset.nationId === selectedNation.id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
  }

  function startGame() {
    if (game?.running) return;
    if (!game) {
      game = new Game(canvas, { playerNation: selectedNation });
    }
    overlay.classList.add('fade');
    overlayTimer = window.setTimeout(() => {
      if (!game.gameOver && overlay.classList.contains('fade')) {
        overlay.style.display = 'none';
      }
    }, 500);
    game.start();
  }

  const handleContextMenu = (event) => event.preventDefault();
  const handleNationClick = (event) => {
    const button = event.target.closest('.nation-option');
    if (button) selectNation(button.dataset.nationId);
  };
  const handleStartClick = () => startGame();
  const handleWindowKeydown = (event) => {
    if (document.activeElement && document.activeElement.closest('#nation-options')) return;
    if (!game && (event.key === ' ' || event.key === 'Enter')) {
      startGame();
    }
  };

  canvas.addEventListener('contextmenu', handleContextMenu);
  nationOptions.addEventListener('click', handleNationClick);
  startBtn.addEventListener('click', handleStartClick);
  window.addEventListener('keydown', handleWindowKeydown);

  renderNationOptions();
  selectNation(selectedNation.id);

  return () => {
    canvas.removeEventListener('contextmenu', handleContextMenu);
    nationOptions.removeEventListener('click', handleNationClick);
    startBtn.removeEventListener('click', handleStartClick);
    window.removeEventListener('keydown', handleWindowKeydown);
    if (overlayTimer) window.clearTimeout(overlayTimer);
    if (game) {
      game.running = false;
      game.renderer.dispose();
    }
  };
}
