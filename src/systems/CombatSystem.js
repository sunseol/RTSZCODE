import * as THREE from 'three';
import { dist2D } from '../utils/helpers.js';

// 전투 시스템 — 투사체(화살) 관리 + 자동 전투(적 근접 시 반격) + 사망 처리
export class CombatSystem {
  constructor(game) {
    this.game = game;
    this.projectiles = []; // {mesh, from, target, damage, speed}
  }

  // 화살 투사체 발사
  spawnProjectile(mesh, from, target, damage) {
    this.projectiles.push({
      mesh,
      from,
      target,
      damage,
      speed: 35,
    });
  }

  // 가장 가까운 적 탐색
  findNearestEnemy(unit, maxRange = 14) {
    let best = null;
    let bestD = maxRange;
    const enemies = this.game.getEnemies(unit.team);
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = dist2D(unit.x, unit.z, e.x, e.z);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  // 군사 유닛 자동 전투 (idle 상태일 때만 적 자동 탐색/교전)
  updateAutoCombat(dt) {
    for (const u of this.game.units) {
      if (!u.alive || !u.isMilitary) continue;
      if (u.command.type !== 'idle') continue;
      const enemy = this.findNearestEnemy(u, 10);
      if (enemy) u.commandAttack(enemy);
    }
  }

  update(dt) {
    // 투사체 이동
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.target.alive) {
        // 타겟 사망 — 화살 제거
        this._removeProjectile(i);
        continue;
      }
      const tp = p.target.group.position.clone();
      tp.y += 1;
      const dir = tp.clone().sub(p.mesh.position);
      const dist = dir.length();
      if (dist < 1.0) {
        // 적중
        p.target.takeDamage(p.damage, p.from);
        this._removeProjectile(i);
        continue;
      }
      dir.normalize();
      p.mesh.position.add(dir.multiplyScalar(p.speed * dt));
      p.mesh.lookAt(tp);
    }
  }

  _removeProjectile(i) {
    const p = this.projectiles[i];
    if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
    p.mesh.geometry.dispose();
    p.mesh.material.dispose();
    this.projectiles.splice(i, 1);
  }

  clearAll() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) this._removeProjectile(i);
  }
}
