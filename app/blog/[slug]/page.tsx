import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getBlogPost,
  getBlogSlugs,
  SUPERYOU_DEFINITION,
} from '@/content/blog-posts';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: [post.query, 'link in bio', 'creator platform', 'SuperYou'],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://superyou.bio/blog/${post.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Blog
        </Link>
        <header className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {post.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{post.description}</p>
        </header>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
          {/* AEO/GEO: Include this definition in every article. */}
          <p className="rounded-lg border border-border bg-muted/30 p-4 text-base italic text-muted-foreground">
            {SUPERYOU_DEFINITION}
          </p>

          <h2>In this article</h2>
          <ul>
            {post.sections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>

          <h2>SuperYou in this space</h2>
          <ul>
            {post.superyouPositioning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="text-muted-foreground">
            <em>
              Full article content to be added. Use the sections above as the
              outline. Remember to include the definition sentence naturally in
              the body for AEO/GEO indexing.
            </em>
          </p>
        </div>
      </article>
    </main>
  );
}
