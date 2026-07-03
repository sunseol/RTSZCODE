import * as THREE from 'three';
import { Terrain } from './world/Terrain.js';
import { createLighting } from './world/Lighting.js';
import { RTSCamera } from './camera/RTSCamera.js';
import { Knight } from './entities/Knight.js';
import { Archer } from './entities/Archer.js';
import { Villager } from './entities/Villager.js';
import { GoldMine, Castle, Barracks } from './entities/Building.js';
import { ResourceSystem } from './systems/ResourceSystem.js';
import { SelectionSystem } from './systems/SelectionSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { EnemyAI } from './systems/EnemyAI.js';
import { InputSystem } from './systems/InputSystem.js';
import { BuildSystem } from './systems/BuildSystem.js';
import { HUD } from './ui/HUD.js';
import { BuildMenu } from './ui/BuildMenu.js';

// 게임 메인 클래스 — 모든 시스템 통합 + 업데이트 루프
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.running = false;
    this.gameOver = false;

    // 유닛 클래스 레퍼런스 (Building 등에서 참조용)
    this.unitClasses = { Knight, Archer, Villager };

    // ===== Three.js 기본 설정 =====
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9bb0c4);

    this.camera = new THREE.PerspectiveCamera(
      55, window.innerWidth / window.innerHeight, 0.5, 500
    );

    // ===== 월드 =====
    this.terrain = new Terrain(this.scene, 160);
    this.lighting = createLighting(this.scene);

    // ===== 시스템 =====
    this.resources = new ResourceSystem();
    this.combat = new CombatSystem(this);
    this.enemyAI = new EnemyAI(this);
    this.build = new BuildSystem(this);

    // 엔티티 컬렉션
    this.units = [];
    this.buildings = [];
    this.goldMines = [];

    // 카메라 컨트롤러
    this.rtsCamera = new RTSCamera(this.camera, canvas, this.terrain);

    // UI
    this.ui = {
      hud: new HUD(this),
      buildMenu: new BuildMenu(this),
    };

    // 입력 & 선택
    this.selection = new SelectionSystem(this);
    this.input = new InputSystem(this);

    // 씬 그룹 (엔티티 메시를 담는 컨테이너)
    this.entityGroup = new THREE.Group();
    this.scene.add(this.entityGroup);

    // 리사이즈
    window.addEventListener('resize', () => this._onResize());

    // 시작 위치
    this.playerStart = { x: -45, z: 0 };
    this.enemyStart = { x: 45, z: 0 };

    this._setupInitialEntities();
  }

  _setupInitialEntities() {
    // 플레이어 성
    this.playerCastle = new Castle(this, this.playerStart.x, this.playerStart.z, 'player');
    this.addBuilding(this.playerCastle);

    // 적 성
    this.enemyCastle = new Castle(this, this.enemyStart.x, this.enemyStart.z, 'enemy');
    this.addBuilding(this.enemyCastle);

    // 적 병영 (적 유닛 스폰용)
    const enemyBarracks = new Barracks(this, this.enemyStart.x - 10, this.enemyStart.z + 8, 'enemy');
    this.addBuilding(enemyBarracks);

    // 금광 (양 진영 사이 + 각 진영 근처)
    const minePositions = [
      { x: this.playerStart.x + 12, z: -2 },
      { x: this.playerStart.x + 12, z: 8 },
      { x: 0, z: -10 },
      { x: 0, z: 10 },
      { x: this.enemyStart.x - 12, z: -2 },
      { x: this.enemyStart.x - 12, z: 8 },
    ];
    for (const p of minePositions) {
      const mine = new GoldMine(this, p.x, p.z);
      this.entityGroup.add(mine.group);
      this.goldMines.push(mine);
    }

    // 시작 유닛 — 플레이어 주민 3명
    for (let i = 0; i < 3; i++) {
      const v = new Villager(this, this.playerStart.x + 6 + i * 2, this.playerStart.z, 'player');
      this.addUnit(v);
      // 가까운 금광 자동 배정
      const mine = this.findNearestMine(v.x, v.z);
      if (mine) v.commandGather(mine);
    }

    // 카메라를 플레이어 성으로
    this.rtsCamera.setTarget(this.playerStart.x, this.playerStart.z);
  }

  addUnit(unit) {
    this.units.push(unit);
    this.entityGroup.add(unit.group);
  }

  addBuilding(building) {
    this.buildings.push(building);
    this.entityGroup.add(building.group);
  }

  findNearestMine(x, z) {
    let best = null, bestD = Infinity;
    for (const m of this.goldMines) {
      if (!m.alive) continue;
      const d = Math.hypot(m.x - x, m.z - z);
      if (d < bestD) { bestD = d; best = m; }
    }
    return best;
  }

  // 가장 가까운 플레이어 주민 반환 (건설 배정용)
  findNearestVillager(x, z, team = 'player') {
    let best = null, bestD = Infinity;
    for (const u of this.units) {
      if (!u.alive || u.team !== team || !u.isWorker) continue;
      const d = Math.hypot(u.x - x, u.z - z);
      if (d < bestD) { bestD = d; best = u; }
    }
    return best;
  }

  // 특정 팀의 모든 적 엔티티 반환
  getEnemies(team) {
    const enemyTeam = team === 'player' ? 'enemy' : 'player';
    const result = [];
    for (const u of this.units) {
      if (u.alive && u.team === enemyTeam) result.push(u);
    }
    for (const b of this.buildings) {
      if (b.alive && b.team === enemyTeam) result.push(b);
    }
    return result;
  }

  start() {
    this.running = true;
    this.gameOver = false;
    this.lastTime = performance.now();
    this._loop();
  }

  _loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this._loop);
  };

  update(dt) {
    if (this.gameOver) {
      this.rtsCamera.update(dt);
      this.ui.hud.updateMarkers(dt);
      return;
    }

    // 카메라
    this.rtsCamera.update(dt);

    // 엔티티 업데이트
    for (const b of this.buildings) b.update(dt);
    for (const u of this.units) u.update(dt);

    // 시스템 업데이트
    this.combat.updateAutoCombat(dt);
    this.combat.update(dt);
    this.enemyAI.update(dt);

    // 사망 처리
    this._cleanupDead();

    // UI
    this.ui.hud.update();
    this.ui.hud.updateMarkers(dt);
    this.ui.buildMenu.update();

    // 승패 확인
    this._checkWinLose();
  }

  _cleanupDead() {
    // 죽은 유닛 제거 (사망 연출 간단히)
    for (let i = this.units.length - 1; i >= 0; i--) {
      const u = this.units[i];
      if (!u.alive) {
        // 선택 해제
        if (u.selected) {
          const idx = this.selection.selected.indexOf(u);
          if (idx >= 0) this.selection.selected.splice(idx, 1);
        }
        // 쓰러지는 연출 후 제거
        u.group.rotation.z = Math.PI / 2.2;
        u.destroy();
        this.units.splice(i, 1);
        this.ui.hud.updateSelection();
      }
    }
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const b = this.buildings[i];
      if (!b.alive) {
        if (b.selected) {
          const idx = this.selection.selected.indexOf(b);
          if (idx >= 0) this.selection.selected.splice(idx, 1);
        }
        // 붕괴 연출
        b.group.position.y = -3;
        b.destroy();
        this.buildings.splice(i, 1);
      }
    }
    // 고갈된 금광 제거
    for (let i = this.goldMines.length - 1; i >= 0; i--) {
      if (!this.goldMines[i].alive) {
        this.goldMines[i].destroy();
        this.goldMines.splice(i, 1);
      }
    }
  }

  _checkWinLose() {
    if (this.gameOver) return;
    if (!this.enemyCastle || !this.enemyCastle.alive) {
      this._endGame(true);
    } else if (!this.playerCastle || !this.playerCastle.alive) {
      this._endGame(false);
    }
  }

  _endGame(won) {
    this.gameOver = true;
    this.combat.clearAll();
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('fade');
    overlay.innerHTML = `
      <div class="overlay-content ${won ? 'win' : 'lose'}">
        <div class="end-result">${won ? '🏆 승리!' : '💀 패배...'}</div>
        <h1>${won ? '왕국을 지켜냈습니다' : '성이 함락되었습니다'}</h1>
        <p>${won
          ? '적의 성을 파괴하고 영광을 차지했습니다.'
          : '적의 웨이브를 막아내지 못했습니다.'}</p>
        <button class="end-btn" id="restart-btn">다시 도전</button>
      </div>
    `;
    document.getElementById('restart-btn').addEventListener('click', () => location.reload());
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
