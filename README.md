# Next.js WordPress Starter

A production-ready monorepo for building headless WordPress sites with Next.js 15. Comes with a full Docker development environment, CI/CD pipelines, and a shared component library — clone it and start building.

**Stack:** Next.js 15 · WordPress (headless) · Turborepo · pnpm · Docker · Tailwind CSS · shadcn/ui

---

## What's Inside

```
nextjs-wordpress-starter/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── cms/          # WordPress plugins (CORS, webhook)
├── packages/
│   ├── ui/           # Shared component library (shadcn/ui + custom)
│   └── config/       # Shared ESLint, TypeScript, and Tailwind configs
└── docs/             # Phase-by-phase implementation guides
```

---

## Pages

| Route          | Description                                   |
| -------------- | --------------------------------------------- |
| `/`            | Homepage with latest posts from WordPress     |
| `/blog`        | Blog list with category filter and pagination |
| `/blog/[slug]` | Single post with SEO metadata and JSON-LD     |
| `/contact`     | Contact form with SMTP email delivery         |

---

## Prerequisites

- **Node.js** ≥ 20.18.0
- **pnpm** ≥ 10.0.0 — `npm install -g pnpm`
- **Docker** with Compose v2 — `docker compose` (no hyphen)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/aras72h/nextjs-wordpress-starter.git
cd nextjs-wordpress-starter
pnpm install
```

### 2. Configure environment

```bash
# Root .env — for Docker Compose (MySQL, WordPress)
cp .env.example .env

# Next.js .env — for the web app
cp apps/web/.env.example apps/web/.env
```

Edit both files. At minimum set `REVALIDATION_SECRET` to any random string in both.

### 3. Start the stack

```bash
# Start WordPress + MySQL in the background
docker compose up -d

# Start the Next.js dev server
pnpm dev
```

| Service         | URL                             |
| --------------- | ------------------------------- |
| Next.js         | http://localhost:3000           |
| WordPress admin | http://localhost:12080/wp-admin |
| phpMyAdmin      | http://localhost:12081          |

---

## First-Time WordPress Setup

WordPress needs a one-time manual setup on first run:

1. Open http://localhost:12080 and complete the install wizard
2. Go to **Plugins → Installed Plugins** and activate **Starter CORS Headers** and **Starter Webhook**
3. Go to **Settings → Permalinks**, select **Post name**, and save

See [docs/phase-3-wordpress-setup.md](docs/phase-3-wordpress-setup.md) for the full checklist including categories, placeholder posts, and REST API verification.

---

## Dev Commands

Run these from the monorepo root. Turborepo handles dependency ordering automatically.

```bash
pnpm dev          # Start all apps in watch mode
pnpm build        # Build all packages and apps
pnpm lint         # Run ESLint across the monorepo
pnpm type-check   # Run TypeScript checks across the monorepo
```

---

## Environment Variables

There are two `.env` files:

**Root `.env`** — used by Docker Compose (MySQL, WordPress, webhooks):

```env
# MySQL
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=starter_wp
MYSQL_USER=starter
MYSQL_PASSWORD=starterpass

# WordPress ↔ Next.js webhook
REVALIDATION_SECRET=change-this-to-a-random-string
NEXTJS_REVALIDATE_URL=http://host.docker.internal:3000/api/revalidate
```

**`apps/web/.env`** — used by Next.js (copy from `apps/web/.env.example`):

```env
WORDPRESS_API_URL=http://localhost:12080/wp-json/wp/v2
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATION_SECRET=change-this-to-a-random-string

# Contact form SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL_TO=your@email.com
```

Staging and production compose files have no defaults — all variables must be set explicitly on the server.

---

## WordPress Plugins

Two custom plugins live in `apps/cms/plugins/` and are mounted into the WordPress container automatically via Docker volumes.

| Plugin            | Purpose                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `starter-cors`    | Adds CORS headers so Next.js can call the WordPress REST API across ports and domains      |
| `starter-webhook` | Notifies Next.js to revalidate its cache whenever a post is published, updated, or deleted |

To allow your production and staging domains, add them to the `$allowed_origins` array in `apps/cms/plugins/starter-cors/starter-cors.php`.

---

## Deployment

### Staging

```bash
docker compose -f docker-compose.staging.yml up -d
```

Set `NEXTJS_IMAGE` in your `.env` to point to your built image, or build and tag it manually first.

### Production

Production deploys are triggered automatically by pushing a version tag from `main`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Actions workflow builds a Docker image, pushes it to your registry, and deploys to the server via SSH. Set these secrets in your GitHub repository settings:

| Secret                   | Description                          |
| ------------------------ | ------------------------------------ |
| `SSH_HOST`               | Production server IP or hostname     |
| `SSH_USER`               | SSH username                         |
| `SSH_PRIVATE_KEY`        | SSH private key                      |
| `REGISTRY_HOST`          | Container registry hostname          |
| `REGISTRY_USER`          | Registry username                    |
| `REGISTRY_PASSWORD`      | Registry password                    |
| `PROD_SITE_URL`          | Public URL of the production site    |
| `PROD_WORDPRESS_API_URL` | WordPress REST API URL on production |

---

## Project Status

| Phase | Description                                         | Status      |
| ----- | --------------------------------------------------- | ----------- |
| 1     | Monorepo structure, CI/CD, Docker infrastructure    | ✅ Complete |
| 2     | Design system (`packages/ui`, shadcn/ui components) | ✅ Complete |
| 3     | WordPress setup, custom plugins, REST API           | ✅ Complete |
| 4     | Next.js pages, WordPress data layer, contact form   | ✅ Complete |
| 5     | On-demand revalidation                              | 🔜 Next     |

---

## License

MIT
