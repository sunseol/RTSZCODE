import * as THREE from 'three';
import { RTSCamera } from './src/camera/RTSCamera.js';

globalThis.window = {
  innerWidth: 1280,
  innerHeight: 720,
  addEventListener() {},
};

const camera = new THREE.PerspectiveCamera(55, 1280 / 720, 0.5, 500);
const dom = {
  addEventListener() {},
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 1280, height: 720 };
  },
};
const terrain = {
  heightAt() {
    return 0;
  },
};
const rtsCamera = new RTSCamera(camera, dom, terrain);
const failures = [];

function resetCamera(yaw = 0) {
  rtsCamera.yaw = yaw;
  rtsCamera.setTarget(0, 0);
  rtsCamera.keys.clear();
  rtsCamera.mouseX = 0;
  rtsCamera.mouseY = 0;
  rtsCamera.update(0.01);
}

function checkSign(value, expected) {
  if (expected === '0') return Math.abs(value) < 0.5;
  if (expected === '+') return value > 0.5;
  return value < -0.5;
}

function testDirection(label, scenario) {
  const { yaw, key, expected } = scenario;
  resetCamera(yaw);
  const before = { x: rtsCamera.target.x, z: rtsCamera.target.z };
  rtsCamera.keys.add(key);
  for (let i = 0; i < 10; i += 1) rtsCamera.update(0.1);
  rtsCamera.keys.clear();
  const dx = rtsCamera.target.x - before.x;
  const dz = rtsCamera.target.z - before.z;
  const ok = checkSign(dx, expected.dx) && checkSign(dz, expected.dz);
  console.log(`[${label}] expected dx${expected.dx}, dz${expected.dz} -> actual dx=${dx.toFixed(1)}, dz=${dz.toFixed(1)} ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failures.push(`${label}: expected dx${expected.dx}, dz${expected.dz}, got dx=${dx.toFixed(1)}, dz=${dz.toFixed(1)}`);
}

function testRotateWhileMoving() {
  resetCamera(0);
  const before = { x: rtsCamera.target.x, z: rtsCamera.target.z };
  rtsCamera.keys.add('q');
  rtsCamera.keys.add('w');
  rtsCamera.update(1);
  rtsCamera.keys.clear();
  const dx = rtsCamera.target.x - before.x;
  const dz = rtsCamera.target.z - before.z;
  const ok = dx < -20 && Math.abs(dx) > Math.abs(dz);
  console.log(`[rotate+forward] yaw=${rtsCamera.yaw.toFixed(2)}, expected updated-yaw movement -> actual dx=${dx.toFixed(1)}, dz=${dz.toFixed(1)} ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failures.push(`rotate+forward: expected updated-yaw movement, got dx=${dx.toFixed(1)}, dz=${dz.toFixed(1)}`);
}

testDirection('yaw=0 W', { yaw: 0, key: 'w', expected: { dx: '0', dz: '-' } });
testDirection('yaw=0 S', { yaw: 0, key: 's', expected: { dx: '0', dz: '+' } });
testDirection('yaw=0 D', { yaw: 0, key: 'd', expected: { dx: '+', dz: '0' } });
testDirection('yaw=0 A', { yaw: 0, key: 'a', expected: { dx: '-', dz: '0' } });
testDirection('yaw=pi/2 W', { yaw: Math.PI / 2, key: 'w', expected: { dx: '-', dz: '0' } });
testDirection('yaw=pi/2 D', { yaw: Math.PI / 2, key: 'd', expected: { dx: '0', dz: '-' } });
testDirection('yaw=pi W', { yaw: Math.PI, key: 'w', expected: { dx: '0', dz: '+' } });
testDirection('yaw=pi D', { yaw: Math.PI, key: 'd', expected: { dx: '-', dz: '0' } });
testRotateWhileMoving();

console.log('\n=== Test failures ===');
console.log(failures.length === 0 ? 'PASS none' : failures.join('\n'));
process.exit(failures.length === 0 ? 0 : 1);
