import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Creator tips, link in bio guides, and how to monetize with SuperYou. Bio link, Auto DM, and creator store in one platform.',
  openGraph: {
    title: 'SuperYou Blog – Creator Tips & Guides',
    description:
      'Learn how to grow and monetize as a creator with bio links, Auto DM, and digital products.',
    url: 'https://superyou.bio/blog',
    siteName: 'SuperYou',
    type: 'website',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
