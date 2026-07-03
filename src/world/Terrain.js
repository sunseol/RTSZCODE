import * as THREE from 'three';
import { smoothNoise } from '../utils/helpers.js';

// 로우폴리 중세 지형 — 잔디 평원 + 노이즈 굴곡 + 산악 테두리 + 나무/바위 데코
export class Terrain {
  constructor(scene, size = 160) {
    this.size = size;
    this.half = size / 2;
    this.noise = smoothNoise(42);
    this.heightAt = this.heightAt.bind(this);

    this.group = new THREE.Group();
    scene.add(this.group);

    this._buildGround();
    this._buildBorderMountains();
    this._scatterProps();
  }

  // (x,z) 위치의 지형 높이 반환 — 부드러운 노이즈 기반 굴곡
  heightAt(x, z) {
    const n1 = this.noise(x * 0.025, z * 0.025);
    const n2 = this.noise(x * 0.07, z * 0.07) * 0.4;
    // 가장자리로 갈수록 산악 테두리로 올라감
    const edgeDist = Math.min(this.half - Math.abs(x), this.half - Math.abs(z));
    const edgeRise = edgeDist < 30 ? Math.pow((30 - edgeDist) / 30, 2) * 14 : 0;
    return (n1 + n2) * 1.6 + edgeRise;
  }

  _buildGround() {
    const seg = 64;
    const geo = new THREE.PlaneGeometry(this.size, this.size, seg, seg);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = [];
    const cGrass = new THREE.Color(0x5a8a3a);
    const cGrass2 = new THREE.Color(0x6fa047);
    const cDirt = new THREE.Color(0x8a6a3a);
    const cStone = new THREE.Color(0x7a7a78);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.heightAt(x, z);
      pos.setY(i, y);

      // 높이 기반 색상 혼합
      let c;
      if (y > 8) {
        c = cStone.clone().lerp(new THREE.Color(0xa8a8a8), Math.random() * 0.3);
      } else if (y > 3.5) {
        c = cDirt.clone().lerp(cGrass2, Math.random() * 0.5);
      } else {
        c = cGrass.clone().lerp(cGrass2, Math.random());
      }
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    this.ground = new THREE.Mesh(geo, mat);
    this.ground.receiveShadow = true;
    this.group.add(this.ground);
  }

  _buildBorderMountains() {
    // 테두리 산 느낌을 강화하기 위해 큰 돌 더미들을 가장자리에 배치
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x6e6e6c, flatShading: true });
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const r = this.half - 4 - Math.random() * 6;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const s = 2 + Math.random() * 5;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, this.heightAt(x, z) + s * 0.3, z);
      rock.scale.set(s, s * (0.7 + Math.random() * 0.5), s);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);
    }
  }

  _scatterProps() {
    // 나무와 바위를 랜덤하게 흩뿌림 (중앙 기지 부근은 비움)
    for (let i = 0; i < 90; i++) {
      const x = (Math.random() - 0.5) * (this.size - 20);
      const z = (Math.random() - 0.5) * (this.size - 20);
      // 기지 반경 비움
      if (Math.hypot(x - (-45), z) < 16) continue;
      if (Math.hypot(x - 45, z) < 16) continue;
      const y = this.heightAt(x, z);
      if (y > 6) {
        this.group.add(this._makeRock(x, y, z));
      } else if (Math.random() > 0.3) {
        this.group.add(this._makeTree(x, y, z));
      } else {
        this.group.add(this._makeBush(x, y, z));
      }
    }
  }

  _makeTree(x, y, z) {
    const tree = new THREE.Group();
    const h = 1.8 + Math.random() * 1.6;
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, h, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1e, flatShading: true });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = h / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    const leafColors = [0x2f5e22, 0x3a7a2a, 0x4a8a34];
    const leafMat = new THREE.MeshLambertMaterial({
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      flatShading: true,
    });
    const coneGeo = new THREE.ConeGeometry(1.1, 2.2, 7);
    const cone = new THREE.Mesh(coneGeo, leafMat);
    cone.position.y = h + 0.8;
    cone.castShadow = true;
    tree.add(cone);

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.6, 7), leafMat);
    cone2.position.y = h + 1.8;
    cone2.castShadow = true;
    tree.add(cone2);

    tree.position.set(x, y, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    const s = 0.8 + Math.random() * 0.6;
    tree.scale.setScalar(s);
    return tree;
  }

  _makeBush(x, y, z) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x4a7a3a, flatShading: true });
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), mat);
    bush.position.set(x, y + 0.3, z);
    bush.scale.set(1 + Math.random(), 0.7, 1 + Math.random());
    bush.castShadow = true;
    return bush;
  }

  _makeRock(x, y, z) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x888884, flatShading: true });
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), mat);
    rock.position.set(x, y + 0.3, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(1 + Math.random(), 0.8 + Math.random() * 0.5, 1 + Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }
}
