export default function Footer() {
  return (
    <footer className="footer" id="community">
      <div className="footer__inner">
        <div className="footer__brand">
          <span style={{ color: 'var(--dancheong-red)' }}>⚔</span>
          역전(歷戰)
        </div>

        <nav className="footer__links" aria-label="푸터 링크">
          <a href="/play">게임하기</a>
          <a href="#concept">컨셉</a>
          <a href="#nations">국가</a>
          <a href="#roadmap">로드맵</a>
        </nav>

        <div className="footer__copy">
          © {new Date().getFullYear()} 역전(歷戰) · 한국 역사를 직접 싸우며 배우는 3D RTS
        </div>
      </div>
    </footer>
  );
}
