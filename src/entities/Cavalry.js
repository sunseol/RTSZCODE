import * as THREE from 'three';
import { Unit } from './Unit.js';

export class Cavalry extends Unit {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.maxHp = 105;
    this.hp = 105;
    this.speed = 11.5;
    this.attackDamage = 16;
    this.attackRange = 2.0;
    this.attackCooldown = 0.95;
    this.isMilitary = true;
    this.radius = 1.2;
    this.cost = { gold: 85, food: 55 };
    this.buildTime = 6;
    this._stride = 0;

    this._buildModel();
    this.hpBar.position.y = 3.1;
  }

  _buildModel() {
    const teamColor = this.team === 'player' ? 0x2f69b1 : 0xa33a32;
    const horseMat = new THREE.MeshLambertMaterial({ color: 0x6a3f24, flatShading: true });
    const armorMat = new THREE.MeshLambertMaterial({ color: 0xa8adb4, flatShading: true });
    const clothMat = new THREE.MeshLambertMaterial({ color: teamColor, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x2b1a12, flatShading: true });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 0.75), horseMat);
    body.position.y = 1.0;
    body.castShadow = true;
    this.group.add(body);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 0.45), horseMat);
    neck.position.set(0, 1.35, 0.55);
    neck.rotation.x = -0.45;
    neck.castShadow = true;
    this.group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.65), horseMat);
    head.position.set(0, 1.65, 0.95);
    head.castShadow = true;
    this.group.add(head);

    this.legs = [];
    for (const xPos of [-0.65, 0.65]) {
      for (const zPos of [-0.25, 0.35]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.22), darkMat);
        leg.position.set(xPos, 0.35, zPos);
        leg.castShadow = true;
        this.group.add(leg);
        this.legs.push(leg);
      }
    }

    const rider = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.5), armorMat);
    rider.position.y = 1.95;
    rider.castShadow = true;
    this.group.add(rider);

    const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.55, 0.08), clothMat);
    cloak.position.set(0, 1.98, -0.3);
    cloak.castShadow = true;
    this.group.add(cloak);

    const headRider = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.42), armorMat);
    headRider.position.y = 2.55;
    headRider.castShadow = true;
    this.group.add(headRider);

    this.lance = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6),
      new THREE.MeshLambertMaterial({ color: 0xd9d4bf, flatShading: true })
    );
    this.lance.rotation.x = Math.PI / 2;
    this.lance.position.set(0.55, 2.1, 0.65);
    this.group.add(this.lance);
  }

  _performAttack(target) {
    target.takeDamage(this.attackDamage, this);
    this._thrustAnim = 0.25;
  }

  update(dt) {
    super.update(dt);
    this._stride += dt * this.speed;
    this.legs.forEach((leg, index) => {
      leg.rotation.x = Math.sin(this._stride + index * Math.PI) * 0.35;
    });
    if (this._thrustAnim > 0) {
      this._thrustAnim -= dt;
      const t = Math.sin((1 - Math.max(0, this._thrustAnim) / 0.25) * Math.PI);
      this.lance.position.z = 0.65 + t * 0.55;
    }
  }
}
