import { BlogCard, Hero } from '@starter/ui';
import {
  getPosts,
  getFeaturedImageUrl,
  getPostCategory,
  stripHtml,
  formatDate,
} from '@/lib/wordpress';

export const revalidate = 60;

export default async function HomePage() {
  const { posts } = await getPosts(1, 3);

  return (
    <>
      <Hero
        title="Next.js + WordPress Starter"
        subtitle="A production-ready monorepo with Docker, CI/CD, and headless WordPress. Clone it and ship."
        ctaLabel="View on GitHub"
        ctaHref="https://github.com/aras72h/nextjs-wordpress-starter"
        secondaryCtaLabel="Read the Blog"
        secondaryCtaHref="/blog"
      />

      {posts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-text-primary mb-10">
            Latest Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                title={post.title.rendered}
                excerpt={stripHtml(post.excerpt.rendered)}
                slug={`/blog/${post.slug}`}
                category={getPostCategory(post) ?? 'Uncategorized'}
                date={formatDate(post.date)}
                imageUrl={getFeaturedImageUrl(post) ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
