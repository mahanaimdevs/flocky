# Flocky

A modern monorepo application built with Turborepo.

## Quick Start

```bash
./dev.sh
```

Checks prerequisites, installs dependencies, starts the database, and launches all dev servers. Use `--setup-only` to skip launching servers.

| Service | URL |
| ------- | --- |
| Web | http://localhost:5173 |
| API | http://localhost:8080/api |
| Docs | http://localhost:3000 |

## Prerequisites

- [fnm](https://github.com/Schniz/fnm) — Node version manager
- [SDKMAN](https://sdkman.io/) — Java version manager
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [pnpm](https://pnpm.io/installation) v10+

## Stopping

Press `Ctrl+C`, then:

```bash
docker compose -f apps/api/docker-compose.yaml down
```

## Troubleshooting

- **Node version mismatch** — run `fnm use` from the project root.
- **Java version mismatch** — run `sdk env` from `apps/api`.
- **Database connection refused** — check `docker ps`; make sure port 5435 is free.
- **CORS errors** — the API allows `http://localhost:5173` by default. Set `CORS_ALLOWED_ORIGINS` if the frontend runs on a different port.
