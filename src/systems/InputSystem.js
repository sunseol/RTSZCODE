// 입력 시스템 — 마우스/키보드 입력을 게임 명령으로 변환
export class InputSystem {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.selection = game.selection;
    this.camera = game.rtsCamera;
    this.bind();
  }

  bind() {
    const canvas = this.canvas;

    // 우클릭 메뉴(컨텍스트 메뉴)만 차단.
    // 브라우저 마우스 제스처(우클릭 드래그 → 뒤로가기)는 mousedown의 preventDefault로는
    // 막을 수 없고 게임 입력을 망칠 뿐이므로, 여기서는 contextmenu만 막는다.
    // 제스처는 CSS(overscroll-behavior)와 브라우저 설정으로 완화한다.
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('mousedown', (e) => {
      if (!this.game.running) return;

      // 배치(placement) 모드가 우선
      if (this.game.build.isPlacementMode()) {
        if (e.button === 0) {
          this._confirmBuild(e);
        } else if (e.button === 2) {
          this.game.build.cancelPlacement();
        }
        return;
      }
      if (e.button === 0) {
        // 좌클릭: 드래그 선택 시작
        const rect = canvas.getBoundingClientRect();
        this.selection.startDrag(e.clientX - rect.left, e.clientY - rect.top);
      } else if (e.button === 2) {
        // 우클릭: 명령
        this._issueCommand(e);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.game.running) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      // 배치 모드: ghost 위치 업데이트
      if (this.game.build.isPlacementMode()) {
        const ndcX = (sx / rect.width) * 2 - 1;
        const ndcY = -(sy / rect.height) * 2 + 1;
        this.game.build.updateGhost(ndcX, ndcY);
        return;
      }
      this.selection.updateDrag(sx, sy);
    });

    canvas.addEventListener('mouseup', (e) => {
      if (!this.game.running) return;
      if (this.game.build.isPlacementMode()) return;
      if (e.button !== 0) return;
      const result = this.selection.endDrag();
      if (result === 'click') {
        // 단일 클릭 선택
        const rect = canvas.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const ent = this.selection.pickEntity(ndcX, ndcY);
        if (ent) {
          this.selection.selectSingle(ent);
        } else {
          this.selection.clear();
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!this.game.running) return;
      const k = e.key.toLowerCase();
      // 배치 모드 취소
      if (k === 'escape' && this.game.build.isPlacementMode()) {
        this.game.build.cancelPlacement();
        return;
      }
      if (k === 'escape') this.selection.clear();
      if (k === 's') {
        // S 키: 선택된 유닛 정지
        for (const u of this.selection.selected) {
          if (u.commandStop) u.commandStop();
        }
      }
      // 숫자키 1-4: 생산 단축키 (선택된 건물 기준)
      if (k >= '1' && k <= '4') {
        const idx = parseInt(k) - 1;
        const sel = this.selection.selected[0];
        if (sel && sel.getProductionOptions) {
          const opts = sel.getProductionOptions();
          if (opts[idx]) sel.queueUnit(opts[idx].unitClass);
        }
      }
      // B 키: 병영 건설 단축키 (주민 선택 시)
      if (k === 'b') {
        const hasWorker = this.selection.selected.some((u) => u.isWorker);
        if (hasWorker) this.game.build.enterPlacement('barracks');
      }
    });
  }

  // 우클릭으로 유닛에게 명령 (이동/공격/채집)
  _issueCommand(e) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // 우클릭한 위치의 지상 좌표
    const worldPoint = this.camera.screenToWorldGround(ndcX, ndcY);
    // 우클릭한 위치의 엔티티
    const targetEntity = this.selection.pickEntity(ndcX, ndcY);

    if (worldPoint) {
      const cmdType = this.selection.issueRightClick(worldPoint, targetEntity);
      this.game.ui.hud.flashCommandMarker(worldPoint, cmdType);
    }
  }

  // 배치 모드에서 좌클릭 → 건설 확정
  _confirmBuild(e) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const point = this.game.rtsCamera.screenToWorldGround(ndcX, ndcY);
    if (!point) return;
    // 선택된 주민이 있으면 그 중 가까운 사람, 없으면 자동 배정
    const workers = this.selection.selected.filter((u) => u.isWorker && u.alive);
    const builder = workers.length > 0 ? workers[0] : null;
    this.game.build.confirmPlacement(point.x, point.z, builder);
  }
}
