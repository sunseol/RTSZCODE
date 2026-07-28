'use client';

import Script from 'next/script';

/**
 * 분석 스크립트 묶음.
 * - GA4 (Google Analytics 4): NEXT_PUBLIC_GA_ID 가 있을 때만 로드
 * - 네이버 GFA (Biz Event Tracking): NEXT_PUBLIC_NAVER_GFA_KEY 가 있을 때만 로드
 *
 * 모든 외부 분석은 이 컴포넌트 한 곳에서 관리.
 * layout.js 의 <body> 끝에 한 번만 배포하면 됨.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const naverKey = process.env.NEXT_PUBLIC_NAVER_GFA_KEY;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                anonymize_ip: true,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {naverKey ? (
        <Script
          id="naver-gfa"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (!window.ABSO) {
                window.ABSO = { config: { key: '${naverKey}' } };
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://product.gfa.newdt.co.kr/abso.js';
                var fs = document.getElementsByTagName('script')[0];
                fs.parentNode.insertBefore(s, fs);
              }
            `,
          }}
        />
      ) : null}
    </>
  );
}
