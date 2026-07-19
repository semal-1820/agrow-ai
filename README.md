# Agrow AI

An AI-powered financial intelligence platform for rural micro-enterprises, built for the **NABARD Hackathon**. Agrow AI gives entrepreneurs cash-flow forecasting, risk scoring, enterprise health tracking, and government scheme matching, and gives NABARD field officers village/district-level analytics and monitoring across every enterprise in their jurisdiction.

## Two Portals

| Portal | Who it's for | Key features |
|---|---|---|
| **Entrepreneur** (`/app`) | Rural business owners | Dashboard, financial records, AI forecast studio, risk intelligence, enterprise health, scheme advisor, reports |
| **Officer** (`/officer`) | NABARD field officers | Officer dashboard, enterprise registry, village/district analytics, risk monitoring, scheme management, AI insights |

## Tech Stack

- **Frontend**: React 19 + Vite, React Router, Tailwind CSS, Recharts, Framer Motion
- **Backend**: Node.js + Express 5, MongoDB (Mongoose), JWT auth
- **AI/ML**: Python FastAPI microservice (NumPy/Pandas/scikit-learn, linear regression + weighted moving average forecasting)
- **Infra**: Docker Compose, GitHub Actions CI

## Quick Start (Local, No Docker)

Requires Node.js 20+, Python 3.11+, and a MongoDB instance (local or Atlas).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI / JWT_SECRET
npm run dev                 # http://localhost:5000

# 2. ML service (separate terminal)
cd ml
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Optional, load a realistic demo dataset (100 enterprises, 500+ financial records, 20 schemes, 500+ notifications):

```bash
cd backend
npm run seed
```
Demo logins created by the seed script:
- Entrepreneur: `entrepreneur1@agrowai.demo` / `Demo@1234`
- Officer: `officer1@agrowai.demo` / `Demo@1234`

## Quick Start (Docker, one command)

```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET at minimum
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000 (health check: `/health`)
- ML service: http://localhost:8000

See `docs/DEPLOYMENT.md` for cloud deployment (Vercel / Render / Railway / MongoDB Atlas).

## Documentation

| Doc | Covers |
|---|---|
| `docs/API.md` | Every backend route, method, auth requirement, and request/response shape |
| `docs/DEPLOYMENT.md` | Deploying frontend/backend/ML service/database to production |
| `docs/architecture.md` | System architecture, folder structure, data flow |
| This README | Setup, environment variables, scripts |

## Project Structure

```
agrow-ai-main/
├── frontend/          React SPA (entrepreneur + officer portals)
├── backend/           Express API, business logic, AI orchestration
│   ├── src/
│   │   ├── controllers/   Request handlers
│   │   ├── models/        Mongoose schemas
│   │   ├── routes/        Route -> controller wiring, validation, rate limits
│   │   ├── services/      Business logic (forecast, risk, health, schemes)
│   │   ├── middleware/     Auth, roles, security, rate limiting, errors
│   │   ├── utils/          Logger, env validation
│   │   └── config/         DB connection
│   ├── scripts/        Backup / restore / demo-seed utilities
│   └── logs/            Winston log output (gitignored)
├── ml/                FastAPI forecasting microservice
├── docs/              Documentation
├── .github/workflows/ CI pipeline
└── docker-compose.yml  One-command local stack
```

## Environment Variables

All variables live in `backend/.env` (copy from `backend/.env.example`). None are optional in production except where noted.

| Variable | Example | Notes |
|---|---|---|
| `PORT` | `5000` | Backend listen port |
| `NODE_ENV` | `production` | development \| production \| test |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas or local connection string |
| `JWT_SECRET` | (48+ random hex chars) | Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` — server refuses to boot if under 16 chars |
| `JWT_EXPIRE` | `7d` | Token lifetime |
| `ML_SERVICE_URL` | `http://127.0.0.1:8000` | Where the FastAPI forecast service is reachable |
| `REPORT_STORAGE_PATH` | `./uploads/reports` | Where generated PDF reports are written |
| `LOG_LEVEL` | `info` | error \| warn \| info \| http \| debug |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s), comma-separated for multiple |

The server validates these at boot (`backend/src/utils/validateEnv.js`) and exits immediately with a clear message if anything required is missing, rather than failing confusingly later.

## Scripts (backend)

| Command | What it does |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start for production |
| `npm run seed` | Load demo dataset (adds to existing data) |
| `npm run seed:reset` | Wipe demo users/schemes, then reload demo dataset |
| `npm run backup` | Export every collection to `backend/backups/<timestamp>/*.{json,csv}` |
| `npm run restore -- <backup-folder-name>` | Restore a backup (add `-- --force` to overwrite existing data) |

## Health Check

`GET /health` (not under `/api`, that's reserved for the Enterprise Health *business feature*) reports:
- Database connection status
- ML service reachability
- Report storage writability
- Memory/CPU/uptime/Node version

Returns `200` when healthy, `503` when degraded, safe to point a Docker healthcheck, load balancer, or uptime monitor at directly.

## Security

- Helmet security headers, CORS locked to `CLIENT_URL`
- Custom NoSQL-injection and XSS sanitization middleware (Express-5-compatible, see comments in `backend/src/middleware/security.js` for why the usual npm packages weren't used)
- Rate limiting: global + stricter per-route limits on auth, forecast, and officer endpoints
- JWT auth with bcrypt password hashing, role-based route protection
- Centralized error handler that never leaks stack traces or internal error details in production

## License

See `LICENSE`.
