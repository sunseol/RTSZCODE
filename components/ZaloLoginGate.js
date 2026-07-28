const errorMessages = {
  denied: 'Zalo 로그인이 취소되었습니다. 다시 시도해 주세요.',
  state: '로그인 요청을 확인할 수 없습니다. 처음부터 다시 시도해 주세요.',
  token: 'Zalo 인증 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  profile: 'Zalo 프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  callback: '로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  configuration: 'Zalo 로그인 설정이 아직 완료되지 않았습니다.',
};

export default function ZaloLoginGate({ configured, error, errorCode }) {
  const errorMessage = errorMessages[error];

  return (
    <main className="zalo-gate">
      <div className="zalo-gate__atmosphere" aria-hidden="true" />
      <section className="zalo-gate__card" aria-labelledby="zalo-login-title">
        <a className="zalo-gate__brand" href="/">
          역전 <span>歷戰</span>
        </a>
        <p className="zalo-gate__eyebrow">전장 입장 확인</p>
        <h1 id="zalo-login-title">장수의 이름으로 입장하세요.</h1>
        <p className="zalo-gate__copy">
          전투 기록과 플레이어를 구분하기 위해 Zalo 계정 확인이 필요합니다.
          비밀번호는 역전 서버에 전달되지 않습니다.
        </p>

        {errorMessage ? (
          <p className="zalo-gate__alert" role="alert">
            {errorMessage}
            {errorCode ? ` (Zalo 오류 코드 ${errorCode})` : null}
          </p>
        ) : null}

        {configured ? (
          <a className="zalo-login-button" href="/api/auth/zalo">
            <span className="zalo-login-button__mark" aria-hidden="true">
              Z
            </span>
            Zalo로 계속하기
          </a>
        ) : (
          <span className="zalo-login-button zalo-login-button--disabled" aria-disabled="true">
            <span className="zalo-login-button__mark" aria-hidden="true">
              Z
            </span>
            Zalo 로그인 준비 중
          </span>
        )}

        <p className="zalo-gate__privacy">
          로그인 시 Zalo의 공개 프로필 이름과 사진만 사용하며, 인증 토큰은 저장하지
          않습니다.
        </p>
        <a className="zalo-gate__back" href="/">
          랜딩 페이지로 돌아가기
        </a>
      </section>
    </main>
  );
}
