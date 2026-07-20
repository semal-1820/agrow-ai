# Agrow AI — Deployment Guide

This project has no live hosted deployment as part of this submission (see README → Future Scope). This document covers how to deploy it.

## Local deployment (Docker Compose — recommended for demos)

The fastest way to run the entire stack, including MongoDB, is Docker Compose:

```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET at minimum
docker compose up --build
```

This starts four containers, wired together automatically (`docker-compose.yml`):

| Service | Container | Port | Notes |
|---|---|---|---|
| MongoDB | `agrow-mongo` | `27017` | Persistent volume `mongo-data`, healthchecked before backend starts |
| ML service | `agrow-ml` | `8000` | FastAPI, built from `./ml` |
| Backend | `agrow-backend` | `5000` | Built from `./backend`; `MONGO_URI`/`ML_SERVICE_URL` are overridden inside compose to point at the other containers by service name (not `localhost`) |
| Frontend | `agrow-frontend` | `5173` (mapped to container port 80) | Built from `./frontend`; `VITE_API_URL` is baked in at build time |

Backend `uploads/` and `logs/` are mounted as named volumes (`backend-uploads`, `backend-logs`) so generated PDF reports and logs survive container restarts.

## Cloud deployment (each service independently)

The three application services are stateless and can each be deployed to a different provider — this project's CI comments and Dockerfiles are written with **Render/Railway for the backend and ML service, Vercel for the frontend, and MongoDB Atlas for the database** in mind, though any equivalent platform (Fly.io, Railway, a plain VM, etc.) that can run a Docker container or a Node/Python process works the same way.

### Database — MongoDB Atlas (or any managed MongoDB)

1. Create a cluster and a database user.
2. Get the connection string (`mongodb+srv://...`) and use it as `MONGO_URI`.

### ML service — Render / Railway / any container host

1. Deploy `ml/` using its `Dockerfile`, or build directly with `uvicorn app:app --host 0.0.0.0 --port $PORT`.
2. Note the resulting public URL — this becomes `ML_SERVICE_URL` for the backend.

### Backend — Render / Railway / any container host

1. Deploy `backend/` (Docker or a native Node buildpack both work — `npm start` runs `server.js`).
2. Set environment variables per the table in the README (`PORT`, `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `ML_SERVICE_URL` from the previous step, `REPORT_STORAGE_PATH`, `LOG_LEVEL`, `CLIENT_URL` = your deployed frontend's URL).
3. Confirm `GET /health` returns `200` once the database and ML service are reachable.

### Frontend — Vercel / Netlify / any static host

1. Build with `VITE_API_URL` set to your deployed backend's URL (build-time env var — the Dockerfile shows the pattern: `docker build --build-arg VITE_API_URL=https://api.example.com`).
2. Deploy the `frontend/dist` output (or let Vercel/Netlify run `npm run build` directly from the `frontend/` directory).

## Health & readiness

`GET /health` on the backend (not `/api/health` — that's the Enterprise Health business feature) reports database connectivity, ML service reachability, storage writability, and basic resource metrics, returning `200`/`503` accordingly. Point any platform's healthcheck/uptime monitor at this endpoint.

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: installs and boots the backend, lints/builds the frontend, and sanity-checks the ML service. It is CI verification only — it does not deploy anywhere; deployment on any of the providers above is triggered by that provider's own git integration or a manual push, not by this workflow.
