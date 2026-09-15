# Scripts

Deployment scripts for nextjs-wordpress-starter. Both are executed remotely on the
target server via SSH from CI — they are never run locally.

| Script                 | Triggered by                              | Server          |
| ---------------------- | ----------------------------------------- | --------------- |
| `deploy-production.sh` | GitHub Actions on `v*.*.*` tag            | `94.101.181.37` |
| `deploy-staging.sh`    | GitLab CI on `dev`/`main` branch (manual) | staging server  |

---

## Required Environment Variables

Both scripts expect these variables to be passed from the CI workflow:

| Variable            | Description                                       |
| ------------------- | ------------------------------------------------- |
| `REGISTRY_HOST`     | Container registry hostname                       |
| `REGISTRY_USER`     | Registry username                                 |
| `REGISTRY_PASSWORD` | Registry password or token                        |
| `VERSION`           | Image tag to deploy (e.g. `v1.0.0` or commit SHA) |

---

## What the scripts do

1. Check disk space — abort if > 90% full
2. Log into the container registry
3. Pull the new image tag
4. Update `NEXTJS_IMAGE` in the server's `.env` file
5. Restart only the `nextjs` container (`--no-deps`) — DB and WordPress keep running
6. Clean up old image versions
7. Print post-deploy status

---

## Server directory structure

Both scripts expect this layout on the target server:

```
/opt/apps/nextjs-wordpress-starter/          # production
/opt/apps/nextjs-wordpress-starter-staging/  # staging

Each directory contains:
├── docker-compose.prod.yml   (or staging)
├── .env                      (all required vars, no defaults)
└── apps/
    └── cms/
        ├── plugins/
        │   ├── starter-cors/
        │   └── starter-webhook/
        └── themes/
```

## Rollback

To roll back to a previous version on production:

```bash
ssh user@94.101.181.37
cd /opt/apps/nextjs-wordpress-starter
sed -i "s|^NEXTJS_IMAGE=.*|NEXTJS_IMAGE=<registry>/nextjs-wordpress-starter/web:<previous-tag>|" .env
docker compose -f docker-compose.prod.yml up -d --no-deps --pull never nextjs
```
