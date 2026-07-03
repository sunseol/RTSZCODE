import * as THREE from 'three';

// RTS 카메라: 마우스 엣지 스크롤, 키보드 WASD/화살표, 휠 줌, Q/E 회전
export class RTSCamera {
  constructor(camera, domElement, terrain) {
    this.camera = camera;
    this.dom = domElement;
    this.terrain = terrain;

    this.target = new THREE.Vector3(0, 0, 0); // 카메라가 바라보는 지상 점
    this.distance = 55;      // 타겟으로부터의 거리
    this.height = 0.62;      // 피치 각도 비율 (위에서 내려다보는 정도)
    this.azimuth = -Math.PI / 2; // 수평 회전
    this.scrollSpeed = 38;
    this.zoomMin = 28;
    this.zoomMax = 90;
    this.keys = new Set();

    this.mouseX = 0;
    this.mouseY = 0;
    this.edgeScrollEnabled = true;

    this._bindEvents();
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

  update(dt) {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    const margin = 30;

    let moveX = 0, moveZ = 0;

    // 키보드 이동
    if (this.keys.has('w') || this.keys.has('arrowup')) moveZ -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) moveZ += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) moveX -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) moveX += 1;

    // 엣지 스크롤 (마우스가 화면 가장자리에 있을 때)
    if (this.edgeScrollEnabled && this.mouseX > 0 && this.mouseY > 0) {
      if (this.mouseX < margin) moveX -= (margin - this.mouseX) / margin;
      else if (this.mouseX > window.innerWidth - margin)
        moveX += (this.mouseX - (window.innerWidth - margin)) / margin;
      if (this.mouseY < margin) moveZ -= (margin - this.mouseY) / margin;
      else if (this.mouseY > window.innerHeight - margin)
        moveZ += (this.mouseY - (window.innerHeight - margin)) / margin;
    }

    // 회전 (Q/E)
    if (this.keys.has('q')) this.azimuth -= 1.2 * dt;
    if (this.keys.has('e')) this.azimuth += 1.2 * dt;

    // 이동 방향을 카메라 회전에 맞춰 변환
    const cosA = Math.cos(this.azimuth);
    const sinA = Math.sin(this.azimuth);
    const worldX = moveX * cosA - moveZ * sinA;
    const worldZ = moveX * sinA + moveZ * cosA;

    const len = Math.hypot(moveX, moveZ);
    const speed = this.scrollSpeed * dt * (len > 1 ? 1 : Math.max(len, 0));
    if (len > 0.001) {
      this.target.x += (worldX / (len || 1)) * speed;
      this.target.z += (worldZ / (len || 1)) * speed;
    }

    // 지형 경계 제한
    const bound = 72;
    this.target.x = THREE.MathUtils.clamp(this.target.x, -bound, bound);
    this.target.z = THREE.MathUtils.clamp(this.target.z, -bound, bound);
    this.target.y = this.terrain.heightAt(this.target.x, this.target.z);

    // 카메라 위치 계산 (타겟 주위를 궤도)
    const pitch = this.height * Math.PI * 0.45 + 0.15;
    const cx = this.target.x + Math.cos(this.azimuth) * this.distance * Math.cos(pitch);
    const cz = this.target.z + Math.sin(this.azimuth) * this.distance * Math.cos(pitch);
    const cy = this.target.y + this.distance * Math.sin(pitch);

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.target.x, this.target.y + 2, this.target.z);
  }

  // 화면 좌표 → 지상 세계 좌표 (raycaster 사용)
  screenToWorldGround(ndcX, ndcY) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
    // 지형은 y = heightAt(x,z) 함수이므로 평면(y=0) 교차 후 보정
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    if (ray.ray.intersectPlane(plane, hit)) {
      hit.y = this.terrain.heightAt(hit.x, hit.z);
      return hit;
    }
    return null;
  }
}
