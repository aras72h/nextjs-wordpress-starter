#!/bin/bash
set -e

# Production Deployment Script
# Executed on 94.101.181.37 via SSH from GitHub Actions
# Environment variables passed from workflow:
#   REGISTRY_USER     — container registry username
#   REGISTRY_PASSWORD — container registry password
#   REGISTRY_HOST     — container registry hostname (e.g. registry.example.com)
#   VERSION           — image tag to deploy (e.g. v1.0.0)

DEPLOY_DIR="/opt/apps/nextjs-wordpress-starter"
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE="${REGISTRY_HOST}/nextjs-wordpress-starter/web"
IMAGE_TAG="${VERSION:-latest}"

echo "=============================================="
echo "🚀 Production Deployment"
echo "   Image: ${IMAGE}:${IMAGE_TAG}"
echo "=============================================="
echo ""

cd "$DEPLOY_DIR"

# ============================================
# Pre-deployment checks
# ============================================
echo "🔍 Pre-deployment checks..."

DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "📊 Disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 90 ]; then
  echo "❌ ERROR: Disk usage is ${DISK_USAGE}% — deployment aborted"
  echo "   Run: docker image prune -a -f"
  exit 1
fi

echo "✅ Pre-checks passed"
echo ""

# ============================================
# Docker registry login
# ============================================
echo "🔐 Logging into registry ${REGISTRY_HOST}..."
echo "${REGISTRY_PASSWORD}" | docker login "${REGISTRY_HOST}" \
  -u "${REGISTRY_USER}" --password-stdin

# ============================================
# Pull new image
# ============================================
echo "📥 Pulling ${IMAGE}:${IMAGE_TAG}..."
docker pull "${IMAGE}:${IMAGE_TAG}"

# ============================================
# Update .env with new image tag and deploy
# ============================================
echo "🚀 Deploying..."

# Write the image reference into .env so compose picks it up
sed -i "s|^NEXTJS_IMAGE=.*|NEXTJS_IMAGE=${IMAGE}:${IMAGE_TAG}|" .env

# Restart only the nextjs container — DB and WordPress keep running
docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never nextjs

echo "⏳ Waiting for container to be healthy..."
sleep 5
docker compose -f "$COMPOSE_FILE" ps nextjs

# ============================================
# Cleanup old images (keep last 5 versioned tags)
# ============================================
echo "🧹 Cleaning up old images..."
docker images "${IMAGE}" --format "{{.ID}} {{.Tag}}" | \
  grep -E "v[0-9]" | \
  tail -n +6 | \
  awk '{print $1}' | \
  xargs -r docker rmi -f 2>/dev/null || true

docker image prune -f

# ============================================
# Post-deployment status
# ============================================
echo ""
echo "📊 Post-deployment status:"
echo "   Disk usage : $(df -h / | awk 'NR==2 {print $5}')"
echo "   Containers : $(docker compose -f $COMPOSE_FILE ps | grep -c Up || echo 0)/3 running"
echo ""
echo "=============================================="
echo "✅ Production deployment complete"
echo "🌐 https://nws.arashworks.ir"
echo "=============================================="
