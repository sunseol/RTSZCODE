import * as THREE from 'three';
import { Unit } from './Unit.js';
import { dist2D } from '../utils/helpers.js';

export class Healer extends Unit {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 60;
    this.hp = 60;
    this.speed = 7.2;
    this.attackDamage = 0;
    this.attackRange = 0;
    this.healRange = 7.5;
    this.healAmount = 13;
    this.healCooldown = 1.1;
    this.healTimer = 0;
    this.isSupport = true;
    this.radius = 0.85;
    this.cost = { gold: 70, food: 45 };
    this.buildTime = 5;

    this._buildModel();
    this.hpBar.position.y = 2.6;
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0xead27a : 0xc47a61;
    const robeMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x333311, flatShading: true });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0b080, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1e, flatShading: true });

    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.7, 6), robeMat);
    robe.position.y = 1.05;
    robe.castShadow = true;
    this.group.add(robe);

    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.1), trimMat);
    sash.position.set(0, 1.25, 0.43);
    this.group.add(sash);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.42), skinMat);
    head.position.y = 2.05;
    head.castShadow = true;
    this.group.add(head);

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.55, 6), robeMat);
    hood.position.y = 2.35;
    hood.castShadow = true;
    this.group.add(hood);

    this.staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.1, 6), woodMat);
    this.staff.position.set(0.55, 1.25, 0.1);
    this.staff.rotation.z = 0.12;
    this.group.add(this.staff);

    this.orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0xfff1a8, emissive: 0x8a6a00 })
    );
    this.orb.position.set(0.68, 2.35, 0.1);
    this.group.add(this.orb);
  }

  commandHeal(target) {
    this.command = { type: 'heal', target, point: null };
  }

  update(dt) {
    super.update(dt);
    if (!this.alive) return;
    this.healTimer -= dt;
    this._pulseOrb(dt);

    if (this.command.type === 'idle') {
      const ally = this._findDamagedAlly(9);
      if (ally) this.commandHeal(ally);
    }

    if (this.command.type !== 'heal' || !this.command.target) return;
    const target = this.command.target;
    if (!target.alive || target.hp >= target.maxHp) {
      this.commandStop();
      return;
    }

    const d = dist2D(this.x, this.z, target.x, target.z);
    if (d > this.healRange) {
      this._moveToward(target.x, target.z, dt);
      return;
    }

    this._faceTarget(target.x, target.z);
    if (this.healTimer <= 0) {
      target.heal(this.healAmount);
      this._showHealPulse(target);
      this.healTimer = this.healCooldown;
    }
  }

  _findDamagedAlly(maxRange) {
    let best = null;
    let bestMissing = 0;
    for (const entity of [...this.game.units, ...this.game.buildings]) {
      if (entity === this || !entity.alive || entity.team !== this.team) continue;
      if (entity.hp >= entity.maxHp) continue;
      if (dist2D(this.x, this.z, entity.x, entity.z) > maxRange) continue;
      const missing = entity.maxHp - entity.hp;
      if (missing > bestMissing) {
        best = entity;
        bestMissing = missing;
      }
    }
    return best;
  }

  _pulseOrb(dt) {
    this._orbPulse = (this._orbPulse || 0) + dt * 5;
    const scale = 1 + Math.sin(this._orbPulse) * 0.12;
    this.orb.scale.setScalar(scale);
  }

  _showHealPulse(target) {
    const geo = new THREE.RingGeometry(0.4, 0.85, 20);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x9dff8a,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(target.x, target.y + 0.18, target.z);
    this.game.scene.add(ring);
    this.game.ui.hud.markers.push({ mesh: ring, life: 0.55 });
  }
}
