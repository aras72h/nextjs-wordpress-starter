// =============================================================================
// WordPress REST API — Data Layer
// =============================================================================
// All data fetching goes through this module.
// No page or component should call fetch() directly.
// =============================================================================

const API = process.env.WORDPRESS_API_URL!

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface WPCategory {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

export interface WPFeaturedMedia {
  id: number
  source_url: string
  alt_text: string
  media_details: {
    width: number
    height: number
    sizes?: {
      medium?: { source_url: string }
      large?: { source_url: string }
      full?: { source_url: string }
    }
  }
}

export interface WPPost {
  id: number
  date: string
  modified: string
  slug: string
  status: string
  sticky: boolean
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  featured_media: number
  categories: number[]
  yoast_head_json?: {
    title?: string
    description?: string
    og_description?: string
    og_image?: { url: string }[]
  }
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[]
    'wp:term'?: WPCategory[][]
  }
}

// -----------------------------------------------------------------------------
// Core fetch utility
// -----------------------------------------------------------------------------

async function wpFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate },
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status} ${path}`)
  }

  return res.json()
}

// -----------------------------------------------------------------------------
// Posts
// -----------------------------------------------------------------------------

export async function getPosts(
  page = 1,
  perPage = 10
): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  try {
    const res = await fetch(
      `${API}/posts?page=${page}&per_page=${perPage}&_embed=true`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) return { posts: [], total: 0, totalPages: 0 }

    const posts: WPPost[] = await res.json()
    const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10)
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '0', 10)

    return { posts, total, totalPages }
  } catch {
    return { posts: [], total: 0, totalPages: 0 }
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const posts = await wpFetch<WPPost[]>(
      `/posts?slug=${encodeURIComponent(slug)}&_embed=true`
    )
    return posts[0] ?? null
  } catch {
    return null
  }
}

export async function getStickyPosts(): Promise<WPPost[]> {
  try {
    return await wpFetch<WPPost[]>('/posts?sticky=true&_embed=true')
  } catch {
    return []
  }
}

export async function getPostsByCategory(
  categorySlug: string,
  page = 1,
  perPage = 10
): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
  try {
    // First resolve slug → id
    const categories = await wpFetch<WPCategory[]>(
      `/categories?slug=${encodeURIComponent(categorySlug)}`
    )
    const category = categories[0]
    if (!category) return { posts: [], total: 0, totalPages: 0 }

    const res = await fetch(
      `${API}/posts?categories=${category.id}&page=${page}&per_page=${perPage}&_embed=true`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) return { posts: [], total: 0, totalPages: 0 }

    const posts: WPPost[] = await res.json()
    const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10)
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '0', 10)

    return { posts, total, totalPages }
  } catch {
    return { posts: [], total: 0, totalPages: 0 }
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await wpFetch<WPPost[]>(
      '/posts?per_page=100&_fields=slug',
      0 // no cache — used at build time only
    )
    return posts.map((p) => p.slug)
  } catch {
    return []
  }
}

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------

export async function getCategories(): Promise<WPCategory[]> {
  try {
    return await wpFetch<WPCategory[]>('/categories?per_page=100&hide_empty=true')
  } catch {
    return []
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Extract the featured image URL from an embedded post, or return null. */
export function getFeaturedImageUrl(post: WPPost): string | null {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
}

/** Extract the first category name from an embedded post, or return null. */
export function getPostCategory(post: WPPost): string | null {
  return post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null
}

/** Strip HTML tags and trim to a plain-text excerpt. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/** Format an ISO date string to a readable date. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
