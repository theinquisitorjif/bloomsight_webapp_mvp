BloomSight – Local Docker Setup

Run the full stack locally using Docker:

Frontend: Vite-built React app, served by nginx

Backend: Flask app served by gunicorn

Reverse proxy: nginx serves static assets and forwards /api/* → backend

1) Prerequisites

Docker & Docker Compose

Windows: Docker Desktop (WSL2 enabled)

macOS/Linux: Docker Engine + Compose plugin

2) Environment variables

You’ll set two env files:

2.1 Backend env (.env in repo root)

Create a file named .env in the repo root. Example:

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-or-usable-key
SUPABASE_ANON_KEY=public-anon-key  # only if your code uses anon for public reads

The backend container loads this .env automatically via docker-compose.yml.

2.2 Frontend env (inside frontend/)

Create one of the following in frontend/:

For local prod build via nginx (recommended):

frontend/.env.production

For generic local build:

frontend/.env.local

Contents (example):

# Point the app to nginx's API proxy
VITE_API_URL=/api

# Mapbox
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token

# Supabase (for client-side reads)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key


The code forces /api in production builds to ensure the nginx proxy is used.

3) Build & run

From the repo root:

docker compose build --no-cache
docker compose up -d
docker compose ps

Open the app: http://localhost

4) How the proxy works

nginx serves the built frontend at /

requests to /api/* are proxied to the backend service at http://backend:8000/

the frontend uses VITE_API_URL=/api so all API calls look like /api/beaches/...

This avoids CORS issues and ensures one origin (localhost).

5) Verifying it’s working
5.1 Quick API checks

iwr http://localhost/api/beaches -UseBasicParsing | % StatusCode    # expect 200
iwr http://localhost/api/beaches/10174230392/weather-forecast -UseBasicParsing | % StatusCode
