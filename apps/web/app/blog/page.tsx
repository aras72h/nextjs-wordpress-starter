import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogCard } from '@starter/ui';
import { Pagination } from '@/components/Pagination';
import {
  getPosts,
  getPostsByCategory,
  getCategories,
  getFeaturedImageUrl,
  getPostCategory,
  stripHtml,
  formatDate,
} from '@/lib/wordpress';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tutorials, deep dives, and devops guides.',
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam, category } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));

  const [{ posts, totalPages }, categories] = await Promise.all([
    category
      ? getPostsByCategory(category, currentPage)
      : getPosts(currentPage),
    getCategories(),
  ]);

  // Preserved params for pagination links
  const preservedParams: Record<string, string> = {};
  if (category) preservedParams.category = category;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-text-primary mb-3">Blog</h1>
        <p className="text-text-secondary text-lg">
          Tutorials, deep dives, and devops guides.
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/blog"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !category
                ? 'bg-primary text-white border-primary'
                : 'border-border text-text-secondary hover:border-primary hover:text-text-primary'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === cat.slug
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-text-secondary hover:border-primary hover:text-text-primary'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : (
        <div className="py-24 text-center">
          <p className="text-text-secondary text-lg">
            {category
              ? `No posts found in this category.`
              : 'No posts published yet.'}
          </p>
          {category && (
            <Link
              href="/blog"
              className="mt-4 inline-block text-primary text-sm font-medium hover:underline"
            >
              View all posts
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/blog"
        searchParams={preservedParams}
      />
    </div>
  );
}
