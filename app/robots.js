const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://medieval-rts.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /play 는 게임 클라이언트 페이지이므로 인덱싱에서 제외 (메타 robots 와 일치)
        disallow: '/play',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
