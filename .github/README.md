# CI/CD Workflows

This directory contains GitHub Actions workflows for the nextjs-wordpress-starter.

## Workflows

| Workflow                  | Trigger                 | Purpose                            |
| ------------------------- | ----------------------- | ---------------------------------- |
| `ci.yml`                  | Push to any branch, PRs | Lint, type-check, build            |
| `infrastructure-test.yml` | Push to `dev`           | Verify build capability and Docker |
| `deploy-staging.yml`      | Push to `dev`           | Deploy to staging                  |
| `deploy-production.yml`   | Tag `v*.*.*` on `main`  | Deploy to production               |
| `health-check.yml`        | Scheduled               | Monitor uptime                     |

## Required Secrets

Set these in GitHub repository Settings → Secrets:

| Secret                | Description                          |
| --------------------- | ------------------------------------ |
| `SSH_PRIVATE_KEY`     | SSH key for deployment server access |
| `STAGING_HOST`        | Staging server IP or hostname        |
| `PROD_HOST`           | Production server IP or hostname     |
| `REGISTRY_USER`       | Container registry username          |
| `REGISTRY_PASSWORD`   | Container registry password          |
| `REVALIDATION_SECRET` | Shared secret for WordPress webhook  |

## Deployment Flow

```
feature/* → PR → dev → auto-deploy to staging
tag v*.*.* → auto-deploy to production
```
