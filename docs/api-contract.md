# API Contract

**Last Updated:** 2026-08-29

Defines all API endpoints and data contracts for integration between WordPress,
Next.js, and external services.

---

## WordPress REST API (Consumed by Next.js)

### Base URL

```
WORDPRESS_API_URL env var (e.g. http://localhost:12080/wp-json/wp/v2)
```

---

### Get All Published Posts

**Endpoint:** `GET /posts`

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `per_page` | number | 10 | Posts per page (max 100) |
| `page` | number | 1 | Page number |
| `_embed` | boolean | false | Include featured image data |
| `orderby` | string | `date` | Sort field |
| `order` | string | `desc` | Sort direction |
| `categories` | number | — | Filter by category ID |
| `sticky` | boolean | — | Filter sticky posts only |

**Example:**
```bash
GET /wp/v2/posts?per_page=10&page=1&_embed=true
```

**Response:**
```json
[
  {
    "id": 1,
    "slug": "nextjs-wordpress-stack",
    "date": "2026-08-01T10:30:00",
    "modified": "2026-08-02T15:00:00",
    "sticky": true,
    "title": { "rendered": "Why Next.js 15 + WordPress is a great stack" },
    "excerpt": { "rendered": "<p>A short summary...</p>" },
    "content": { "rendered": "<p>Full post content...</p>" },
    "categories": [3],
    "yoast_head_json": {
      "title": "Why Next.js 15 + WordPress is a great stack | NWS",
      "description": "SEO description from Yoast",
      "og_image": [{ "url": "https://..." }]
    },
    "_embedded": {
      "wp:featuredmedia": [
        {
          "source_url": "http://localhost:12080/wp-content/uploads/2026/08/post.jpg",
          "alt_text": "Post image",
          "media_details": { "width": 1200, "height": 630 }
        }
      ],
      "wp:term": [
        [{ "id": 3, "name": "Stack", "slug": "stack" }]
      ]
    }
  }
]
```

**Response Headers:**
- `X-WP-Total` — total number of posts
- `X-WP-TotalPages` — total pages

---

### Get Single Post by Slug

**Endpoint:** `GET /posts?slug={slug}&_embed=true`

Returns array with single item (WordPress convention).
Returns empty array `[]` if slug not found — handle as `null` in Next.js.

---

### Get Sticky Posts

**Endpoint:** `GET /posts?sticky=true&_embed=true`

---

### Get Posts by Category

**Endpoint:** `GET /posts?categories={id}&per_page=10&page=1&_embed=true`

First resolve category slug to ID via `GET /categories?slug={slug}`.

---

### Get Categories

**Endpoint:** `GET /categories`

**Response:**
```json
[
  { "id": 3, "name": "Stack", "slug": "stack", "count": 1 },
  { "id": 4, "name": "Tutorial", "slug": "tutorial", "count": 1 },
  { "id": 5, "name": "Deep Dive", "slug": "deep-dive", "count": 1 },
  { "id": 6, "name": "DevOps", "slug": "devops", "count": 1 }
]
```

---

## TypeScript Interfaces

```typescript
interface WPPost {
  id: number
  slug: string
  date: string            // ISO 8601
  modified: string        // ISO 8601
  sticky: boolean
  title: { rendered: string }
  excerpt: { rendered: string }   // HTML — strip tags for meta description
  content: { rendered: string }  // HTML — render with dangerouslySetInnerHTML
  categories: number[]
  yoast_head_json?: {
    title?: string
    description?: string
    og_image?: { url: string }[]
  }
  _embedded?: {
    'wp:featuredmedia'?: {
      source_url: string
      alt_text: string
      media_details?: { width: number; height: number }
    }[]
    'wp:term'?: { id: number; name: string; slug: string }[][]
  }
}

interface WPCategory {
  id: number
  name: string
  slug: string
  count: number
}
```

---

## Next.js Revalidation API (Called by WordPress Webhook)

### Endpoint

`POST /api/revalidate`

**Authentication:** Shared secret in query string.

```bash
POST /api/revalidate?secret=your-secret
Content-Type: application/json
```

**Request Body (sent by WordPress webhook plugin):**
```json
{
  "event": "post.published",
  "post_id": 1,
  "slug": "nextjs-wordpress-stack",
  "type": "post",
  "timestamp": "2026-08-01T10:30:00Z"
}
```

**Success Response (200):**
```json
{
  "revalidated": true,
  "paths": ["/", "/blog", "/blog/nextjs-wordpress-stack"]
}
```

**Error Responses:**

| Status | Body | Cause |
|---|---|---|
| 401 | `{ "error": "Unauthorized" }` | Wrong or missing secret |
| 400 | `{ "error": "Bad Request" }` | Malformed payload |
| 500 | `{ "error": "Revalidation failed" }` | Next.js internal error |

**Revalidation logic per event:**
- `post.published` → revalidate `/`, `/blog`, `/blog/[slug]`
- `post.updated` → revalidate `/blog/[slug]`
- `post.deleted` → revalidate `/`, `/blog`

**Note:** Phase 4 creates a stub. Full implementation in Phase 5.

---

## Next.js Contact Form API

### Endpoint

`POST /api/contact`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Question about the stack",
  "message": "I wanted to ask about the ISR configuration...",
  "website": ""
}
```

**Validation Rules:**
- `name`: required, min 2 chars
- `email`: required, valid format
- `subject`: required, min 3 chars
- `message`: required, 10-1000 chars
- `website`: must be empty (hidden honeypot — bots fill it)

**Success Response (200):**
```json
{ "success": true }
```

**Honeypot Response (200 — fake success):**
```json
{ "success": true }
```
Returns success without sending email. Does not reveal anti-spam mechanism to bots.

**Error Response (400):**
```json
{ "error": "Invalid data" }
```

**Error Response (500):**
```json
{ "error": "Failed to send email" }
```

**Email format sent to admin:**
```
From: "NWS" <smtp-user@domain.com>
To: CONTACT_EMAIL_TO
Subject: New contact: Question about the stack

Name: Jane Smith
Email: jane@example.com
Subject: Question about the stack

Message:
I wanted to ask about the ISR configuration...
```

---

## Authentication Summary

| Endpoint | Auth Method |
|---|---|
| WordPress REST API (read) | None — public |
| `/api/revalidate` | Shared secret in query string (`REVALIDATION_SECRET` env var) |
| `/api/contact` | None — honeypot anti-spam |

---

## Error Handling Strategy

### WordPress API Errors
- **404:** Return `null` — handled gracefully in pages (show 404 via `notFound()`)
- **Network error:** Return empty array — pages show empty state, never crash
- **500:** Log error, show generic error UI

### Webhook Failures
- WordPress fires and forgets (`blocking: false`) — won't block post publish
- Invalid secret → logged in Next.js, ignored
- Manual fallback: call `/api/revalidate` directly with correct secret

### Contact Form
- Validation error → 400 with field error message
- Honeypot filled → 200 fake success (silent)
- Email send failed → 500, log details
