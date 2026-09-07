# Phase 3: WordPress Backend Setup

**Status:** Ready
**Depends On:** Phase 1 (Docker environment), Phase 2 (complete)
**Estimated Duration:** 1 day

---

## Overview

Set up WordPress as a headless CMS with required plugins, content structure, and test
content. The goal is a working WordPress instance accessible via REST API that Next.js
will consume in Phase 4.

**Automation strategy:**

- Everything is done manually via wp-admin — no WP-CLI required
- WP-CLI is not included in the official WordPress Docker image
- Steps are identical on every environment (local, staging, production)

**Success Criteria:**

- WordPress REST API returns posts at `http://localhost:12080/wp-json/wp/v2/posts`
- Blog categories exist
- Custom plugins active (CORS, webhook)
- 4 placeholder posts published

---

## Task 3.1: First-Time WordPress Installation (Manual)

1. Run `docker compose up -d`, wait 30 seconds
2. Open `http://localhost:12080`
3. Fill in:
   - **Site Title:** NWS (or your project name)
   - **Username:** `admin`
   - **Password:** strong password, save it
   - **Email:** your email
   - **Search Engine Visibility:** unchecked
4. Log in at `http://localhost:12080/wp-admin`

**Acceptance:**

- [x] WordPress admin accessible
- [x] Can log in

---

## Task 3.2: Core WordPress Configuration (Manual)

### Settings → General

- Site Title: `Next.js WordPress Starter`
- Tagline: `A production-ready Next.js + WordPress monorepo`
- Timezone: your timezone
- Date Format: `Y/m/d`
- Week Starts On: Monday

### Settings → Permalinks

- Select **Post name** (`/%postname%/`)
- Save Changes

### Plugins → Add New

Install and activate:

- **Yoast SEO**
- **WP Mail SMTP**

Custom plugins (auto-mounted from `apps/cms/plugins/`):

- Activate **Starter CORS Headers** via Plugins → Installed Plugins
- Activate **Starter Webhook** via Plugins → Installed Plugins

### Posts → Categories

Create these categories:

| Name      | Slug      | Description                           |
| --------- | --------- | ------------------------------------- |
| Tutorial  | tutorial  | How-to guides                         |
| Deep Dive | deep-dive | In-depth technical articles           |
| DevOps    | devops    | Deployment and infrastructure         |
| Stack     | stack     | Architecture and technology decisions |

### Remove Default Content

- Delete "Hello world!" post
- Delete "Sample Page"

**Acceptance:**

- [ ] Timezone and permalinks configured
- [ ] Yoast SEO activated
- [ ] WP Mail SMTP activated
- [ ] Both custom plugins activated
- [ ] 4 categories created
- [ ] Default content removed

---

## Task 3.3: CORS Plugin

**File:** `apps/cms/plugins/starter-cors/starter-cors.php`

Already created — just activate in wp-admin. Allows Next.js to fetch from WordPress
across different ports/domains.

Allowed origins:

- `http://localhost:3000`
- `http://localhost:3001`
- `https://nextjs-wp.arashworks.ir`

**Verify:**

```bash
curl -v -H "Origin: http://localhost:3000" http://localhost:12080/wp-json/wp/v2/posts 2>&1 | Select-String "Access-Control"
```

---

## Task 3.4: Webhook Plugin

**File:** `apps/cms/plugins/starter-webhook/starter-webhook.php`

Already created — activate in wp-admin. Notifies Next.js when posts are
published/updated/deleted so Next.js can revalidate its cache.

Add to `docker-compose.yml` WordPress environment (already done):

```yaml
REVALIDATION_SECRET: ${REVALIDATION_SECRET:-local-secret}
NEXTJS_REVALIDATE_URL: ${NEXTJS_REVALIDATE_URL:-http://host.docker.internal:3000/api/revalidate}
```

Add to `.env`:

```env
REVALIDATION_SECRET=change-this-to-a-random-string
NEXTJS_REVALIDATE_URL=http://host.docker.internal:3000/api/revalidate
```

---

## Task 3.5: Plugin Configuration (Manual)

### Yoast SEO

Go to **Yoast SEO → Settings → General → Site basics**:

- Site title template: click Insert variable → Title, then type `|`, then Insert variable → Site title
- Result: `%%title%% | %%sitename%%`

Go to **Yoast SEO → Settings → General → Site representation**:

- Represents: Organization
- Organization name: `Next.js WordPress Starter`

Go to **Yoast SEO → Settings → General → Site features**:

- Confirm SEO analysis, Readability analysis, XML sitemaps are enabled

### WP Mail SMTP

Go to **WP Mail SMTP → Settings**:

- Mailer: Other SMTP
- SMTP Host: from `.env` (`SMTP_HOST`)
- SMTP Port: `587`, Encryption: TLS
- Username/Password: from `.env`
- From Email: your email
- From Name: `Next.js WordPress Starter`
- Test via **Email Test** tab

---

## Task 3.6: Placeholder Posts (Manual)

Create 4 posts — enough to test homepage grid + featured post logic.

| #   | Title                                          | Category  | Slug                     | Sticky |
| --- | ---------------------------------------------- | --------- | ------------------------ | ------ |
| 1   | Why Next.js 15 + WordPress is a great stack    | Stack     | nextjs-wordpress-stack   | ✓      |
| 2   | Setting up a pnpm Turborepo monorepo           | Tutorial  | pnpm-turborepo-setup     |        |
| 3   | Docker Compose for local WordPress development | DevOps    | docker-compose-wordpress |        |
| 4   | How ISR works in Next.js App Router            | Deep Dive | nextjs-isr-explained     |        |

**Requirements per post:**

- At least 2-3 sentences of real content
- Category assigned
- Published (not draft)
- Post #1 marked sticky: Edit → Document panel → check "Stick to the top of the blog"

---

## Task 3.7: REST API Verification

```bash
# All posts
curl http://localhost:12080/wp-json/wp/v2/posts?per_page=10

# Categories
curl http://localhost:12080/wp-json/wp/v2/categories

# Sticky post
curl "http://localhost:12080/wp-json/wp/v2/posts?sticky=true"

# Single post by slug
curl "http://localhost:12080/wp-json/wp/v2/posts?slug=nextjs-wordpress-stack&_embed=true"
```

**Acceptance:**

- [ ] 4 posts returned
- [ ] 4 categories returned (tutorial, deep-dive, devops, stack)
- [ ] Sticky post returned
- [ ] Each post has: `id`, `slug`, `title.rendered`, `excerpt.rendered`, `content.rendered`, `categories`

---

## Deploying to Staging

When ready to apply to the staging server (192.168.0.10):

1. Push `apps/cms/` to `dev` branch — CI deploys plugin files
2. On 192.168.0.10: `docker compose -f docker-compose.staging.yml up -d`
3. Open `http://192.168.0.10:12080` → complete wizard
4. Repeat Task 3.2 steps in wp-admin
5. Import content: **Tools → Export** (local) → **Tools → Import** (staging)
