import * as THREE from 'three';
import { Unit } from './Unit.js';

// 궁수 — 원거리 공격, 낮은 체력, 빠른 속도
export class Archer extends Unit {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 65;
    this.hp = 65;
    this.speed = 7.5;
    this.attackDamage = 12;
    this.attackRange = 12;
    this.attackCooldown = 1.4;
    this.isMilitary = true;
    this.radius = 0.85;
    this.cost = { gold: 50, food: 25 };
    this.buildTime = 4;

    this._buildModel();
    this.hpBar.position.y = 2.5;
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x2d7a3a : 0x8a3a2d;
    const clothMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0b080, flatShading: true });
    const brownMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1e, flatShading: true });

    // 몸통 (튜닉)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.45), clothMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    this.group.add(torso);

    // 머리 (후드)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.45), skinMat);
    head.position.y = 2.0;
    head.castShadow = true;
    this.group.add(head);
    // 후드
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 6), clothMat);
    hood.position.y = 2.28;
    this.group.add(hood);

    // 팔
    const armGeo = new THREE.BoxGeometry(0.2, 0.85, 0.2);
    const armL = new THREE.Mesh(armGeo, clothMat);
    armL.position.set(-0.48, 1.35, 0);
    armL.castShadow = true;
    this.group.add(armL);
    const armR = new THREE.Mesh(armGeo, clothMat);
    armR.position.set(0.48, 1.35, 0);
    armR.castShadow = true;
    this.group.add(armR);
    this.armR = armR;

    // 다리
    const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const legL = new THREE.Mesh(legGeo, brownMat);
    legL.position.set(-0.18, 0.4, 0);
    legL.castShadow = true;
    this.group.add(legL);
    const legR = new THREE.Mesh(legGeo, brownMat);
    legR.position.set(0.18, 0.4, 0);
    legR.castShadow = true;
    this.group.add(legR);

    // 활 (왼손)
    const bow = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.05, 6, 12, Math.PI * 1.2),
      brownMat
    );
    bow.rotation.z = Math.PI / 2;
    bow.position.set(-0.6, 1.45, 0.3);
    this.group.add(bow);
    this.bow = bow;
  }

  _performAttack(target) {
    // 화살 투사체 생성
    const arrow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5),
      new THREE.MeshLambertMaterial({ color: 0x8a6a2b })
    );
    arrow.position.copy(this.group.position);
    arrow.position.y += 1.4;
    this.group.parent.add(arrow);

    this.game.combat.spawnProjectile(arrow, this, target, this.attackDamage);
    // 활 당김 연출
    this._drawAnim = 0.3;
  }

  update(dt) {
    super.update(dt);
    if (this._drawAnim > 0) {
      this._drawAnim -= dt;
      const t = 1 - Math.max(0, this._drawAnim) / 0.3;
      this.bow.rotation.y = Math.sin(t * Math.PI) * 0.4;
    }
  }
}
