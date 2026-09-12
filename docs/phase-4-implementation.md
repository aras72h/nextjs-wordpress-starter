# Phase 4: Next.js Frontend — Core Pages

**Status:** Ready
**Depends On:** Phase 2 (design system), Phase 3 (WordPress API working locally)
**Estimated Duration:** 1-2 weeks

---

## Overview

Build all public-facing pages using Next.js 15 App Router and the WordPress REST API.
By the end of this phase the site is fully functional with real content, SEO metadata,
and a working contact form.

**Success Criteria:**

- All 4 pages render with real WordPress content
- Blog posts update within 60 seconds of publishing in WordPress
- Contact form delivers email via SMTP
- Lighthouse: Performance > 90, Accessibility > 95, SEO = 100
- `pnpm build` passes with zero errors

---

## Current State (Phase 2/3 Baseline)

What already exists:

- `apps/web/app/layout.tsx` — root layout with Inter font, English metadata
- `apps/web/app/page.tsx` — placeholder homepage
- `apps/web/app/globals.css` — design tokens, Tailwind directives
- `apps/web/next.config.js` — `transpilePackages: ['@starter/ui']`, `output: 'standalone'`
- `packages/ui/src/index.ts` — exports Navigation, Footer, Hero, BlogCard, ServiceCard, Button, Badge, Card, Input, Textarea, Label, Separator, Alert, cn
- WordPress REST API running at `http://localhost:12080/wp-json/wp/v2/`
- 4 placeholder posts, 4 categories, 1 sticky post

What does NOT exist yet:

- WordPress data fetching layer (`apps/web/lib/wordpress.ts`)
- Blog list, single post, contact, 404 pages
- `react-hook-form`, `zod`, `nodemailer` not installed
- `next.config.js` missing `images.remotePatterns`
- ContactForm, PostContent, Pagination components

---

## Environment Variables

Add to `.env` and `.env.example`:

```env
# WordPress API
WORDPRESS_API_URL=http://localhost:12080/wp-json/wp/v2

# Next.js public URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Contact form SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL_TO=your@email.com
```

---

## Task 4.1: WordPress Data Layer

**File:** `apps/web/lib/wordpress.ts`

Central data-fetching module. All pages import from here — no page directly calls `fetch`.

```typescript
const API = process.env.WORDPRESS_API_URL!;

async function wpFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status} ${path}`);
  return res.json();
}

export async function getPosts(
  page = 1,
  perPage = 10
): Promise<{
  posts: WPPost[];
  total: number;
  totalPages: number;
}>;

export async function getPostBySlug(slug: string): Promise<WPPost | null>;

export async function getStickyPosts(): Promise<WPPost[]>;

export async function getPostsByCategory(
  categorySlug: string,
  page = 1
): Promise<{
  posts: WPPost[];
  total: number;
  totalPages: number;
}>;

export async function getCategories(): Promise<WPCategory[]>;

export async function getAllPostSlugs(): Promise<string[]>;
```

**Cache strategy:**

- `revalidate: 60` — homepage, blog list
- `revalidate: 0` — `getAllPostSlugs` (build time only)
- On-demand via `/api/revalidate` (Phase 5)

**Error handling:** Return `null` / empty array on fetch failure — never crash pages.

**Acceptance:**

- [ ] All functions exported and typed
- [ ] `getPosts` reads pagination from `X-WP-Total` / `X-WP-TotalPages` headers
- [ ] `getPostBySlug` returns `null` for missing posts

---

## Task 4.2: next.config.js Updates

Add `images.remotePatterns` for WordPress media:

```javascript
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@starter/ui'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '12080',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'nws.arashworks.ir',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};
module.exports = nextConfig;
```

---

## Task 4.3: Homepage (`/`)

**File:** `apps/web/app/page.tsx`

```
┌──────────────────────────────────────────────────────┐
│  Navigation                                          │
├──────────────────────────────────────────────────────┤
│  Hero                                                │
│  title: Next.js + WordPress Starter                  │
│  subtitle: A production-ready monorepo...            │
│  CTA: View on GitHub  /  Read the Blog               │
├──────────────────────────────────────────────────────┤
│  Latest Posts (3 BlogCards — from WordPress)         │
├──────────────────────────────────────────────────────┤
│  Footer                                              │
└──────────────────────────────────────────────────────┘
```

```typescript
export const revalidate = 60

export default async function HomePage() {
  const { posts } = await getPosts(1, 3)
  return (
    <>
      <Navigation />
      <main>
        <Hero
          title="Next.js + WordPress Starter"
          subtitle="A production-ready monorepo with Docker, CI/CD, and headless WordPress."
          ctaLabel="View on GitHub"
          ctaHref="https://github.com/aras72h/nextjs-wordpress-starter"
          secondaryCtaLabel="Read the Blog"
          secondaryCtaHref="/blog"
        />
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-bold text-text-primary mb-10">
            Latest Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} ... />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
```

**Acceptance:**

- [ ] Hero renders with correct text and GitHub link
- [ ] 3 latest posts from WordPress render as BlogCards
- [ ] BlogCard links go to `/blog/[slug]`
- [ ] Revalidates every 60 seconds

---

## Task 4.4: Blog List Page (`/blog`)

**File:** `apps/web/app/blog/page.tsx`

```
┌──────────────────────────────────────────────────────┐
│  Navigation                                          │
├──────────────────────────────────────────────────────┤
│  Page header: Blog                                   │
│  Subtitle: Tutorials, deep dives, and devops guides  │
├──────────────────────────────────────────────────────┤
│  Category filter: All | Tutorial | Deep Dive | ...   │
├──────────────────────────────────────────────────────┤
│  Blog grid (3 columns desktop, 1 mobile)             │
│  10 BlogCards per page                               │
├──────────────────────────────────────────────────────┤
│  Pagination                                          │
├──────────────────────────────────────────────────────┤
│  Footer                                              │
└──────────────────────────────────────────────────────┘
```

**URL structure:**

- `/blog` — page 1, all categories
- `/blog?page=2` — page 2
- `/blog?category=tutorial` — filter by slug

```typescript
export const revalidate = 60;

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page = '1', category } = await searchParams;
  // fetch posts and categories...
}
```

**Pagination component** (`apps/web/components/Pagination.tsx`):

- `<Link>` based, no JavaScript needed
- `?page=N` query params
- Disabled state for first/last page

**Acceptance:**

- [ ] Posts display with correct titles and categories
- [ ] Category filter works via URL params
- [ ] Pagination renders when more than 10 posts exist
- [ ] Empty state when no posts in category

---

## Task 4.5: Single Blog Post Page (`/blog/[slug]`)

**File:** `apps/web/app/blog/[slug]/page.tsx`

```
┌──────────────────────────────────────────────────────┐
│  Navigation                                          │
├──────────────────────────────────────────────────────┤
│  [Category badge]  •  date                           │
│  Title (h1)                                          │
│  [Featured image — full width]                       │
├──────────────────────────────────────────────────────┤
│  Post content (WordPress HTML)                       │
├──────────────────────────────────────────────────────┤
│  Share buttons: Twitter/X, LinkedIn, Copy link       │
├──────────────────────────────────────────────────────┤
│  Footer                                              │
└──────────────────────────────────────────────────────┘
```

**Static generation:**

```typescript
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;
export const revalidate = 60;
```

**PostContent component** (`apps/web/components/PostContent.tsx`):

```tsx
export function PostContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

Install `@tailwindcss/typography`:

```bash
pnpm add --filter @starter/web @tailwindcss/typography
```

Add to `apps/web/tailwind.config.ts` plugins array.

**SEO metadata:**

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post not found | NWS' };

  const title = post.yoast_head_json?.title ?? `${post.title.rendered} | NWS`;
  const description =
    post.yoast_head_json?.description ??
    post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
        ? [post._embedded['wp:featuredmedia'][0].source_url]
        : [],
    },
  };
}
```

**JSON-LD:**

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title.rendered,
  datePublished: post.date,
  dateModified: post.modified,
  author: { '@type': 'Person', name: 'Arash Abolhasani' },
  publisher: {
    '@type': 'Organization',
    name: 'nextjs-wordpress-starter',
    url: 'https://nextjs-wp.arashworks.ir',
  },
};
```

**404 handling:** If `getPostBySlug` returns `null`, call `notFound()`.

**Acceptance:**

- [ ] Post content renders (headings, lists, code blocks, images)
- [ ] Featured image via `next/image`
- [ ] SEO title/description from Yoast with fallback
- [ ] JSON-LD in page source
- [ ] Share buttons work
- [ ] Invalid slug returns 404

---

## Task 4.6: Contact Page (`/contact`)

**File:** `apps/web/app/contact/page.tsx`

```
┌──────────────────────────────────────────────────────┐
│  Navigation                                          │
├──────────────────────────────────────────────────────┤
│  Page header: Contact                                │
│  Subtitle: Have a question? Get in touch.            │
├──────────────────────────────────────────────────────┤
│  ContactForm component                               │
│  Name / Email / Subject / Message / [Send]           │
├──────────────────────────────────────────────────────┤
│  Footer                                              │
└──────────────────────────────────────────────────────┘
```

**Install packages:**

```bash
pnpm add --filter @starter/web react-hook-form@^7.54.0 zod@^3.24.0 @hookform/resolvers@^3.9.0
pnpm add --filter @starter/web nodemailer@^6.9.0
pnpm add --filter @starter/web -D @types/nodemailer
```

**ContactForm** (`apps/web/components/ContactForm.tsx`) — Client Component:

| Field   | Type          | Validation               |
| ------- | ------------- | ------------------------ |
| name    | text          | required, min 2 chars    |
| email   | email         | required, valid format   |
| subject | text          | required, min 3 chars    |
| message | textarea      | required, 10-1000 chars  |
| website | text (hidden) | must be empty (honeypot) |

**Zod schema:**

```typescript
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000),
  website: z.string().max(0), // honeypot
});
```

**API route** (`apps/web/app/api/contact/route.ts`):

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const result = contactSchema.safeParse(body)
  if (!result.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
  if (result.data.website) return Response.json({ success: true }) // honeypot
  await sendEmail({ ... })
  return Response.json({ success: true })
}
```

**Email utility** (`apps/web/lib/email.ts`):

```typescript
import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"NWS" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
}
```

**Acceptance:**

- [ ] Form validates client-side before submitting
- [ ] Honeypot returns fake success
- [ ] Email arrives at `CONTACT_EMAIL_TO`
- [ ] Success/error messages displayed

---

## Task 4.7: 404 Page

**File:** `apps/web/app/not-found.tsx`

```tsx
import Link from 'next/link';
import { Button } from '@starter/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary">
        Page not found
      </h2>
      <p className="text-text-secondary max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
```

---

## Task 4.8: Root Layout Update

**File:** `apps/web/app/layout.tsx`

Add Navigation and Footer so they appear on all pages:

```typescript
import { Navigation, Footer } from '@starter/ui'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-text-primary`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

Note: `not-found.tsx` renders outside the root layout — it will not have Navigation/Footer.

---

## Task 4.9: Revalidation API Stub

Create a stub now — full implementation in Phase 5.

**File:** `apps/web/app/api/revalidate/route.ts`

```typescript
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Phase 5: call revalidatePath() here
  return Response.json({
    revalidated: false,
    message: 'Phase 5 not yet implemented',
  });
}
```

---

## New Files to Create

```
apps/web/
  lib/
    wordpress.ts          # WordPress API data fetching
    email.ts              # Nodemailer utility
  components/
    PostContent.tsx        # Renders WordPress HTML with prose styles
    Pagination.tsx         # Blog list pagination
    ContactForm.tsx        # Contact page form (Client Component)
    ShareButtons.tsx       # Social share buttons (Client Component)
  app/
    blog/
      page.tsx             # Blog list
      [slug]/
        page.tsx           # Single post
    contact/
      page.tsx             # Contact page
    not-found.tsx          # 404 page
    api/
      contact/
        route.ts
      revalidate/
        route.ts           # Stub — full implementation Phase 5
```

---

## Implementation Order

1. Install packages (`react-hook-form`, `zod`, `nodemailer`, `@tailwindcss/typography`)
2. Update `next.config.js` — `images.remotePatterns`
3. Create `lib/wordpress.ts`
4. Create `lib/email.ts`
5. Update `tailwind.config.ts` — add typography plugin
6. Update `layout.tsx` — Navigation + Footer in root layout
7. Build homepage — replace placeholder with real data
8. Build blog list page
9. Build single post page — PostContent, ShareButtons
10. Build contact page — ContactForm, API route
11. Build 404 page
12. Create `/api/revalidate` stub
13. Run `pnpm build` — verify zero errors
14. Test all pages manually with WordPress content
15. Commit on feature branch → push to GitHub

---

## Acceptance Criteria

### Must Have

- [ ] All 4 pages render with real WordPress content
- [ ] Blog list paginates correctly
- [ ] Single post has correct SEO metadata from Yoast (with fallback)
- [ ] Contact form delivers email
- [ ] Honeypot protection active
- [ ] `pnpm build` passes with zero errors
- [ ] 404 page works for invalid URLs
- [ ] WordPress featured images via `next/image`

### Should Have

- [ ] JSON-LD on single post pages
- [ ] Share buttons on single post pages
- [ ] Category filter on blog list
- [ ] Lighthouse Performance > 90 on homepage

### Out of Scope

- On-demand revalidation (Phase 5)
- Real blog content (write later)
- Search functionality
- Comment system
- Production deployment (Phase 7)
