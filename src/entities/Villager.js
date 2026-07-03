import * as THREE from 'three';
import { Unit } from './Unit.js';
import { dist2D } from '../utils/helpers.js';

// 주민 — 자원 채집, 약한 전투력, 빠른 속도
export class Villager extends Unit {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 45;
    this.hp = 45;
    this.speed = 8.5;
    this.attackDamage = 4;
    this.attackRange = 1.4;
    this.attackCooldown = 1.2;
    this.isMilitary = false;
    this.isWorker = true;
    this.radius = 0.8;
    this.cost = { gold: 30, food: 10 };
    this.buildTime = 3;

    // 채집 상태
    this.carrying = 0;       // 현재 운반 중인 자원량
    this.maxCarry = 10;
    this.mineTarget = null;  // 할당된 금광
    this.gatherTimer = 0;

    this._buildModel();
    this.hpBar.position.y = 2.2;
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0xb08a3a : 0x8a6a3a;
    const clothMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0b080, flatShading: true });
    const brownMat = new THREE.MeshLambertMaterial({ color: 0x6a4a2a, flatShading: true });

    // 몸통
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), clothMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    this.group.add(torso);

    // 머리
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.4), skinMat);
    head.position.y = 1.68;
    head.castShadow = true;
    this.group.add(head);

    // 팔
    const armGeo = new THREE.BoxGeometry(0.18, 0.7, 0.18);
    const armL = new THREE.Mesh(armGeo, skinMat);
    armL.position.set(-0.4, 1.1, 0);
    this.group.add(armL);
    const armR = new THREE.Mesh(armGeo, skinMat);
    armR.position.set(0.4, 1.1, 0);
    this.group.add(armR);

    // 다리
    const legGeo = new THREE.BoxGeometry(0.22, 0.65, 0.22);
    const legL = new THREE.Mesh(legGeo, brownMat);
    legL.position.set(-0.16, 0.32, 0);
    this.group.add(legL);
    const legR = new THREE.Mesh(legGeo, brownMat);
    legR.position.set(0.16, 0.32, 0);
    this.group.add(legR);

    // 곡괭이 (오른손)
    const pick = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.6, 0.1),
      brownMat
    );
    pick.position.set(0.5, 1.35, 0);
    this.group.add(pick);
    const pickHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.12, 0.12),
      new THREE.MeshLambertMaterial({ color: 0x888888, flatShading: true })
    );
    pickHead.position.set(0.5, 1.65, 0);
    this.group.add(pickHead);
    this.pick = pick;
  }

  // 금광에 채집 명령
  commandGather(mine) {
    this.mineTarget = mine;
    this.command = { type: 'gather', target: mine, point: null };
  }

  // 건물 건설 명령
  commandBuild(BuildingClass, x, z, buildTime) {
    this.buildPlan = {
      BuildingClass, x, z,
      buildTime: buildTime || 8,
      totalTime: buildTime || 8,
      site: null,       // 건설 중인 건물 참조 (도착 후 생성)
    };
    this.buildTimer = buildTime || 8;
    this.command = { type: 'build', point: { x, z }, target: null };
  }

  update(dt) {
    if (!this.alive) {
      super.update(dt);
      return;
    }
    this.attackTimer -= dt;
    this.gatherTimer -= dt;
    this.buildTimer = (this.buildTimer || 0) - dt;
    this._updateHpBar();

    const cmd = this.command;

    if (cmd.type === 'build' && this.buildPlan) {
      const p = this.buildPlan;
      const d = dist2D(this.x, this.z, p.x, p.z);
      if (d > 4) {
        // 건설 위치로 이동
        this._moveToward(p.x, p.z, dt);
      } else {
        // 건설 위치 도착 — 처음 도착 시 투명 건물(건설 현장) 생성
        if (!p.site) {
          const building = this.game.build.instantiateBuilding(p.BuildingClass, p.x, p.z, this.team);
          building.underConstruction = true;
          building.buildProgress = 0;
          building.advanceConstruction(0); // 초기 투명 상태 적용
          p.site = building;
        }
        // 망치질 애니메이션 + 건설 진행
        this._faceTarget(p.x, p.z);
        this._swingPick(dt);
        // 진행률 = (경과 시간 / 총 시간)
        const progress = 1 - (this.buildTimer / p.totalTime);
        p.site.advanceConstruction(progress);
        if (this.buildTimer <= 0) {
          // 건설 완료
          p.site.advanceConstruction(1);
          this.game.ui.hud.flashCommandMarker({ x: p.x, y: p.site.y, z: p.z }, 'move');
          this.buildPlan = null;
          this.commandStop();
          // 완료 후 가까운 금광으로 복귀
          const mine = this.game.findNearestMine(this.x, this.z);
          if (mine) this.commandGather(mine);
          this.buildTimer = 0;
        }
      }
    } else if (cmd.type === 'gather' && this.mineTarget && this.mineTarget.alive) {
      const mine = this.mineTarget;
      const store = this.team === 'player' ? this.game.playerCastle : this.game.enemyCastle;

      if (this.carrying >= this.maxCarry) {
        // 저장소로 복귀
        const dStore = dist2D(this.x, this.z, store.x, store.z);
        if (dStore > 4) {
          this._moveToward(store.x, store.z, dt);
        } else {
          // 자원 납품
          this.game.resources.add(this.team, 'gold', this.carrying);
          this.carrying = 0;
        }
      } else {
        const dMine = dist2D(this.x, this.z, mine.x, mine.z);
        if (dMine > mine.radius + 0.5) {
          this._moveToward(mine.x, mine.z, dt);
        } else {
          // 채집
          this._faceTarget(mine.x, mine.z);
          this._swingPick(dt);
          if (this.gatherTimer <= 0) {
            const got = mine.harvest(3);
            this.carrying += got;
            this.gatherTimer = 1.5;
          }
        }
      }
    } else {
      // 일반 명령 (이동/공격) 은 부모 로직 사용
      super.update(dt);
    }
  }

  _swingPick(dt) {
    this._pickAnim = (this._pickAnim || 0) + dt * 6;
    this.pick.rotation.x = Math.sin(this._pickAnim) * 0.7;
  }
}
