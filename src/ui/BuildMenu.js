import { BUILD_OPTIONS } from '../systems/BuildSystem.js';

// 건설/생산 메뉴 — 선택 대상에 따라 다른 패널 표시
//  - 건물 선택: 유닛 생산 옵션 + 대기열(queue) 슬롯 + 진행률
//  - 주민 선택: 건물 건설 옵션
export class BuildMenu {
  constructor(game) {
    this.game = game;
    this.panel = document.getElementById('build-menu');
    this.titleEl = document.getElementById('build-menu-title');
    this.buttonsEl = document.getElementById('build-buttons');
    this.currentEntity = null;
    this.mode = null; // 'production' | 'build'
  }

  show(entity) {
    if (entity && entity.getProductionOptions) {
      // 건물 → 생산 모드
      this.currentEntity = entity;
      this.mode = 'production';
      const labelMap = { Castle: '🏰 성', Barracks: '⚒️ 병영' };
      this.titleEl.textContent = labelMap[entity.constructor.name] || entity.constructor.name;
      this._renderProduction();
    } else if (entity && entity.isWorker && entity.team === 'player') {
      // 주민 → 건설 모드
      this.currentEntity = entity;
      this.mode = 'build';
      this.titleEl.textContent = '🧑‍🌾 건설 가능';
      this._renderBuildOptions();
    } else {
      this.hide();
      return;
    }
    this.panel.classList.remove('hidden');
  }

  hide() {
    this.currentEntity = null;
    this.mode = null;
    this.panel.classList.add('hidden');
  }

  // ===== 생산 모드 (건물 선택 시) =====
  _renderProduction() {
    if (!this.currentEntity) return;
    const opts = this.currentEntity.getProductionOptions();
    this.buttonsEl.innerHTML = '';

    // 생산 버튼들
    opts.forEach((opt, idx) => {
      const btn = this._makeButton(opt, () => {
        if (!this.currentEntity || !this.currentEntity.alive) return;
        this.currentEntity.queueUnit(opt.unitClass);
        this._flashButton(btn);
      });
      btn._cost = opt.cost;
      this.buttonsEl.appendChild(btn);
    });

    // 대기열 표시 영역
    const queueHeader = document.createElement('div');
    queueHeader.style.cssText = 'font-size:11px;color:#c9b896;margin-top:8px;border-top:1px solid #4a3520;padding-top:6px;';
    queueHeader.textContent = '생산 대기열';
    this.buttonsEl.appendChild(queueHeader);

    const queueRow = document.createElement('div');
    queueRow.id = 'queue-slots';
    queueRow.style.cssText = 'display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;';
    this.buttonsEl.appendChild(queueRow);

    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'height:4px;background:#1a120a;border-radius:2px;margin-top:6px;overflow:hidden;';
    const progressFill = document.createElement('div');
    progressFill.id = 'production-progress';
    progressFill.style.cssText = 'height:100%;width:0;background:linear-gradient(90deg,#ffd54a,#ff8a5b);transition:width 0.1s;';
    progressBar.appendChild(progressFill);
    this.buttonsEl.appendChild(progressBar);
  }

  // ===== 건설 모드 (주민 선택 시) =====
  _renderBuildOptions() {
    this.buttonsEl.innerHTML = '';
    const villageHasBarracks = this.game.buildings.some(
      (b) => b.team === 'player' && b.constructor.name === 'Barracks'
    );

    BUILD_OPTIONS.forEach((opt) => {
      const btn = this._makeButton(opt, () => {
        if (!this.currentEntity || !this.currentEntity.alive) return;
        this.game.build.enterPlacement(opt.key);
        this._flashButton(btn);
      });
      btn._cost = opt.cost;
      // 이미 병영이 있으면 비활성화는 아님 (여러 개 지을 수 있음) — 비용만 표시
      this.buttonsEl.appendChild(btn);
    });

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:#8a7a5a;margin-top:8px;line-height:1.5;';
    hint.innerHTML = '💡 건설 위치를 클릭하세요<br/>ESC: 취소';
    this.buttonsEl.appendChild(hint);
  }

  _makeButton(opt, onClick) {
    const btn = document.createElement('button');
    btn.className = 'build-btn';
    const costStr = `🪙${opt.cost.gold || 0}${opt.cost.food ? ' 🍖' + opt.cost.food : ''}`;
    const desc = opt.desc || opt.name;
    btn.innerHTML = `${opt.icon || '🔨'} ${opt.name} <span class="cost">${costStr}</span>`;
    btn.title = desc;
    btn.addEventListener('click', onClick);
    return btn;
  }

  _flashButton(btn) {
    btn.style.background = 'linear-gradient(180deg, #2f5e22, #1f3e15)';
    setTimeout(() => { btn.style.background = ''; }, 150);
  }

  // 매 프레임 갱신
  update() {
    if (!this.currentEntity || !this.currentEntity.alive) {
      this.hide();
      return;
    }
    if (this.mode === 'production') {
      this._updateProduction();
    } else if (this.mode === 'build') {
      this._updateBuild();
    }
  }

  _updateProduction() {
    // 비용에 따라 버튼 활성/비활성 갱신
    const buttons = this.buttonsEl.querySelectorAll('.build-btn');
    buttons.forEach((b) => {
      if (b._cost) b.disabled = !this.game.resources.canAfford('player', b._cost);
    });

    // 대기열 슬롯 갱신
    const queueRow = document.getElementById('queue-slots');
    if (queueRow) {
      const e = this.currentEntity;
      const items = [];
      if (e.currentProduction) items.push(e.currentProduction);
      items.push(...e.productionQueue);
      queueRow.innerHTML = '';
      const labelMap = { Knight: '🗡️', Archer: '🏹', Villager: '🧑‍🌾' };
      for (let i = 0; i < Math.max(items.length, 1); i++) {
        const slot = document.createElement('div');
        slot.style.cssText =
          `width:34px;height:34px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:18px;` +
          `border:1px solid ${i === 0 && e.currentProduction ? '#ffd54a' : '#4a3520'};` +
          `background:${i === 0 && e.currentProduction ? 'rgba(255,213,74,0.15)' : 'rgba(20,14,8,0.5)'};`;
        const cls = items[i];
        slot.textContent = cls ? (labelMap[cls.name] || '⚒️') : (i === 0 ? '—' : '');
        queueRow.appendChild(slot);
      }
    }

    // 진행률 바
    const fill = document.getElementById('production-progress');
    if (fill) {
      fill.style.width = (this.currentEntity.getProductionProgress() * 100) + '%';
    }
  }

  _updateBuild() {
    const buttons = this.buttonsEl.querySelectorAll('.build-btn');
    buttons.forEach((b) => {
      if (b._cost) b.disabled = !this.game.resources.canAfford('player', b._cost);
    });
  }
}
