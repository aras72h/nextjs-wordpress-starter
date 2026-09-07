#!/bin/bash
set -e

# Staging Deployment Script
# This script is executed on the staging server via SSH from GitHub Actions
# Environment variables REGISTRY_USER and REGISTRY_PASSWORD are passed from the workflow

DEPLOY_DIR="/opt/apps/nextjs-wordpress-starter-staging"
COMPOSE_FILE="docker-compose.staging.yml"
REGISTRY="$REGISTRY"
IMAGE_NAME="starter/web"
IMAGE_TAG="staging"

echo "=============================================="
echo "🚀 Starter Staging Deployment"
echo "=============================================="
echo ""

cd "$DEPLOY_DIR"

# ============================================
# Pre-deployment checks
# ============================================
echo "🔍 Pre-deployment checks..."

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "📊 Disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 90 ]; then
  echo "❌ ERROR: Disk usage is ${DISK_USAGE}% - deployment aborted!"
  echo "Run cleanup: docker image prune -a -f"
  exit 1
fi

echo "✅ Pre-checks passed"
echo ""

# ============================================
# Docker registry login
# ============================================
echo "🔐 Logging into registry..."
echo "${REGISTRY_PASSWORD}" | docker login "$REGISTRY" \
  -u "${REGISTRY_USER}" --password-stdin

# ============================================
# Pull new image
# ============================================
echo "📥 Pulling new image..."
docker pull "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# ============================================
# Deploy
# ============================================
echo "🚀 Deploying..."
docker-compose -f "$COMPOSE_FILE" up -d --no-deps nextjs

# ============================================
# Cleanup old images
# ============================================
echo "🧹 Cleaning up old images (keeping last 3 builds)..."
docker images "${REGISTRY}/${IMAGE_NAME}" --format "{{.ID}} {{.Tag}}" | \
  grep "staging-" | \
  tail -n +4 | \
  awk '{print $1}' | \
  xargs -r docker rmi -f 2>/dev/null || echo "No old images to remove"

# Remove dangling images
docker image prune -f

# ============================================
# Post-deployment status
# ============================================
echo ""
echo "📊 Post-deployment status:"
echo "  - Disk usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "  - Starter images: $(docker images | grep starter | wc -l)"
echo "  - Containers running: $(docker-compose -f $COMPOSE_FILE ps | grep Up | wc -l)/3"
echo ""

echo "=============================================="
echo "✅ Staging deployment complete"
echo "🌐 URL: https://staging.nextjs-wp.arashworks.ir"
echo "=============================================="
