# Multi-stage Dockerfile for Next.js in Turborepo monorepo
# Builds apps/web for production deployment
#
# Build args:
#   NPM_REGISTRY  - npm registry URL (default: https://registry.npmjs.org)
#                   Set to http://host.docker.internal:8081/repository/npm-proxy/
#                   when building via GitLab CI on local infrastructure

# Stage 1: Builder - installs deps and builds the app
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG NPM_REGISTRY=""

RUN if [ -n "$NPM_REGISTRY" ]; then \
      npm install -g pnpm@10.15.0 --registry "$NPM_REGISTRY"; \
    else \
      npm install -g pnpm@10.15.0; \
    fi

RUN if [ -n "$NPM_REGISTRY" ]; then \
      pnpm config set registry "$NPM_REGISTRY"; \
    fi

# Copy all source files
COPY . .

# Install all dependencies (pnpm handles workspace linking automatically)
RUN pnpm install --frozen-lockfile

# Build arguments
ARG NEXT_PUBLIC_SITE_URL
ARG WORDPRESS_API_URL

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV WORDPRESS_API_URL=${WORDPRESS_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build apps/web via Turborepo
RUN pnpm turbo build --filter=@starter/web

# Stage 2: Runner - minimal production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
