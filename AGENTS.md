# DeQueens Atelier Backend — Base44 Dev Notes

## Overview
Backend-only Express API (no frontend). Runs on Node 22 + MongoDB 7 + Socket.IO.
The repo has no client/UI — the preview shows the raw API JSON at `/`.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- `api` service: node:22, bind-mounts `./backend`, installs deps on boot, runs `nodemon` with legacy watch (bind-mount polling).
- `mongo` service: mongo:7 with healthcheck; `api` depends on it being healthy.
- Web entry point is on host port **3000** (mapped to container PORT=3000).

## Environment / Secrets
- `JWT_SECRET` — required at boot; generated dev placeholder present (replace for production).
- `MONGO_URI` — set inline in compose to the local mongo service.
- `FRONTEND_URL` / `PAYSTACK_CALLBACK_URL` — derived from `BASE44_PUBLIC_HOST_SUFFIX` in compose.
- Optional external credentials (not needed to boot; only used by specific endpoints):
  - `PAYSTACK_SECRET_KEY` — payment init + webhook verification.
  - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — image uploads.
  - `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM` — transactional email (failures are caught and logged, never crash the request).
- Secrets delivered via `/run/base44/app.env` (last `env_file` entry in compose).

## Verify it works
```
curl http://localhost:3000/                         # → welcome JSON
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"t@e.com","password":"Pass1234"}'
```
Registration persists to MongoDB; email send failure is caught and logged.

## Notes
- `backend/Scripts/createAdmin.js` (note capital S) creates an admin user: `npm run create-admin` inside the api container.
- File watching uses `--legacy-watch` because bind mounts on this host don't fire native fs events reliably.
