import * as THREE from 'three';
import { Unit } from './Unit.js';

// 기사 — 높은 체력, 강한 근접 공격, 느린 속도
export class Knight extends Unit {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 120;
    this.hp = 120;
    this.speed = 6;
    this.attackDamage = 18;
    this.attackRange = 1.8;
    this.attackCooldown = 1.1;
    this.isMilitary = true;
    this.radius = 1.0;
    this.cost = { gold: 60, food: 40 };
    this.buildTime = 5;

    this._buildModel();
    this._buildHpBar(); // 모델 높이에 맞춰 재배치
    this.hpBar.position.y = 2.8;
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x3a6ea5 : 0xb03a3a;
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x9aa0a8, flatShading: true });
    const clothMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0b080, flatShading: true });

    // 몸통 (갑옷)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.55), armorMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.group.add(torso);

    // 가슴망토(팀 색)
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.7, 0.58), clothMat);
    cloth.position.y = 1.5;
    cloth.castShadow = true;
    this.group.add(cloth);

    // 머리 (투구)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.5), armorMat);
    head.position.y = 2.2;
    head.castShadow = true;
    this.group.add(head);
    // 투구 장식
    const helmTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.3), armorMat);
    helmTop.position.y = 2.55;
    this.group.add(helmTop);

    // 얼굴 (틈새 살색)
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.05), skinMat);
    face.position.set(0, 2.2, 0.26);
    this.group.add(face);

    // 팔
    const armGeo = new THREE.BoxGeometry(0.25, 0.9, 0.25);
    const armL = new THREE.Mesh(armGeo, armorMat);
    armL.position.set(-0.6, 1.4, 0);
    armL.castShadow = true;
    this.group.add(armL);
    const armR = new THREE.Mesh(armGeo, armorMat);
    armR.position.set(0.6, 1.4, 0);
    armR.castShadow = true;
    this.group.add(armR);
    this.armR = armR;

    // 다리
    const legGeo = new THREE.BoxGeometry(0.3, 0.85, 0.3);
    const legL = new THREE.Mesh(legGeo, clothMat);
    legL.position.set(-0.22, 0.45, 0);
    legL.castShadow = true;
    this.group.add(legL);
    const legR = new THREE.Mesh(legGeo, clothMat);
    legR.position.set(0.22, 0.45, 0);
    legR.castShadow = true;
    this.group.add(legR);

    // 검 (오른손)
    const swordBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.3, 0.04),
      new THREE.MeshLambertMaterial({ color: 0xdfe6ee, flatShading: true })
    );
    swordBlade.position.set(0.75, 1.9, 0.2);
    this.group.add(swordBlade);
    const swordGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x8a6a2b })
    );
    swordGuard.position.set(0.75, 1.25, 0.2);
    this.group.add(swordGuard);
    this.sword = swordBlade;

    // 방패 (왼팔)
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 0.1, 6),
      new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true })
    );
    shield.rotation.x = Math.PI / 2;
    shield.rotation.z = Math.PI / 6;
    shield.position.set(-0.72, 1.4, 0.25);
    shield.castShadow = true;
    this.group.add(shield);
  }

  _performAttack(target) {
    super._performAttack(target);
    // 검 휘두르는 연출
    this._swingAnim = 0.35;
  }

  update(dt) {
    super.update(dt);
    // 검 휘두름 애니메이션
    if (this._swingAnim > 0) {
      this._swingAnim -= dt;
      const t = 1 - Math.max(0, this._swingAnim) / 0.35;
      this.sword.rotation.x = Math.sin(t * Math.PI) * -1.2;
      this.armR.rotation.x = Math.sin(t * Math.PI) * -1.0;
    }
  }
}
