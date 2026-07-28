const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://medieval-rts.vercel.app';

export default function sitemap() {
  const now = new Date();
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // /play 는 robots.txt 에서 disallow + noindex 이므로 sitemap 에서 제외
    // (색인 대상만 sitemap 에 포함하는 것이 권장됨)
  ];
}
