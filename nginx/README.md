# BloomSight – Local Docker Setup

Run the full stack locally using Docker:

- Frontend: Vite-built React app, served by nginx
- Backend: Flask app served by gunicorn
- Reverse proxy: nginx serves static assets and forwards /api/\* → backend

## Prerequisites

Docker & Docker Compose

Windows: Docker Desktop (WSL2 enabled)

macOS/Linux: Docker Engine + Compose plugin

## Environment variables

You’ll set two env files:

2.1 Backend env (.env in repo root)

Create a file named .env in the repo root. Example:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=public-anon-key  # only if your code uses anon for public reads
SUPABASE_SERVICE_ROLE_KEY=your-service-role-or-usable-key
EARTHDATA_USERNAME=
EARTHDATA_PASSWORD=
OPENAI_API_KEY=
SUPABASE_JWT_SECRET=
```

The backend container loads this .env automatically via docker-compose.yml.

## Frontend env (inside frontend/)

Create one of the following in frontend/:

For local prod build via nginx (recommended):

frontend/.env.production

For generic local build:

frontend/.env.local

Contents (example):

# Supabase (for client-side reads)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token
VITE_API_URL=/api # Point the app to nginx's API proxy
```

The code forces /api in production builds to ensure the nginx proxy is used.

## Build & run

From the repo root:

docker compose build --no-cache
docker compose up -d
docker compose ps

Open the app: http://localhost

## How the proxy works

nginx serves the built frontend at /

requests to /api/\* are proxied to the backend service at http://backend:8000/

the frontend uses VITE_API_URL=/api so all API calls look like /api/beaches/...

This avoids CORS issues and ensures one origin (localhost).

## Verifying it’s working

5.1 Quick API checks

iwr http://localhost/api/beaches -UseBasicParsing | % StatusCode # expect 200
iwr http://localhost/api/beaches/10174230392/weather-forecast -UseBasicParsing | % StatusCode
