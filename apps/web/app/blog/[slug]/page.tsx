import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Badge } from '@starter/ui';
import { PostContent } from '@/components/PostContent';
import { ShareButtons } from '@/components/ShareButtons';
import {
  getPostBySlug,
  getAllPostSlugs,
  getFeaturedImageUrl,
  getPostCategory,
  stripHtml,
  formatDate,
} from '@/lib/wordpress';

export const dynamicParams = true;
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post not found' };

  const title =
    post.yoast_head_json?.title ?? post.title.rendered;
  const description =
    post.yoast_head_json?.og_description ??
    post.yoast_head_json?.description ??
    stripHtml(post.excerpt.rendered).slice(0, 160);
  const image =
    post.yoast_head_json?.og_image?.[0]?.url ??
    getFeaturedImageUrl(post) ??
    undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      ...(image && { images: [image] }),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const featuredImage = getFeaturedImageUrl(post);
  const category = getPostCategory(post);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.rendered,
    datePublished: post.date,
    dateModified: post.modified,
    author: {
      '@type': 'Organization',
      name: 'Next.js WordPress Starter',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Next.js WordPress Starter',
      url: siteUrl,
    },
    ...(featuredImage && { image: featuredImage }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-16">

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-6">
          {category && <Badge>{category}</Badge>}
          <span className="text-text-tertiary text-sm">
            {formatDate(post.date)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-8">
          {post.title.rendered}
        </h1>

        {/* Featured image */}
        {featuredImage && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 border border-border">
            <Image
              src={featuredImage}
              alt={post.title.rendered}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Post content */}
        <PostContent html={post.content.rendered} />

        {/* Divider */}
        <hr className="border-border my-12" />

        {/* Share buttons */}
        <ShareButtons title={post.title.rendered} url={postUrl} />

      </article>
    </>
  );
}
