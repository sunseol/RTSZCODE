import * as THREE from 'three';
import { Barracks, Farm } from '../entities/Building.js';
import { WatchTower } from '../entities/WatchTower.js';
import { dist2D } from '../utils/helpers.js';

// 건설 시스템 — 건물 배치(placement) 모드 + 주민 건설 동작
// 건물 타입 레지스트리
export const BUILD_OPTIONS = [
  {
    key: 'barracks',
    name: '병영 건설',
    BuildingClass: Barracks,
    cost: { gold: 120, food: 0 },
    buildTime: 8,
    icon: '⚒️',
    desc: '기사/궁수 훈련',
  },
  {
    key: 'farm',
    name: '농장 건설',
    BuildingClass: Farm,
    cost: { gold: 80, food: 0 },
    buildTime: 6,
    icon: '🌾',
    desc: '식량(Food) 생산 +3/초',
  },
  {
    key: 'watchTower',
    name: '감시탑 건설',
    BuildingClass: WatchTower,
    cost: { gold: 110, food: 25 },
    buildTime: 7,
    icon: '🛡️',
    desc: '주변 적 자동 공격',
  },
];

export class BuildSystem {
  constructor(game) {
    this.game = game;
    this.placementMode = false;     // 배치 모드 진입 여부
    this.placementOption = null;    // 현재 배치 중인 건물 옵션
    this.ghost = null;              // ghost 미리보기 메시
    this.ghostValid = false;        // 현재 위치 유효한가
  }

  // 배치 모드 진입
  enterPlacement(optionKey) {
    const opt = BUILD_OPTIONS.find((o) => o.key === optionKey);
    if (!opt) return;
    this.placementOption = opt;
    this.placementMode = true;
    this._createGhost(opt.BuildingClass);
    // 카메라 엣지 스크롤 비활성 (배치 중엔 마우스 이탈 방지)
    this.game.rtsCamera.edgeScrollEnabled = false;
  }

  // 배치 모드 취소
  cancelPlacement() {
    this.placementMode = false;
    this.placementOption = null;
    this._removeGhost();
    this.game.rtsCamera.edgeScrollEnabled = true;
  }

  _createGhost(BuildingClass) {
    // 실제 건물과 동일한 메시로 ghost 생성 (반투명)
    const tmp = new BuildingClass(this.game, 0, 0, 'player');
    this.ghost = tmp.group;
    this.ghost.traverse((o) => {
      if (o.material) {
        o.material = o.material.clone();
        o.material.transparent = true;
        o.material.opacity = 0.5;
        o.castShadow = false;
        o.receiveShadow = false;
      }
    });
    this.game.scene.add(this.ghost);
  }

  _removeGhost() {
    if (!this.ghost) return;
    this.game.scene.remove(this.ghost);
    this.ghost.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    this.ghost = null;
  }

  // 매 프레임: ghost 위치를 마우스 위치로 업데이트
  updateGhost(ndcX, ndcY) {
    if (!this.placementMode || !this.ghost) return;
    const point = this.game.rtsCamera.screenToWorldGround(ndcX, ndcY);
    if (!point) return;
    this.ghost.position.set(point.x, point.y, point.z);
    // 위치 유효성 검사 (자원, 다른 건물과 겹침, 성 근처)
    this.ghostValid = this._isValidLocation(point.x, point.z);
    // 색상 표시 (유효=초록, 무효=빨강)
    const color = this.ghostValid ? 0x66ff66 : 0xff4444;
    this.ghost.traverse((o) => {
      if (o.material) o.material.color.setHex(color);
    });
  }

  _isValidLocation(x, z) {
    // 지형 경계 내
    if (Math.abs(x) > 70 || Math.abs(z) > 70) return false;
    // 자원 확인
    if (!this.game.resources.canAfford('player', this.placementOption.cost)) return false;
    // 다른 건물/금광과 겹치지 않게
    const minDist = 6;
    for (const b of this.game.buildings) {
      if (dist2D(x, z, b.x, b.z) < minDist) return false;
    }
    for (const m of this.game.goldMines) {
      if (dist2D(x, z, m.x, m.z) < minDist) return false;
    }
    return true;
  }

  // 클릭 시 건물 배치 확정 (주민에게 건설 명령)
  confirmPlacement(x, z, villager) {
    if (!this.placementMode) return false;
    // 전달받은 좌표로 위치 재검증 (ghostValid가 아직 갱신 전일 수 있음)
    if (!this._isValidLocation(x, z)) return false;
    const opt = this.placementOption;
    // 자원 차감
    this.game.resources.spend('player', opt.cost);
    // 가장 가까운 주민 자동 배정 (전달받지 않은 경우)
    const builder = villager || this.game.findNearestVillager(x, z);
    if (builder) {
      builder.commandBuild(opt.BuildingClass, x, z, opt.buildTime);
    } else {
      // 주민이 없으면 그 자리에 즉시 건물 (fallback)
      this._instantiateBuilding(opt.BuildingClass, x, z);
    }
    this.cancelPlacement();
    return true;
  }

  // 실제 건물 생성 (건설 완료 시 호출)
  instantiateBuilding(BuildingClass, x, z, team = 'player') {
    return this._instantiateBuilding(BuildingClass, x, z, team);
  }

  _instantiateBuilding(BuildingClass, x, z, team = 'player') {
    const building = new BuildingClass(this.game, x, z, team);
    this.game.addBuilding(building);
    return building;
  }

  isPlacementMode() {
    return this.placementMode;
  }
}
