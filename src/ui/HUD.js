import * as THREE from 'three';

// HUD — 자원 표시, 성 체력, 선택 정보, 명령 마커
export class HUD {
  constructor(game) {
    this.game = game;
    this.goldEl = document.getElementById('gold-amount');
    this.foodEl = document.getElementById('food-amount');
    this.waveInfoEl = document.getElementById('wave-info');
    this.waveTimerEl = document.getElementById('wave-timer');
    this.playerCastleBar = document.getElementById('player-castle-bar');
    this.enemyCastleBar = document.getElementById('enemy-castle-bar');
    this.selInfo = document.getElementById('selection-info');
    this.selSummary = document.getElementById('selection-summary');

    this.markers = [];
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
      Villager: '🧑‍🌾 주민',
      Castle: '🏰 성',
      Barracks: '⚒️ 병영',
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
    const colors = { move: 0x66ff66, attack: 0xff4444, gather: 0xffd54a };
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
}
