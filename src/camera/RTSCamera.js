import * as THREE from 'three';

// RTS 카메라: 마우스 엣지 스크롤, 키보드 WASD/화살표, 휠 줌, Q/E 회전
export class RTSCamera {
  constructor(camera, domElement, terrain) {
    this.camera = camera;
    this.dom = domElement;
    this.terrain = terrain;

    this.target = new THREE.Vector3(0, 0, 0); // 카메라가 바라보는 지상 점
    this.distance = 55;      // 타겟으로부터의 거리
    this.pitch = 0.9;        // 피치 (위에서 내려다보는 정도, 라디안). 약 51도
    this.yaw = 0;            // 수평 회전 (라디안). 0 = -Z 방향을 앞으로 봄
    this.scrollSpeed = 45;
    this.rotateSpeed = 1.5;  // Q/E 회전 속도
    this.zoomMin = 25;
    this.zoomMax = 95;
    this.keys = new Set();

    this.mouseX = 0;
    this.mouseY = 0;
    this.edgeScrollEnabled = true;
    this.edgeMargin = 28;

    this._bindEvents();
    // 카메라 위치를 한 번 갱신해서 forward/right 벡터를 초기화
    this.update(0);
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    this.dom.addEventListener('mousemove', (e) => {
      const rect = this.dom.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    this.dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.distance = THREE.MathUtils.clamp(
        this.distance + e.deltaY * 0.05,
        this.zoomMin,
        this.zoomMax
      );
    }, { passive: false });
  }

  setTarget(x, z) {
    this.target.x = x;
    this.target.z = z;
  }

  _forwardVector() {
    return { x: -Math.sin(this.yaw), z: -Math.cos(this.yaw) };
  }

  // 카메라의 수평 우측 벡터 — "화면에서 오른쪽" 방향
  _rightVector(forward) {
    // forward와 수직 (XZ 평면에서 90도 회전). 카메라 기준 오른쪽.
    // forward=(0,-1)일 때 right=(+1, 0)이 되어야 화면 오른쪽=월드 +X
    return { x: -forward.z, z: forward.x };
  }

  update(dt) {
    // ===== 1. 입력 → 화면 공간 이동 벡터 (forward/right 입력) =====
    let inputF = 0; // 앞(화면 위) 방향 입력량
    let inputR = 0; // 오른쪽(화면 우) 방향 입력량

    // 키보드: W/↑ = 앞, S/↓ = 뒤, A/← = 왼, D/→ = 오른
    if (this.keys.has('w') || this.keys.has('arrowup')) inputF += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) inputF -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) inputR += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) inputR -= 1;

    // 엣지 스크롤: 마우스가 화면 가장자리에 있을 때
    if (this.edgeScrollEnabled && this.mouseX > 0 && this.mouseY > 0) {
      const rect = this.dom.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      // 왼쪽 엣지 → 왼쪽(inputR 음수), 오른쪽 엣지 → 오른쪽(inputR 양수)
      if (this.mouseX < this.edgeMargin) inputR -= (this.edgeMargin - this.mouseX) / this.edgeMargin;
      else if (this.mouseX > w - this.edgeMargin)
        inputR += (this.mouseX - (w - this.edgeMargin)) / this.edgeMargin;
      // 위쪽 엣지 → 앞(inputF 양수), 아래쪽 엣지 → 뒤(inputF 음수)
      if (this.mouseY < this.edgeMargin) inputF += (this.edgeMargin - this.mouseY) / this.edgeMargin;
      else if (this.mouseY > h - this.edgeMargin)
        inputF -= (this.mouseY - (h - this.edgeMargin)) / this.edgeMargin;
    }

    // 회전 (Q/E) — yaw 변경
    if (this.keys.has('q')) this.yaw += this.rotateSpeed * dt;
    if (this.keys.has('e')) this.yaw -= this.rotateSpeed * dt;

    // ===== 2. 입력 벡터를 실제 월드 이동으로 변환 =====
    // forward/right 벡터를 기준으로 이동 → 화면 방향과 월드 방향이 정확히 일치
    const fwd = this._forwardVector();
    const right = this._rightVector(fwd);

    // 입력 크기 정규화 (대각선이 더 빠르지 않도록)
    const inputLen = Math.hypot(inputF, inputR);
    if (inputLen > 0.001) {
      // 입력이 1을 초과하면 정규화, 아니면 그대로 (엣지 스크롤 강도 보존)
      const norm = inputLen > 1 ? inputLen : 1;
      const fN = inputF / norm;
      const rN = inputR / norm;
      const speed = this.scrollSpeed * dt;
      // 월드 이동 = forward * inputF + right * inputR
      this.target.x += (fwd.x * fN + right.x * rN) * speed;
      this.target.z += (fwd.z * fN + right.z * rN) * speed;
    }

    // ===== 3. 지형 경계 제한 + 높이 적용 =====
    const bound = 74;
    this.target.x = THREE.MathUtils.clamp(this.target.x, -bound, bound);
    this.target.z = THREE.MathUtils.clamp(this.target.z, -bound, bound);
    this.target.y = this.terrain.heightAt(this.target.x, this.target.z);

    // ===== 4. 카메라 위치 계산 (구면 좌표) =====
    // yaw/pitch/distance로 target 주위의 위치 결정
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    // 카메라는 target의 뒤위쪽에 위치.
    // yaw=0일 때 카메라는 +Z 쪽에 있어서 -Z 방향을 바라봄 (전방 = -Z)
    const cx = this.target.x + sy * this.distance * cp;
    const cz = this.target.z + cy * this.distance * cp;
    const cyy = this.target.y + this.distance * sp;

    this.camera.position.set(cx, cyy, cz);
    this.camera.lookAt(this.target.x, this.target.y + 2, this.target.z);
  }

  // 화면 좌표(NDC) → 지상 세계 좌표 (raycaster 사용)
  screenToWorldGround(ndcX, ndcY) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
    // 지형 평면(타겟 높이)과의 교차로 근사
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.target.y);
    const hit = new THREE.Vector3();
    if (ray.ray.intersectPlane(plane, hit)) {
      hit.y = this.terrain.heightAt(hit.x, hit.z);
      return hit;
    }
    return null;
  }
}
