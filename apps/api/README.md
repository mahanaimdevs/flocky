# Flocky API

Backend API service for Flocky.

## Getting Started

### 1. Set Up Environment Variables

Copy the example environment file and update as needed:

```bash
cp .env-example .env
```

### 2. Start the Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

To stop the database:

```bash
docker-compose down
```

The API will be available at `http://localhost:8080` (or the port specified in your `.env` file).
