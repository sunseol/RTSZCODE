import { Game } from './Game.js';
import { DEFAULT_NATION, NATIONS, findNationById, nationFlagHtml } from './config/Nations.js';
import {
  CAMPAIGN_SCENARIOS,
  DEFAULT_CAMPAIGN_SCENARIO,
  campaignMarkerHtml,
  campaignScenarioSummaryHtml,
  findCampaignScenarioById,
  getCampaignNation,
} from './config/CampaignScenarios.js';

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
  const nationStartPanel = getGameElement('nation-start-panel');
  const campaignModeBtn = getGameElement('campaign-mode-btn');
  const campaignMapPanel = getGameElement('campaign-map-panel');
  const campaignMarkers = getGameElement('campaign-markers');
  const campaignDetail = getGameElement('campaign-detail');
  const campaignBackBtn = getGameElement('campaign-back-btn');
  const campaignStartBtn = getGameElement('campaign-start-btn');

  let game = null;
  let overlayTimer = null;
  let isCampaignPanelOpen = false;
  let selectedNation = findNationById(
    localStorage.getItem('rtszcode:nation') || DEFAULT_NATION.id
  );
  let selectedScenario = findCampaignScenarioById(
    localStorage.getItem('rtszcode:campaign') || DEFAULT_CAMPAIGN_SCENARIO.id
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

  function renderCampaignMarkers() {
    campaignMarkers.innerHTML = CAMPAIGN_SCENARIOS.map(campaignMarkerHtml).join('');
  }

  function selectCampaignScenario(id, syncNation = false) {
    selectedScenario = findCampaignScenarioById(id);
    const scenarioNation = getCampaignNation(selectedScenario);
    localStorage.setItem('rtszcode:campaign', selectedScenario.id);
    if (syncNation) selectNation(scenarioNation.id);
    campaignDetail.innerHTML = campaignScenarioSummaryHtml(selectedScenario);
    campaignMapPanel.style.setProperty('--scenario-accent', scenarioNation.accent);
    for (const marker of campaignMarkers.querySelectorAll('.campaign-marker')) {
      const selected = marker.dataset.scenarioId === selectedScenario.id;
      marker.classList.toggle('selected', selected);
      marker.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
  }

  function showCampaignPanel() {
    isCampaignPanelOpen = true;
    nationStartPanel.classList.add('hidden');
    campaignMapPanel.classList.remove('hidden');
    campaignStartBtn.focus();
  }

  function showNationPanel() {
    isCampaignPanelOpen = false;
    campaignMapPanel.classList.add('hidden');
    nationStartPanel.classList.remove('hidden');
    campaignModeBtn.focus();
  }

  function startGame(campaignScenario = null) {
    if (game?.running) return;
    if (!game) {
      game = new Game(canvas, { playerNation: selectedNation, campaignScenario });
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
  const handleCampaignModeClick = () => showCampaignPanel();
  const handleCampaignBackClick = () => showNationPanel();
  const handleCampaignStartClick = () => {
    selectNation(getCampaignNation(selectedScenario).id);
    startGame(selectedScenario);
  };
  const handleCampaignMarkerClick = (event) => {
    const button = event.target.closest('.campaign-marker');
    if (button) selectCampaignScenario(button.dataset.scenarioId, true);
  };
  const handleWindowKeydown = (event) => {
    if (document.activeElement?.closest('button, a, #nation-options')) return;
    if (!game && !isCampaignPanelOpen && (event.key === ' ' || event.key === 'Enter')) {
      startGame();
    }
  };

  canvas.addEventListener('contextmenu', handleContextMenu);
  nationOptions.addEventListener('click', handleNationClick);
  startBtn.addEventListener('click', handleStartClick);
  campaignModeBtn.addEventListener('click', handleCampaignModeClick);
  campaignBackBtn.addEventListener('click', handleCampaignBackClick);
  campaignStartBtn.addEventListener('click', handleCampaignStartClick);
  campaignMarkers.addEventListener('click', handleCampaignMarkerClick);
  window.addEventListener('keydown', handleWindowKeydown);

  renderNationOptions();
  renderCampaignMarkers();
  selectNation(selectedNation.id);
  selectCampaignScenario(selectedScenario.id);

  return () => {
    canvas.removeEventListener('contextmenu', handleContextMenu);
    nationOptions.removeEventListener('click', handleNationClick);
    startBtn.removeEventListener('click', handleStartClick);
    campaignModeBtn.removeEventListener('click', handleCampaignModeClick);
    campaignBackBtn.removeEventListener('click', handleCampaignBackClick);
    campaignStartBtn.removeEventListener('click', handleCampaignStartClick);
    campaignMarkers.removeEventListener('click', handleCampaignMarkerClick);
    window.removeEventListener('keydown', handleWindowKeydown);
    if (overlayTimer) window.clearTimeout(overlayTimer);
    if (game) {
      game.running = false;
      game.renderer.dispose();
    }
  };
}
