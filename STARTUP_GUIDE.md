# Flocky Startup Guide

A step-by-step guide to get the Flocky application running locally.

## Prerequisites

Make sure the following are installed on your machine:

- [fnm](https://github.com/Schniz/fnm) (Fast Node Manager)
- [SDKMAN](https://sdkman.io/) (Java version manager)
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [pnpm](https://pnpm.io/installation) (v10.29.3)

## Step 1 — Install Node.js

From the project root:

```bash
fnm use
```

This reads `.nvmrc` and installs/activates Node.js v24.13.0.

## Step 2 — Install Java 21

```bash
cd apps/api
sdk env install
```

This reads `.sdkmanrc` and installs Java 21.0.6-tem. Return to the project root afterward:

```bash
cd ../..
```

## Step 3 — Install dependencies

From the project root:

```bash
pnpm install
```

This installs dependencies for all apps and packages in the monorepo.

## Step 4 — Start the database

Start the PostgreSQL container:

```bash
docker compose -f apps/api/docker-compose.yaml up -d
```

This starts PostgreSQL on **port 5435** with the following defaults:

| Setting  | Value       |
| -------- | ----------- |
| Host     | localhost   |
| Port     | 5435        |
| Database | flocky      |
| User     | flocky      |
| Password | flocky\_dev |

Database migrations (Flyway) run automatically when the API starts, so no manual migration step is needed.

## Step 5 — Configure the frontend environment

```bash
cp apps/web/.env-example apps/web/.env
```

The default `.env` points the frontend at the local API:

```
VITE_API_URL=http://localhost:8080/api
```

## Step 6 — Start the application

From the project root:

```bash
pnpm dev
```

This starts all services in development mode via Turborepo:

| Service       | URL                          |
| ------------- | ---------------------------- |
| Web (frontend)| http://localhost:5173        |
| API (backend) | http://localhost:8080/api    |
| Docs          | http://localhost:3000        |

## Stopping the application

1. Press `Ctrl+C` in the terminal running `pnpm dev`.
2. Stop the database:

```bash
docker compose -f apps/api/docker-compose.yaml down
```

## Troubleshooting

- **Node version mismatch** — Run `fnm use` from the project root to switch to the correct version.
- **Java version mismatch** — Run `sdk env` from `apps/api` to switch to Java 21.
- **Database connection refused** — Verify the PostgreSQL container is running with `docker ps`. Make sure port 5435 is not in use by another process.
- **CORS errors in browser** — The API allows `http://localhost:5173` by default. If the frontend runs on a different port, set the `CORS_ALLOWED_ORIGINS` environment variable when starting the API.
