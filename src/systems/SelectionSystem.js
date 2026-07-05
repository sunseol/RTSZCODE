import * as THREE from 'three';
import { pointInRect } from '../utils/helpers.js';

// 선택 시스템 — 클릭 선택 + 드래그 박스 선택
export class SelectionSystem {
  constructor(game) {
    this.game = game;
    this.selected = []; // 선택된 엔티티 목록
    this.dragging = false;
    this.dragStart = null; // {x, y} 화면 좌표
    this.dragEnd = null;
    this.dragBox = document.getElementById('drag-box');
  }

  clear() {
    for (const e of this.selected) e.setSelected(false);
    this.selected = [];
    this.game.ui.hud.updateSelection();
    this.game.ui.buildMenu.hide();
  }

  // 단일 클릭/우클릭으로 엔티티 픽 (유닛, 건물, 금광 포함)
  pickEntity(ndcX, ndcY) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera({ x: ndcX, y: ndcY }, this.game.camera);
    const candidates = [];
    for (const e of this.game.units) {
      if (e.alive) candidates.push(e.group);
    }
    for (const b of this.game.buildings) {
      if (b.alive) candidates.push(b.group);
    }
    for (const m of this.game.goldMines) {
      if (m.alive) candidates.push(m.group);
    }
    const hits = ray.intersectObjects(candidates, true);
    if (hits.length === 0) return null;
    // 가장 가까운 hit의 최상위 그룹 → 엔티티 매핑
    let obj = hits[0].object;
    while (obj.parent && !this._entityFromGroup(obj)) obj = obj.parent;
    return this._entityFromGroup(obj);
  }

  _entityFromGroup(group) {
    for (const e of [...this.game.units, ...this.game.buildings, ...this.game.goldMines]) {
      if (e.group === group) return e;
    }
    return null;
  }

  selectSingle(entity) {
    const next = entity && entity.team === 'player' ? [entity] : [];
    this._applySelection(next);
  }

  selectVisibleUnitsOfType(entity) {
    if (!entity || entity.team !== 'player' || !this.game.units.includes(entity)) {
      this.selectSingle(entity);
      return;
    }
    const UnitClass = entity.constructor;
    const visible = this.game.units.filter((u) =>
      u.alive && u.team === 'player' && u.constructor === UnitClass && this._isVisibleOnScreen(u)
    );
    this._applySelection(visible.length > 0 ? visible : [entity]);
  }

  _applySelection(entities) {
    this.clear();
    for (const entity of entities) entity.setSelected(true);
    this.selected = entities;
    this.game.ui.hud.updateSelection();
    this._updateBuildMenuForSelection();
  }

  _updateBuildMenuForSelection() {
    if (this.selected.length === 1) {
      this.game.ui.buildMenu.show(this.selected[0]);
    } else if (this.selected.length > 1 && this.selected.every((u) => u.isWorker)) {
      this.game.ui.buildMenu.show(this.selected[0]);
    } else {
      this.game.ui.buildMenu.hide();
    }
  }

  _isVisibleOnScreen(entity) {
    const p = entity.group.position.clone();
    p.project(this.game.camera);
    return p.z >= -1 && p.z <= 1 && p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1;
  }

  // 드래그 시작
  startDrag(screenX, screenY) {
    this.dragging = true;
    this.dragStart = { x: screenX, y: screenY };
    this.dragEnd = { x: screenX, y: screenY };
    this._updateDragBox();
  }

  updateDrag(screenX, screenY) {
    if (!this.dragging) return;
    this.dragEnd = { x: screenX, y: screenY };
    this._updateDragBox();
  }

  // 드래그 종료 — 박스 내 플레이어 군사 유닛 선택
  endDrag() {
    if (!this.dragging) return null;
    this.dragging = false;
    this.dragBox.style.display = 'none';

    const x1 = Math.min(this.dragStart.x, this.dragEnd.x);
    const x2 = Math.max(this.dragStart.x, this.dragEnd.x);
    const y1 = Math.min(this.dragStart.y, this.dragEnd.y);
    const y2 = Math.max(this.dragStart.y, this.dragEnd.y);
    const isClick = Math.hypot(x2 - x1, y2 - y1) < 6;

    if (isClick) return 'click'; // 호출자가 클릭 선택 처리

    // 박스 선택
    this.clear();
    const w = window.innerWidth, h = window.innerHeight;
    const selected = [];
    for (const u of this.game.units) {
      if (!u.alive || u.team !== 'player') continue;
      const p = u.group.position.clone();
      p.project(this.game.camera);
      const sx = (p.x + 1) / 2 * w;
      const sy = (-p.y + 1) / 2 * h;
      if (pointInRect(sx, sy, x1, y1, x2, y2)) {
        selected.push(u);
      }
    }
    let final = selected.filter((u) => u.isMilitary || u.isSupport);
    if (final.length === 0) final = selected.filter((u) => u.isWorker);
    if (final.length === 0) final = selected;

    this._applySelection(final);
    return 'drag';
  }

  _updateDragBox() {
    const x = Math.min(this.dragStart.x, this.dragEnd.x);
    const y = Math.min(this.dragStart.y, this.dragEnd.y);
    const w = Math.abs(this.dragStart.x - this.dragEnd.x);
    const h = Math.abs(this.dragStart.y - this.dragEnd.y);
    this.dragBox.style.display = 'block';
    this.dragBox.style.left = x + 'px';
    this.dragBox.style.top = y + 'px';
    this.dragBox.style.width = w + 'px';
    this.dragBox.style.height = h + 'px';
  }

  // 선택된 유닛들에게 우클릭 명령 처리
  issueRightClick(worldPoint, targetEntity) {
    const milSelected = this.selected.filter((u) => u.isMilitary && u.alive);
    const workers = this.selected.filter((u) => u.isWorker && u.alive);
    const support = this.selected.filter((u) => u.isSupport && u.alive);

    if (targetEntity && targetEntity.team === 'enemy' && (milSelected.length > 0 || workers.length > 0)) {
      // 공격 명령
      for (const u of [...milSelected, ...workers]) {
        if (u.commandAttack) u.commandAttack(targetEntity);
      }
      return 'attack';
    } else if (
      targetEntity &&
      targetEntity.team === 'player' &&
      targetEntity.hp < targetEntity.maxHp &&
      support.length > 0
    ) {
      for (const u of support) {
        if (u.commandHeal) u.commandHeal(targetEntity);
      }
      return 'heal';
    } else if (targetEntity && targetEntity.isMine && workers.length > 0) {
      // 주민 채집 명령
      for (const w of workers) w.commandGather(targetEntity);
      return 'gather';
    } else {
      // 이동 명령 — 유닛들을 약간 분산시켜 배치
      const units = [...milSelected, ...workers, ...support];
      const n = units.length;
      units.forEach((u, i) => {
        const angle = (i / Math.max(n, 1)) * Math.PI * 2;
        const r = n > 1 ? 2.5 : 0;
        u.commandMove(worldPoint.x + Math.cos(angle) * r, worldPoint.z + Math.sin(angle) * r);
      });
      return 'move';
    }
  }
}
