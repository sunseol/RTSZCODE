import * as THREE from 'three';

// 중세 오후 햇살 느낌의 조명 + 안개
export function createLighting(scene) {
  // 환경광 (부드러운 전체 조명)
  const ambient = new THREE.AmbientLight(0xb8a07a, 0.55);
  scene.add(ambient);

  // 하늘광 (위쪽에서 오는 약한 파란빛)
  const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x5a4628, 0.45);
  scene.add(hemi);

  // 태양 (주 방향광)
  const sun = new THREE.DirectionalLight(0xfff0c4, 1.15);
  sun.position.set(60, 90, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 300;
  sun.shadow.camera.left = -90;
  sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90;
  sun.shadow.camera.bottom = -90;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);

  // 따뜻한 톤의 안개 (먼 곳 흐려짐)
  scene.fog = new THREE.Fog(0x9bb0c4, 70, 200);

  return { sun, ambient, hemi };
}
