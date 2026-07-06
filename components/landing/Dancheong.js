/**
 * 단청 장식 — 전통 당초문·구름무늬를 미니멀한 라인아트로 추상화.
 * 흑백 베이스에 황금/주홍 라인으로만 스며들게 한다.
 */

// 당초문(唐草文) 스타일 꽃무늬 — SVG path
export function DancheongFlower({ size = 48, className = '', color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth="1.4" fill="none" opacity="0.85">
        {/* 중심 팔엽 당초문 */}
        <circle cx="50" cy="50" r="6" />
        <path d="M50 44 C44 30, 56 30, 50 44" />
        <path d="M50 56 C56 70, 44 70, 50 56" />
        <path d="M44 50 C30 56, 30 44, 44 50" />
        <path d="M56 50 C70 44, 70 56, 56 50" />
        <path d="M46 46 C36 40, 40 36, 46 46" />
        <path d="M54 54 C64 60, 60 64, 54 54" />
        <path d="M54 46 C60 36, 64 40, 54 46" />
        <path d="M46 54 C40 64, 36 60, 46 54" />
      </g>
    </svg>
  );
}

// 구름무늬(雲紋) — 단선 곡선
export function CloudLine({ className = '', color = 'currentColor' }) {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d="M2 30 C 12 14, 26 14, 34 28 C 40 38, 52 38, 58 26 C 64 14, 78 14, 86 28 C 92 38, 104 36, 118 22"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

// 태극(太極) — 코너 장식용 절제된 스핀
export function Taegeuk({ size = 60, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path
        d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 4 A46 46 0 0 0 50 96 A23 23 0 0 0 50 50 A23 23 0 0 1 50 4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.9"
      />
    </svg>
  );
}

// 섹션 상단 가로 장식줄 — 황금 단선 + 중앙 당초문
export function DancheongDivider({ color = 'var(--dancheong-gold)' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        opacity: 0.6,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          width: 'min(80px, 18vw)',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color})`,
        }}
      />
      <DancheongFlower size={26} color={color} />
      <span
        style={{
          width: 'min(80px, 18vw)',
          height: 1,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />
    </div>
  );
}
