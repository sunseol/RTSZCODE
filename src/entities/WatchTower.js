import * as THREE from 'three';
import { Building } from './Building.js';

export class WatchTower extends Building {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 520;
    this.hp = 520;
    this.radius = 2.4;
    this.cost = { gold: 110, food: 25 };
    this.attackRange = 18;
    this.attackDamage = 18;
    this.attackCooldown = 1.25;
    this.attackTimer = 0;

    this._buildModel();
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x496f9f : 0x9a4e3c;
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x928975, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1e, flatShading: true });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.0, 5.6, 8), stoneMat);
    base.position.y = 2.8;
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);

    this.top = new THREE.Group();
    this.top.position.y = 5.9;
    this.group.add(this.top);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.55, 4.1), woodMat);
    deck.castShadow = true;
    this.top.add(deck);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.6, 4), roofMat);
    roof.position.y = 1.1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    this.top.add(roof);

    for (const xPos of [-1.55, 1.55]) {
      for (const zPos of [-1.55, 1.55]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.35, 0.28), woodMat);
        post.position.set(xPos, 0.45, zPos);
        post.castShadow = true;
        this.top.add(post);
      }
    }

    this.bow = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.05, 6, 12, Math.PI * 1.15),
      woodMat
    );
    this.bow.rotation.z = Math.PI / 2;
    this.bow.position.set(0, 0.45, 1.85);
    this.top.add(this.bow);
  }

  update(dt) {
    super.update(dt);
    if (!this.alive || this.underConstruction) return;
    this.attackTimer -= dt;
    const target = this.game.combat.findNearestEnemy(this, this.attackRange);
    if (!target) return;
    this._faceTarget(target);
    if (this.attackTimer <= 0) {
      this._fireAt(target);
      this.attackTimer = this.attackCooldown;
    }
  }

  getProductionOptions() {
    return [];
  }

  _faceTarget(target) {
    const angle = Math.atan2(target.x - this.x, target.z - this.z);
    this.top.rotation.y = angle;
  }

  _fireAt(target) {
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6),
      new THREE.MeshLambertMaterial({ color: 0xd8c08a, flatShading: true })
    );
    bolt.position.set(this.x, this.y + 6.2, this.z);
    bolt.rotation.x = Math.PI / 2;
    this.group.parent.add(bolt);
    this.game.combat.spawnProjectile(bolt, this, target, this.attackDamage);
  }
}
