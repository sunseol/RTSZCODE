import * as THREE from 'three';
import { Entity } from './Entity.js';

// 금광 — 자원 소스 (중립)
export class GoldMine extends Entity {
  constructor(game, x, z) {
    super(game, x, z, 'neutral');
    this.maxHp = 9999;
    this.hp = 9999;
    this.amount = 800;
    this.radius = 2.2;
    this.isMine = true;
    this._buildModel();
  }

  _buildModel() {
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x4a4540, flatShading: true });
    const goldMat = new THREE.MeshLambertMaterial({
      color: 0xffcf3a, emissive: 0x5a3a00, flatShading: true
    });

    // 바위 덩어리
    for (let i = 0; i < 6; i++) {
      const s = 1.0 + Math.random() * 1.2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
      const a = (i / 6) * Math.PI * 2;
      rock.position.set(Math.cos(a) * 1.2, s * 0.5, Math.sin(a) * 1.2);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);
    }
    // 중앙 큰 바위
    const main = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 0), rockMat);
    main.position.y = 1.3;
    main.castShadow = true;
    this.group.add(main);

    // 금맥 (노란 조각들)
    for (let i = 0; i < 12; i++) {
      const g = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.15, 0), goldMat);
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.6;
      g.position.set(Math.cos(a) * r, 0.8 + Math.random() * 1.5, Math.sin(a) * r);
      this.group.add(g);
    }
  }

  harvest(amount) {
    const got = Math.min(amount, this.amount);
    this.amount -= got;
    if (this.amount <= 0) this.die();
    return got;
  }
}

// 건물 기반 클래스
export class Building extends Entity {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.isBuilding = true;
    this.radius = 3;
    this.productionQueue = [];
    this.productionTimer = 0;
    this.rallyPoint = { x: x + 6, z };
    this.currentProduction = null;
    // 식량 생산 — 자식에서 foodRate 설정 (초당 Food 생성량)
    this.foodRate = 0;
    this.foodAccumulator = 0;
    // 건설 상태 (건설 중일 때 0→1로 증가)
    this.underConstruction = false;
    this.buildProgress = 1; // 1 = 완전히 지어짐
  }

  // 생산 큐에 추가
  queueUnit(UnitClass) {
    const info = this._unitInfo(UnitClass);
    if (!this.game.resources.canAfford(this.team, info.cost)) return false;
    this.game.resources.spend(this.team, info.cost);
    this.productionQueue.push(info);
    return true;
  }

  // 생산 가능한 유닛 타입 목록 (자식에서 오버라이드)
  getProductionOptions() { return []; }

  update(dt) {
    super.update(dt);
    if (!this.alive) return;

    // 식량 자동 생산 — foodRate > 0 인 건물이 매 초마다 Food 축적
    if (this.foodRate > 0 && !this.underConstruction) {
      this.foodAccumulator += this.foodRate * dt;
      if (this.foodAccumulator >= 1) {
        const amount = Math.floor(this.foodAccumulator);
        this.game.resources.add(this.team, 'food', amount);
        this.foodAccumulator -= amount;
      }
    }

    // 건설 중 — 진행률에 따라 투명도 갱신
    if (this.underConstruction) {
      this._updateBuildAppearance();
    }

    // 생산 처리
    if (this.productionQueue.length > 0 && !this.currentProduction) {
      this.currentProduction = this.productionQueue.shift();
      this.productionTimer = this.currentProduction.buildTime || 4;
    }
    if (this.currentProduction) {
      this.productionTimer -= dt;
      if (this.productionTimer <= 0) {
        this._spawnUnit(this.currentProduction.UnitClass);
        this.currentProduction = null;
      }
    }
  }

  // 건설 진행률(0~1)에 따라 건물 외관을 투명→불투명으로 갱신
  _updateBuildAppearance() {
    const opacity = Math.max(0.05, this.buildProgress);
    this.group.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material.transparent = opacity < 1;
        o.material.opacity = opacity;
      }
    });
    // 건설 중에는 살짝 지면 밑에 있다가 올라오는 효과
    const yOffset = (1 - this.buildProgress) * -2.5;
    this.group.position.y = this.y + yOffset;
  }

  // 건설 진행 (주민이 호출)
  advanceConstruction(progress) {
    this.buildProgress = Math.min(1, progress);
    if (this.buildProgress >= 1 && this.underConstruction) {
      this.underConstruction = false;
      this.buildProgress = 1;
      this.group.position.y = this.y; // 원래 높이로
      // 완전 불투명으로 복원
      this.group.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material.transparent = false;
          o.material.opacity = 1;
        }
      });
    }
  }

  _unitInfo(UnitClass) {
    const tmp = new UnitClass(this.game, 0, 0, this.team);
    const info = { UnitClass, cost: tmp.cost, buildTime: tmp.buildTime };
    tmp.destroy();
    return info;
  }

  _spawnUnit(UnitClass) {
    // 건물 근처 빈자리에 스폰
    const angle = Math.random() * Math.PI * 2;
    const sx = this.x + Math.cos(angle) * (this.radius + 1.5);
    const sz = this.z + Math.sin(angle) * (this.radius + 1.5);
    const unit = new UnitClass(this.game, sx, sz, this.team);
    this.game.addUnit(unit);
    // 집결점으로 자동 이동
    if (unit.isWorker && this.game.goldMines.length > 0) {
      // 주민은 가까운 금광으로 자동 배정
      const mine = this.game.findNearestMine(sx, sz);
      if (mine) unit.commandGather(mine);
    } else {
      unit.commandMove(this.rallyPoint.x, this.rallyPoint.z);
    }
  }

  // 진척도 (0~1)
  getProductionProgress() {
    if (!this.currentProduction) return 0;
    const total = this.currentProduction.buildTime || 4;
    return 1 - this.productionTimer / total;
  }
}

// 성 (기지) — 주민 생산, 식량 기본 수급, 승패 조건
export class Castle extends Building {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 1500;
    this.hp = 1500;
    this.radius = 4;
    this.foodRate = 1.5; // 초당 1.5 식량 기본 수급
    this._buildModel();
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x7a8aa0 : 0x9a5a4a;
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xb0a890, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });

    // 기본 벽 (네모)
    const base = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 7), wallMat);
    base.position.y = 2;
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);

    // 성벽 톱니
    for (let i = -3; i <= 3; i += 2) {
      for (const side of [-1, 1]) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), wallMat);
        merlon.position.set(i * 1.4, 4.5, side * 3.5);
        merlon.castShadow = true;
        this.group.add(merlon);
        const merlon2 = merlon.clone();
        merlon2.position.set(side * 3.5, 4.5, i * 1.4);
        this.group.add(merlon2);
      }
    }

    // 중앙 탑
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3, 7, 3), wallMat);
    tower.position.y = 3.5;
    tower.castShadow = true;
    this.group.add(tower);

    // 탑 지붕 (원뿔)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3, 4), roofMat);
    roof.position.y = 8.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    this.group.add(roof);

    // 깃발
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6),
      new THREE.MeshLambertMaterial({ color: 0x3a2a1a })
    );
    pole.position.set(0, 11, 0);
    this.group.add(pole);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.9),
      new THREE.MeshLambertMaterial({ color: teamColor, side: THREE.DoubleSide })
    );
    flag.position.set(0.75, 11.5, 0);
    this.group.add(flag);
    this.flag = flag;
  }

  getProductionOptions() {
    // 동적 import 대신 클래스 레퍼런스 반환
    const Villager = this._villagerClass();
    return [
      { name: '주민 생산', cost: { gold: 30, food: 10 }, time: 3, unitClass: Villager, icon: '🧑‍🌾' },
      { name: '치료사 양성', cost: { gold: 70, food: 45 }, time: 5, unitClass: this.game.unitClasses.Healer, icon: '✨' }
    ];
  }

  _villagerClass() {
    if (!this._vc) this._vc = this.game.unitClasses.Villager;
    return this._vc;
  }

  update(dt) {
    super.update(dt);
    // 깃발 펄럭임
    if (this.flag) this.flag.rotation.y = Math.sin(performance.now() * 0.003) * 0.3;
  }
}

// 병영 — 군사 유닛 생산
export class Barracks extends Building {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 700;
    this.hp = 700;
    this.radius = 3.2;
    this.cost = { gold: 120, food: 0 };
    this._buildModel();
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x6a7a90 : 0x8a4a3a;
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x7a5a32, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });

    // 본관
    const main = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.5, 4.5), woodMat);
    main.position.y = 1.75;
    main.castShadow = true;
    main.receiveShadow = true;
    this.group.add(main);

    // 지붕 (삼각 기둥)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 2.5, 4), roofMat);
    roof.position.y = 4.5;
    roof.rotation.y = Math.PI / 4;
    roof.scale.x = 1.3;
    roof.castShadow = true;
    this.group.add(roof);

    // 문
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.2, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x3a2a1a })
    );
    door.position.set(0, 1.1, 2.28);
    this.group.add(door);

    // 창문
    for (const sx of [-1.6, 1.6]) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xffe6a0, emissive: 0x6a4a00 })
      );
      win.position.set(sx, 2.2, 2.28);
      this.group.add(win);
    }

    // 옆 작은 탑
    const sideTower = new THREE.Mesh(new THREE.BoxGeometry(1.5, 5, 1.5), woodMat);
    sideTower.position.set(-2.8, 2.5, 0);
    sideTower.castShadow = true;
    this.group.add(sideTower);
  }

  getProductionOptions() {
    return [
      { name: '기사 훈련', cost: { gold: 60, food: 40 }, time: 5, unitClass: this.game.unitClasses.Knight, icon: '🗡️' },
      { name: '궁수 훈련', cost: { gold: 50, food: 25 }, time: 4, unitClass: this.game.unitClasses.Archer, icon: '🏹' },
      { name: '기병 훈련', cost: { gold: 85, food: 55 }, time: 6, unitClass: this.game.unitClasses.Cavalry, icon: '🐎' }
    ];
  }
}

// 농장 — 식량(Food) 생산 건물. 유닛 생산은 없고 foodRate만 높음
export class Farm extends Building {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 350;
    this.hp = 350;
    this.radius = 2.5;
    this.foodRate = 3; // 초당 3 식량 (성의 기본 1.5에 추가)
    this.cost = { gold: 80, food: 0 };
    this._buildModel();
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x6a8a4a : 0x8a5a3a;
    const fieldMat = new THREE.MeshLambertMaterial({ color: 0x8a7a3a, flatShading: true });
    const cropMat = new THREE.MeshLambertMaterial({ color: 0xd4b048, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a2a, flatShading: true });

    // 밭 기반 (흙)
    const field = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 4.5), fieldMat);
    field.position.y = 0.2;
    field.receiveShadow = true;
    this.group.add(field);

    // 곡물 줄 (노란 박스 여러 줄)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const crop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.3), cropMat);
        crop.position.set(-1.6 + col * 1.05, 0.65, -1.2 + row * 1.2);
        crop.castShadow = true;
        this.group.add(crop);
      }
    }

    // 작은 헛간 (구석)
    const barn = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 1.8), woodMat);
    barn.position.set(1.2, 1.1, 1.2);
    barn.castShadow = true;
    this.group.add(barn);
    // 헛간 지붕
    const barnRoof = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 1, 4),
      new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true })
    );
    barnRoof.position.set(1.2, 2.5, 1.2);
    barnRoof.rotation.y = Math.PI / 4;
    barnRoof.castShadow = true;
    this.group.add(barnRoof);

    // 울타리 기둥들
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1a, flatShading: true });
    for (let i = -2; i <= 2; i += 2) {
      for (const [fx, fz] of [[i, 2.3], [i, -2.3], [2.3, i], [-2.3, i]]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), fenceMat);
        post.position.set(fx, 0.6, fz);
        this.group.add(post);
      }
    }
  }

  // 농장은 유닛 생산 옵션 없음 — 식량만 생산
  getProductionOptions() { return []; }
}
