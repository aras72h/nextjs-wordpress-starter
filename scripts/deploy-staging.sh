#!/bin/bash
set -e

# Staging Deployment Script
# Executed on staging server via SSH from GitLab CI or GitHub Actions
# Environment variables passed from workflow:
#   REGISTRY_USER     — container registry username
#   REGISTRY_PASSWORD — container registry password
#   REGISTRY_HOST     — container registry hostname
#   VERSION           — image tag to deploy (e.g. commit SHA)

DEPLOY_DIR="/opt/apps/nextjs-wordpress-starter-staging"
COMPOSE_FILE="docker-compose.staging.yml"
IMAGE="${REGISTRY_HOST}/nextjs-wordpress-starter/web"
IMAGE_TAG="${VERSION:-latest}"

echo "=============================================="
echo "🚀 Staging Deployment"
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

sed -i "s|^NEXTJS_IMAGE=.*|NEXTJS_IMAGE=${IMAGE}:${IMAGE_TAG}|" .env

docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull never nextjs

echo "⏳ Waiting for container to be healthy..."
sleep 5
docker compose -f "$COMPOSE_FILE" ps nextjs

# ============================================
# Cleanup old images (keep last 3)
# ============================================
echo "🧹 Cleaning up old images..."
docker images "${IMAGE}" --format "{{.ID}} {{.Tag}}" | \
  tail -n +4 | \
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
echo "✅ Staging deployment complete"
echo "=============================================="
