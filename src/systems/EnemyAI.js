import { dist2D } from '../utils/helpers.js';

// 적 AI — 정기 웨이브 생성 + 적 유닛 자동 공격
export class EnemyAI {
  constructor(game) {
    this.game = game;
    this.waveTimer = 35; // 첫 웨이브까지 35초
    this.waveInterval = 35;
    this.waveNumber = 0;
  }

  update(dt) {
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this._spawnWave();
      this.waveTimer = this.waveInterval;
    }

    // 적 군사 유닛이 idle면 플레이어 성으로 진격
    for (const u of this.game.units) {
      if (!u.alive || u.team !== 'enemy' || !u.isMilitary) continue;
      if (u.command.type === 'idle') {
        const target = this.game.playerCastle;
        if (target && target.alive) {
          // 가까운 플레이어 유닛/건물 먼저 공격
          const closeEnemy = this.game.combat.findNearestEnemy(u, 12);
          if (closeEnemy) u.commandAttack(closeEnemy);
          else u.commandAttack(target);
        }
      }
    }
  }

  _spawnWave() {
    this.waveNumber++;
    const count = 3 + Math.floor(this.waveNumber * 1.5);
    const enemyBarracks = this.game.buildings.filter(
      (b) => b.team === 'enemy' && b.constructor.name === 'Barracks'
    );
    const castle = this.game.enemyCastle;

    for (let i = 0; i < count; i++) {
      const isKnight = Math.random() > 0.45;
      const UnitClass = isKnight ? this.game.unitClasses.Knight : this.game.unitClasses.Archer;
      // 적 병영 또는 성 근처에 스폰
      const source = enemyBarracks.length > 0
        ? enemyBarracks[i % enemyBarracks.length]
        : castle;
      const angle = Math.random() * Math.PI * 2;
      const sx = source.x + Math.cos(angle) * (source.radius + 2);
      const sz = source.z + Math.sin(angle) * (source.radius + 2);
      const unit = new UnitClass(this.game, sx, sz, 'enemy');
      this.game.addUnit(unit);
    }
  }
}
