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
    {
      url: `${siteUrl}/play`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
