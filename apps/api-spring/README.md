# Flocky API Spring

Backend API for the Flocky community management platform, built with Spring Boot and Kotlin.

## Prerequisites

- Java 21
- PostgreSQL

### Java Setup (SDKMAN)

This project requires Java 21. Use [SDKMAN](https://sdkman.io/) to manage Java versions:

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 21
sdk install java 21.0.6-tem

# Auto-switch to the correct version in this directory
sdk env
```

An `.sdkmanrc` file is included so `sdk env` will automatically select the correct Java version.

Optionally, enable auto-switching by setting `sdkman_auto_env=true` in `~/.sdkman/etc/config` so SDKMAN automatically applies the correct version when you `cd` into this directory.

## Database

Start the PostgreSQL database using Docker:

```bash
docker compose up -d
```

This runs PostgreSQL on port **5435** with the following defaults:

| Variable            | Value       |
| ------------------- | ----------- |
| `POSTGRES_USER`     | `flocky`    |
| `POSTGRES_PASSWORD` | `flocky_dev`|
| `POSTGRES_DB`       | `flocky`    |

To stop the database:

```bash
docker compose down
```

## Development

Start the dev server:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Lint (auto-fix):

```bash
pnpm lint
```

Lint (check only):

```bash
pnpm lint:check
```
