import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { FramerEmbed } from '@/components/landing/framer-embed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'SuperYou – Bio Link, Auto DM & Creator Store Platform',
  },
  description:
    'Build your super-duper creator profile with SuperYou. Share your bio link, sell digital products, capture leads, and Auto DM your audience automatically.',
  keywords: [
    'link in bio tool',
    'creator store',
    'auto dm instagram',
    'sell digital products',
    'creator platform',
    'bio link page',
  ],
  authors: [{ name: 'SuperYou' }],
  robots: {
    index: true,
    follow: true,
  },
  themeColor: '#000000',
  openGraph: {
    title: 'SuperYou – Turn Your Profile Into a Creator Business',
    description:
      'Create your bio link page, sell digital products, and Auto DM your audience from one powerful creator platform.',
    url: 'https://superyou.bio',
    siteName: 'SuperYou',
    images: [
      {
        url: 'https://superyou.bio/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuperYou – Creator Bio Link Platform',
    description:
      'Build your bio link page, sell products, and Auto DM followers.',
    images: ['https://superyou.bio/og-image.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SuperYou',
  applicationCategory: 'CreatorPlatform',
  operatingSystem: 'Web',
  description:
    'SuperYou helps creators build bio link pages, sell digital products, and automate engagement with Auto DM.',
  url: 'https://superyou.bio',
};

/**
 * Index: authenticated → /orbit, unauthenticated → landing (Framer iframe).
 */
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/orbit');
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <main className="fixed inset-0 h-full w-full">
        <FramerEmbed />
      </main>
    </>
  );
}
