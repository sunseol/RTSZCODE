import * as THREE from 'three';

// 모든 게임 객체의 기반: 위치, 체력, 팀, 메시
export class Entity {
  constructor(game, x, z, team = 'player') {
    this.game = game;
    this.team = team; // 'player' | 'enemy'
    this.alive = true;
    this.maxHp = 100;
    this.hp = 100;
    this.radius = 1;   // 충돌/선택 반경
    this.selected = false;

    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.setPosition(x, z);

    this.selectionRing = null;
  }

  setPosition(x, z) {
    const y = this.game.terrain.heightAt(x, z);
    this.group.position.set(x, y, z);
    this.x = x;
    this.z = z;
    this.y = y;
  }

  getPosition() {
    return this.group.position;
  }

  takeDamage(amount, attacker) {
    if (!this.alive) return;
    this.hp -= amount;
    this._flash();
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  _flash() {
    // 피격 시 살짝 흔들림/점프 효과
    this.group.position.y = this.y + 0.4;
  }

  die() {
    this.alive = false;
    this.hp = 0;
  }

  setSelected(sel) {
    this.selected = sel;
    if (sel && !this.selectionRing) {
      const geo = new THREE.RingGeometry(this.radius * 1.1, this.radius * 1.4, 24);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: this.team === 'player' ? 0x66ff66 : 0xff6666,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      this.selectionRing = new THREE.Mesh(geo, mat);
      this.selectionRing.position.y = 0.1;
      this.group.add(this.selectionRing);
    } else if (!sel && this.selectionRing) {
      this.group.remove(this.selectionRing);
      this.selectionRing.geometry.dispose();
      this.selectionRing.material.dispose();
      this.selectionRing = null;
    }
  }

  // 자원 정리
  destroy() {
    this.setSelected(false);
    if (this.group.parent) this.group.parent.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }

  update(dt) {
    // y 위치 보정 (피격 점프 후 원위치)
    if (this.group.position.y > this.y + 0.01) {
      this.group.position.y = Math.max(this.y, this.group.position.y - dt * 3);
    }
  }
}
