import * as THREE from 'three';
import { nationFlagHtml } from '../config/Nations.js';

// HUD — 자원 표시, 성 체력, 선택 정보, 명령 마커
export class HUD {
  constructor(game) {
    this.game = game;
    this.goldEl = document.getElementById('gold-amount');
    this.foodEl = document.getElementById('food-amount');
    this.waveInfoEl = document.getElementById('wave-info');
    this.nationBadgeEl = document.getElementById('nation-badge');
    this.waveTimerEl = document.getElementById('wave-timer');
    this.playerCastleBar = document.getElementById('player-castle-bar');
    this.enemyCastleBar = document.getElementById('enemy-castle-bar');
    this.selInfo = document.getElementById('selection-info');
    this.selSummary = document.getElementById('selection-summary');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.worldHalfSize = 80;

    this.markers = [];
    this.updateNationBadge();
  }

  updateNationBadge() {
    if (!this.nationBadgeEl || !this.game.playerNation) return;
    const nation = this.game.playerNation;
    this.nationBadgeEl.innerHTML = `${nationFlagHtml(nation, 'nation-flag--tiny')}<span>${nation.name}</span>`;
  }

  update() {
    // 자원
    this.goldEl.textContent = Math.floor(this.game.resources.get('player', 'gold'));
    this.foodEl.textContent = Math.floor(this.game.resources.get('player', 'food'));
    this.waveInfoEl.textContent = `웨이브 ${this.game.enemyAI.waveNumber + 1}`;
    this.waveTimerEl.textContent = Math.max(0, Math.ceil(this.game.enemyAI.waveTimer));

    // 성 체력바
    if (this.game.playerCastle) {
      const r = this.game.playerCastle.hp / this.game.playerCastle.maxHp;
      this.playerCastleBar.style.width = (r * 100) + '%';
    }
    if (this.game.enemyCastle) {
      const r = this.game.enemyCastle.hp / this.game.enemyCastle.maxHp;
      this.enemyCastleBar.style.width = (r * 100) + '%';
    }
    this.updateMinimap();
  }

  updateSelection() {
    const sel = this.game.selection.selected;
    if (sel.length === 0) {
      this.selInfo.classList.add('hidden');
      return;
    }
    this.selInfo.classList.remove('hidden');

    // 유닛 종류별 카운트
    const counts = {};
    for (const e of sel) {
      const name = e.constructor.name;
      counts[name] = (counts[name] || 0) + 1;
    }
    const labelMap = {
      Knight: '🗡️ 기사',
      Archer: '🏹 궁수',
      Cavalry: '🐎 기병',
      Healer: '✨ 치료사',
      Villager: '🧑‍🌾 주민',
      Castle: '🏰 성',
      Barracks: '⚒️ 병영',
      Farm: '🌾 농장',
      WatchTower: '🛡️ 감시탑',
    };
    let html = '';
    for (const [name, count] of Object.entries(counts)) {
      html += `<div class="unit-line"><span>${labelMap[name] || name}</span><span class="count">×${count}</span></div>`;
    }
    // 단일 유닛이면 체력 표시
    if (sel.length === 1) {
      const e = sel[0];
      html += `<div class="unit-line"><span>체력</span><span class="count">${Math.ceil(e.hp)}/${e.maxHp}</span></div>`;
    }
    this.selSummary.innerHTML = html;
  }

  // 우클릭 명령 위치에 잠깐 나타나는 마커 (명령 종류별 색상)
  // type: 'move' (초록), 'attack' (빨강), 'gather' (노랑)
  flashCommandMarker(worldPoint, type = 'move') {
    const colors = { move: 0x66ff66, attack: 0xff4444, gather: 0xffd54a, heal: 0x9dff8a };
    const color = colors[type] || colors.move;
    const geo = new THREE.RingGeometry(0.6, 1.0, 24);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.9, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(worldPoint.x, worldPoint.y + 0.15, worldPoint.z);
    this.game.scene.add(ring);
    this.markers.push({ mesh: ring, life: 0.6 });
  }

  updateMarkers(dt) {
    for (let i = this.markers.length - 1; i >= 0; i--) {
      const m = this.markers[i];
      m.life -= dt;
      m.mesh.material.opacity = Math.max(0, m.life / 0.6) * 0.9;
      m.mesh.scale.setScalar(1 + (0.6 - m.life) * 1.5);
      if (m.life <= 0) {
        this.game.scene.remove(m.mesh);
        m.mesh.geometry.dispose();
        m.mesh.material.dispose();
        this.markers.splice(i, 1);
      }
    }
  }

  updateMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1f3421';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 220, 160, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const p = (w / 4) * i;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, h);
      ctx.moveTo(0, p);
      ctx.lineTo(w, p);
      ctx.stroke();
    }

    for (const mine of this.game.goldMines) {
      if (mine.alive) this._drawMinimapPoint(mine, '#ffd54a', 2.4);
    }
    for (const building of this.game.buildings) {
      if (!building.alive) continue;
      const color = building.team === 'player' ? '#5fb8ff' : '#ff6b5b';
      this._drawMinimapPoint(building, color, building.isBuilding ? 3.2 : 2.4);
    }
    for (const unit of this.game.units) {
      if (!unit.alive) continue;
      const color = unit.team === 'player' ? '#8cff78' : '#ff4a4a';
      this._drawMinimapPoint(unit, color, unit.isSupport ? 2.4 : 2);
    }

    const target = this.game.rtsCamera.target;
    const p = this._worldToMinimap(target.x, target.z);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x - 4, p.y - 4, 8, 8);
  }

  _drawMinimapPoint(entity, color, size) {
    const p = this._worldToMinimap(entity.x, entity.z);
    const ctx = this.minimapCtx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
    if (entity.selected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _worldToMinimap(x, z) {
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const nx = (x + this.worldHalfSize) / (this.worldHalfSize * 2);
    const nz = (z + this.worldHalfSize) / (this.worldHalfSize * 2);
    return {
      x: Math.max(0, Math.min(w, nx * w)),
      y: Math.max(0, Math.min(h, nz * h)),
    };
  }
}
