// 수학 및 유틸리티 헬퍼 함수들

export const TAU = Math.PI * 2;

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function dist2D(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function dist2DSq(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy;
}

// 2D 각도 (라디안) — a에서 b를 바라보는 각도
export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

// a에서 b를 향한 방향 벡터 (정규화)
export function dirTo(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len, len };
}

// 점이 사각형 내부인지 (AABB)
export function pointInRect(px, py, x1, y1, x2, y2) {
  const xmin = Math.min(x1, x2), xmax = Math.max(x1, x2);
  const ymin = Math.min(y1, y2), ymax = Math.max(y1, y2);
  return px >= xmin && px <= xmax && py >= ymin && py <= ymax;
}

// hex 컬러를 THREE 색상으로
export function hex(n) {
  return n;
}

// 가중치 없는 매우 단순한 값진수 (value noise) for 지형
export function smoothNoise(seed = 1) {
  const perm = [];
  for (let i = 0; i < 256; i++) perm[i] = i;
  // seed 기반 셔플
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor((s / 2147483647) * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = perm.concat(perm);
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerpN = (a, b, t) => a + t * (b - a);
  const grad = (h, x, y) => {
    const u = (h & 1) === 0 ? x : -x;
    const v = (h & 2) === 0 ? y : -y;
    return u + v;
  };
  return function noise(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];
    return lerpN(
      lerpN(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerpN(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

// format number with commas
export function formatNum(n) {
  return Math.floor(n).toString();
}
