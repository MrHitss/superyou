import type { MetadataRoute } from 'next';
import { getBlogSlugs } from '@/content/blog-posts';

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://superyoubio.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...getBlogSlugs().map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
