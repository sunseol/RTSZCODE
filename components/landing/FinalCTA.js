import Link from 'next/link';
import { DancheongDivider } from './Dancheong';

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="final-cta__inner">
        <div style={{ marginBottom: 44 }}>
          <DancheongDivider />
        </div>

        <h2>
          역사의 한가운데로,
          <br />
          <em>지금</em> 들어서십시오.
        </h2>

        <p>
          가벼운 마음으로, 설치 없이. 당신의 국가를 골라 첫 전쟁을 시작하세요.
          교과서에서는 만날 수 없었던 한국 고대사를 직접 체험하게 됩니다.
        </p>

        <Link href="/play" className="btn btn--primary">
          게임 시작하기 →
        </Link>
      </div>
    </section>
  );
}
