# Flocky

A modern monorepo application built with Turborepo.

## Prerequisites

- [fnm](https://github.com/Schniz/fnm) (Fast Node Manager)
- [Node.js](https://nodejs.org/) v24.13.0 (install via `fnm use` or `fnm install`)
- [pnpm](https://pnpm.io/)

## Getting Started

### 1. Install Node.js

Use fnm to install and activate the correct Node.js version:

```sh
fnm use
```

### 2. Install Dependencies

```sh
pnpm install
```

### 3. Set Up the Frontend

Copy the example environment file:

```sh
cp apps/web/.env-example apps/web/.env
```

Update the values in `apps/web/.env` as needed. See the [Web README](apps/web/README.md) for more details.

### 4. Set Up the Backend

Follow the setup instructions in the [API README](apps/api/README.md) to configure the database and environment variables.

### 5. Start Development

From the root directory:

```sh
pnpm dev
```

This will start all apps in development mode.

This is my important change! Please leave me alone