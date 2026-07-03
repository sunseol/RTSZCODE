import * as THREE from 'three';
import { Entity } from './Entity.js';
import { angleTo, dirTo, dist2D } from '../utils/helpers.js';

// 이동 가능한 유닛 기반 클래스 — 이동/회전/체력바/명령
export class Unit extends Entity {
  constructor(game, x, z, team = 'player') {
    super(game, x, z, team);
    this.speed = 8;
    this.attackRange = 1.6;
    this.attackDamage = 8;
    this.attackCooldown = 1.0;
    this.attackTimer = 0;
    this.isMilitary = false;

    // 명령 상태
    this.command = { type: 'idle', target: null, point: null };

    // 체력바
    this.hpBar = null;
    this._buildHpBar();
  }

  _buildHpBar() {
    const barGroup = new THREE.Group();
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.18),
      new THREE.MeshBasicMaterial({ color: 0x220000, transparent: true, opacity: 0.85 })
    );
    const fill = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.18),
      new THREE.MeshBasicMaterial({ color: this.team === 'player' ? 0x44dd44 : 0xdd4444 })
    );
    fill.position.z = 0.001;
    barGroup.add(bg);
    barGroup.add(fill);
    barGroup.fill = fill;
    barGroup.position.y = 2.6;
    barGroup.visible = false;
    this.group.add(barGroup);
    this.hpBar = barGroup;
  }

  _updateHpBar() {
    if (!this.hpBar) return;
    const ratio = this.hp / this.maxHp;
    this.hpBar.fill.scale.x = Math.max(0.001, ratio);
    this.hpBar.fill.position.x = -(1 - ratio) * 0.7;
    this.hpBar.visible = ratio < 1 || this.selected;
    // 카메라를 향해 회전
    if (this.game.camera) {
      this.hpBar.lookAt(this.game.camera.position);
    }
  }

  // 이동 명령
  commandMove(x, z) {
    this.command = { type: 'move', point: { x, z }, target: null };
  }

  // 공격/이동 명령 (타겟 엔티티)
  commandAttack(target) {
    this.command = { type: 'attack', target, point: null };
  }

  // 정지
  commandStop() {
    this.command = { type: 'idle', target: null, point: null };
  }

  _faceTarget(x, z) {
    const targetAngle = angleTo(this.x, this.z, x, z);
    // 부드럽게 회전
    let diff = targetAngle - this.group.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.group.rotation.y += THREE.MathUtils.clamp(diff, -8 * 0.016 * 10, 8 * 0.016 * 10);
  }

  _moveToward(x, z, dt) {
    const d = dirTo(this.x, this.z, x, z);
    if (d.len < 0.4) return true; // 도착
    this._faceTarget(x, z);
    const step = Math.min(this.speed * dt, d.len);
    const nx = this.x + d.x * step;
    const nz = this.z + d.y * step;
    this.setPosition(nx, nz);
    return false;
  }

  update(dt) {
    super.update(dt);
    if (!this.alive) return;

    this.attackTimer -= dt;
    this._updateHpBar();

    const cmd = this.command;

    if (cmd.type === 'move' && cmd.point) {
      const arrived = this._moveToward(cmd.point.x, cmd.point.z, dt);
      if (arrived) this.commandStop();
    } else if (cmd.type === 'attack' && cmd.target) {
      const t = cmd.target;
      if (!t.alive) {
        this.commandStop();
        return;
      }
      const d = dist2D(this.x, this.z, t.x, t.z);
      if (d > this.attackRange) {
        this._moveToward(t.x, t.z, dt);
      } else {
        this._faceTarget(t.x, t.z);
        if (this.attackTimer <= 0) {
          this._performAttack(t);
          this.attackTimer = this.attackCooldown;
        }
      }
    }
  }

  // 자식 클래스에서 오버라이드 (근접/원거리)
  _performAttack(target) {
    target.takeDamage(this.attackDamage, this);
  }

  die() {
    super.die();
    // 죽음 연출: 살짝 눕고 사라짐 (Game에서 처리)
  }
}
