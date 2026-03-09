import Link from 'next/link';
import { BLOG_POSTS } from '@/content/blog-posts';

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Blog
        </h1>
        <p className="mt-2 text-muted-foreground">
          Creator tips, link in bio guides, and how to monetize with SuperYou.
        </p>
        <ul className="mt-10 space-y-6">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-lg border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {post.description}
                </p>
                <span className="mt-2 inline-block text-xs text-muted-foreground">
                  {post.volume} · {post.query}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
