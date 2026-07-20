# Agrow AI

**AI-powered financial intelligence for India's rural micro-enterprises — built for the NABARD Hackathon.**

Agrow AI turns raw financial records from small rural businesses into forecasts, risk scores, health tracking, and government scheme matches — for the entrepreneur running the business, and for the NABARD field officer overseeing hundreds of them.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Target Users](#target-users)
- [Key Features](#key-features)
- [Entrepreneur Portal](#entrepreneur-portal)
- [Government / Officer Portal](#government--officer-portal)
- [AI/ML Capabilities](#aiml-capabilities)
- [Explainable AI](#explainable-ai)
- [Forecasting Methodology](#forecasting-methodology)
- [Risk Intelligence](#risk-intelligence)
- [Enterprise Health Score](#enterprise-health-score)
- [Government Scheme Recommendation](#government-scheme-recommendation)
- [AI Assistant](#ai-assistant)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation Instructions](#installation-instructions)
- [Environment Variables](#environment-variables)
- [Running the Frontend](#running-the-frontend)
- [Running the Backend](#running-the-backend)
- [Running the ML Service](#running-the-ml-service)
- [Docker Setup](#docker-setup)
- [Deployment Architecture](#deployment-architecture)
- [API Overview](#api-overview)
- [Demo Credentials](#demo-credentials)
- [Screenshots](#screenshots)
- [Future Scope](#future-scope)
- [Hackathon Relevance & Impact](#hackathon-relevance--impact)
- [Security](#security)
- [License](#license)

---

## Problem Statement

Rural micro-enterprises — small agri-processing units, dairies, handicraft businesses, retail shops — rarely keep financial records in a form that supports planning. Owners can't easily answer "will I have enough cash flow next quarter?" or "which government scheme am I actually eligible for?" On the other side, NABARD field officers are responsible for monitoring risk and scheme uptake across entire districts, but have no aggregated, real-time view into the enterprises under their jurisdiction — they rely on manual visits and self-reported paperwork.

## Proposed Solution

Agrow AI is a two-sided platform. Entrepreneurs log revenue, expenses, assets, liabilities, and loan EMIs; the system turns that into a 6-month cash-flow forecast, a rule-based risk score, an enterprise health score, and a ranked list of government schemes they qualify for — all with a plain-language explanation attached to every number. Officers get the same data aggregated across their entire portfolio: village/district analytics, a risk heat map, scheme application management, and an AI-assisted dashboard that surfaces which enterprises and villages need attention first.

## Target Users

- **Rural entrepreneurs** running small agriculture, dairy, handicraft, or retail businesses who need to track finances and discover schemes they're eligible for.
- **NABARD field officers** who supervise a portfolio of enterprises across villages/districts and need portfolio-level risk visibility and scheme administration tools.

## Key Features

- Financial record tracking (revenue, expenses, assets, liabilities, loan EMI) per enterprise
- 6-month AI cash-flow forecasting with confidence scoring
- Rule-based, explainable risk scoring (Low / Medium / High)
- Enterprise Health Score (Excellent / Good / Needs Attention / Critical)
- Government scheme eligibility matching with a percentage match and stated reasons
- Data-grounded AI assistant (chat) for both entrepreneurs and officers
- Officer-side village/district analytics, risk heat map, and scheme application management
- PDF report generation (per-enterprise and officer portfolio reports)
- In-app notifications and a rule-based smart alert engine
- Offline sync queue with conflict resolution for spotty rural connectivity
- English/Hindi localization
- Role-based access control (entrepreneur vs. officer), JWT authentication

## Entrepreneur Portal

Accessible at `/app`. Pages: Dashboard, My Enterprise, Financial Records, Forecast Studio, Risk Intelligence, Enterprise Health, Scheme Advisor, AI Assistant, Reports, Notifications, Profile, Settings.

## Government / Officer Portal

Accessible at `/officer`, gated to users with the `officer` role. Pages: Officer Dashboard, AI Insights, Enterprise Registry, Enterprise Detail (financials/risk/health/forecast tabs), District Analytics, Village Analytics, Risk Monitoring (with a risk heat map), Scheme Management (application review, approval, disbursement), Alerts, Reports (portfolio risk, village performance, default prediction).

## AI/ML Capabilities

Agrow AI deliberately uses transparent, auditable methods rather than opaque black-box models, since financial decisions affecting real small businesses need to be explainable to both the entrepreneur and the officer reviewing them:

| Capability | Method |
|---|---|
| Cash-flow forecasting | scikit-learn linear regression blended with a weighted moving average (Python/FastAPI microservice) |
| Risk scoring | Deterministic rule-based scoring across four weighted factors |
| Health scoring | Deterministic rule-based scoring across liquidity, profitability, and related factors |
| Scheme matching | Deterministic weighted-criteria matching (enterprise type, location, income eligibility) |
| AI Assistant | Keyword-based intent classification, answers assembled only from the enterprise's actual stored data — no generative text is invented |

## Explainable AI

Every AI-generated number in Agrow AI ships with a human-readable explanation generated from the same inputs that produced the score — not a separate, potentially inconsistent description:
- Forecasts include a plain-language explanation of the trend, confidence, and seasonal adjustment applied.
- Risk scores list the specific factors that contributed to the score (e.g. "High debt-to-asset ratio") and matching suggestions.
- Health scores break down into named sub-components.
- Scheme matches list the specific eligibility criteria that were satisfied.
- The AI Assistant's intent classification is plain keyword matching (see `backend/src/services/aiAssistantService.js`) specifically so that *which* data gets fetched for an answer is never itself a black box.

## Forecasting Methodology

Implemented in `ml/model.py` (FastAPI service):
1. **Primary signal** — linear regression (scikit-learn) fit to historical revenue/expense/profit/cash-flow series when at least 3 data points are available.
2. **Fallback/smoothing signal** — a weighted moving average, used when history is short or the regression fit is unstable.
3. The two signals are blended rather than used as a pure straight-line extrapolation, to avoid unrealistic projections for small, seasonal rural businesses.
4. A **seasonality multiplier** is applied per enterprise type (agriculture, dairy, handicrafts, retail each have distinct monthly seasonal profiles defined in `SEASONALITY_PROFILES`).
5. A **confidence score (0–1)** is derived from data completeness, revenue variance, and the regression's R² fit.
6. Output: a 6-month projection for revenue, expenses, profit, and cash flow, plus growth %, trend direction, confidence, and a generated explanation.

The Node backend (`forecastService.js`) calls this service with an 8-second timeout and 2 retries with backoff; if the ML service is unreachable, it falls back to a locally computed estimate rather than failing the request outright, and labels the response accordingly.

## Risk Intelligence

Implemented in `backend/src/services/riskService.js` as a deterministic weighted scoring model (max 100 points) using the latest financial record:

| Factor | Max points | Trigger |
|---|---|---|
| Debt-to-asset ratio | 30 | >0.7 = high risk, >0.4 = moderate |
| Cash flow (revenue − expenses − EMI) | 30 | Negative = high risk, <10% of revenue = moderate |
| Loan repayment burden (EMI / revenue) | 20 | >0.3 = high risk, >0.15 = moderate |
| Revenue stability (coefficient of variation across records) | 20 | >0.4 = high, >0.2 = moderate |

Score bands: **Low** (<40), **Medium** (40–69), **High** (≥70). Each triggered factor produces a named risk factor and an actionable suggestion in the response.

## Enterprise Health Score

Implemented in `backend/src/services/healthService.js`, combining a liquidity score (asset-to-liability ratio) and a profitability score (profit margin against revenue), rolled into an overall status: **Excellent**, **Good**, **Needs Attention**, or **Critical**.

## Government Scheme Recommendation

Implemented in `backend/src/services/schemeService.js` as a weighted-criteria match:

| Criterion | Weight |
|---|---|
| Enterprise type matches scheme eligibility | 40% |
| Enterprise state matches scheme's state | 30% |
| Annual income within the scheme's income limit | 30% |

Returns a match percentage and the specific reasons that were satisfied. Officers manage the resulting applications (review, approve/reject, disburse, track performance) through the Scheme Management module.

## AI Assistant

A conversational endpoint (`POST /api/ai/chat`) available to both entrepreneurs and officers. It classifies the user's message into a small set of known intents (risk explanation, health improvement, forecast explanation, scheme questions, cash-flow/expense questions for entrepreneurs; village intervention, highest-risk enterprises, district summaries, sector trends, inspection priorities for officers) via keyword matching, then answers using only that enterprise's/portfolio's real stored data — by design, it does not generate free-form, ungrounded text.

## System Architecture

```
┌─────────────────┐      HTTPS/JSON       ┌──────────────────┐      HTTP/JSON      ┌───────────────────┐
│  React Frontend │  ───────────────────▶ │  Express Backend │ ──────────────────▶ │  FastAPI ML Service│
│  (Vite SPA)     │ ◀───────────────────  │  (Node.js)       │ ◀────────────────── │  (forecasting)     │
└─────────────────┘                       └────────┬─────────┘                     └───────────────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  MongoDB    │
                                              │  (Mongoose) │
                                              └─────────────┘
```

- The frontend never talks to the ML service directly — all forecast requests are proxied and orchestrated through the Express backend, which is also where auth, rate limiting, and the local-fallback-if-ML-is-down logic live.
- Risk, health, and scheme-matching logic run entirely inside the Node backend (deterministic, no external call needed).
- MongoDB stores users, enterprises, financial records, risk/health/forecast results, notifications, scheme applications, and sync-queue entries.

## Technology Stack

- **Frontend**: React 19 + Vite, React Router 7, Tailwind CSS, Recharts, Framer Motion
- **Backend**: Node.js + Express 5, MongoDB via Mongoose, JWT authentication, Winston logging, Helmet + custom NoSQL-injection/XSS sanitization
- **AI/ML**: Python FastAPI microservice — NumPy, Pandas, scikit-learn (linear regression + weighted moving average forecasting)
- **Infra**: Docker Compose (mongo, ml-service, backend, frontend — 4 services), GitHub Actions CI

## Project Structure

```
agrow-ai-main/
├── frontend/              React SPA (entrepreneur + officer portals)
│   └── src/
│       ├── pages/         Dashboard, FinancialRecords, ForecastStudio, RiskIntelligence,
│       │                  EnterpriseHealth, SchemeAdvisor, Reports, Officer/* , etc.
│       ├── routes/         ProtectedRoute (auth + role gating)
│       ├── context/        Auth and Theme providers
│       └── services/       Axios API client
├── backend/               Express API, business logic, AI orchestration
│   ├── src/
│   │   ├── controllers/    Request handlers
│   │   ├── models/         Mongoose schemas
│   │   ├── routes/         Route → controller wiring, validation, rate limits
│   │   ├── services/       Business logic (forecast, risk, health, schemes, AI assistant, alerts)
│   │   ├── middleware/     Auth, roles, security, rate limiting, error handling
│   │   ├── locales/        en.json / hi.json translation dictionaries
│   │   ├── utils/          Logger, env validation
│   │   └── config/         DB connection
│   ├── scripts/            Backup / restore / demo-seed utilities
│   ├── uploads/reports/    Generated PDF reports (gitignored)
│   └── logs/               Winston log output (gitignored)
├── ml/                     FastAPI forecasting microservice (app.py, model.py)
├── docs/                   Documentation (this file's companions — see below)
├── datasets/               Reserved for sample/demo datasets
├── assets/                 Reserved for static assets (e.g. screenshots)
├── scripts/                Top-level setup helper (setup.ps1)
├── .github/workflows/      CI pipeline
└── docker-compose.yml      One-command local stack
```

## Installation Instructions

Requires **Node.js 20+**, **Python 3.11+**, and a **MongoDB** instance (local or Atlas).

```bash
git clone https://github.com/semal-1820/agrow-ai.git
cd agrow-ai
```

Then follow [Running the Backend](#running-the-backend), [Running the ML Service](#running-the-ml-service), and [Running the Frontend](#running-the-frontend) below — or use [Docker Setup](#docker-setup) to start all three at once.

## Environment Variables

### Backend (`backend/.env`, copy from `backend/.env.example`)

| Variable | Example | Notes |
|---|---|---|
| `PORT` | `5000` | Backend listen port |
| `NODE_ENV` | `production` | `development` \| `production` \| `test` |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas or local connection string |
| `JWT_SECRET` | (48+ random hex chars) | Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` — server refuses to boot if under 16 chars |
| `JWT_EXPIRE` | `7d` | Token lifetime |
| `ML_SERVICE_URL` | `http://127.0.0.1:8000` | Where the FastAPI forecast service is reachable |
| `REPORT_STORAGE_PATH` | `./uploads/reports` | Where generated PDF reports are written |
| `LOG_LEVEL` | `info` | `error` \| `warn` \| `info` \| `http` \| `debug` |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s), comma-separated for multiple |

The server validates these at boot (`backend/src/utils/validateEnv.js`) and exits immediately with a clear message if anything required is missing.

### Frontend (`frontend/.env`, copy from `frontend/.env.example`)

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL the SPA calls for the backend API. Optional for local dev — defaults to this value already. |

## Running the Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI / JWT_SECRET
npm run dev                 # http://localhost:5000
```

Optional demo dataset (100 enterprises, 500+ financial records, 20 schemes, 500+ notifications):
```bash
npm run seed
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start for production |
| `npm run seed` | Load demo dataset (adds to existing data) |
| `npm run seed:reset` | Wipe demo users/schemes, then reload demo dataset |
| `npm run backup` | Export every collection to `backend/backups/<timestamp>/*.{json,csv}` |
| `npm run restore -- <backup-folder-name>` | Restore a backup (add `-- --force` to overwrite existing data) |

## Running the ML Service

```bash
cd ml
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Docker Setup

```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET at minimum
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000 (health check: `/health`)
- ML service: http://localhost:8000

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for deploying each service independently to a cloud provider.

## Deployment Architecture

The three services (frontend, backend, ML) are designed to be deployed independently — the frontend is a static build servable from any static host or CDN, the backend is a stateless Node process that can run on any container/PaaS platform, and the ML service is a stateless FastAPI process. `docker-compose.yml` demonstrates running all three together with correct inter-service networking (`ML_SERVICE_URL`, `VITE_API_URL`, `CLIENT_URL` wiring). See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for provider-agnostic deployment notes. *No live deployment URL exists yet for this submission — see [Future Scope](#future-scope).*

## API Overview

All endpoints are mounted under `/api` on the backend (default `http://localhost:5000/api`), except the infrastructure health check at `/health`. Every route except `/api/auth/*`, `/api/locale/*`, and `GET /health` requires a `Bearer` JWT.

| Base path | Covers |
|---|---|
| `/api/auth` | Register, login, profile |
| `/api/users` | Get/update own profile |
| `/api/enterprise` | CRUD for enterprises |
| `/api/financial-records` | CRUD for financial records |
| `/api/forecast` | Trigger forecast, forecast comparison, forecast accuracy tracking |
| `/api/risk` | Trigger/get risk assessment |
| `/api/health` | Enterprise Health Score (business feature — not the infra health check) |
| `/api/schemes` | List schemes, check eligibility, create scheme (officer) |
| `/api/scheme-management` | Officer-only: applications, approvals, disbursement, performance, beneficiaries |
| `/api/reports` | Generate/list/download PDF reports |
| `/api/notifications` | CRUD for notifications |
| `/api/officer/*` | Officer dashboard, AI dashboard, AI insights, alerts, enterprise registry/detail, district/village analytics, sector distribution, risk monitoring/heatmap, officer reports |
| `/api/ai` | AI chat, recommendations, insights |
| `/api/sync` | Offline sync queue, conflict resolution, retry |
| `/api/locale` | Supported languages, translation dictionary (no auth) |

Full route-by-route detail (methods, params, auth requirements) is in [`docs/API.md`](docs/API.md).

## Demo Credentials

Created by `npm run seed` (see [Running the Backend](#running-the-backend)):

| Role | Email | Password |
|---|---|---|
| Entrepreneur | `entrepreneur1@agrowai.demo` | `Demo@1234` |
| Officer | `officer1@agrowai.demo` | `Demo@1234` |

These only exist in a database you've seeded yourself — there is no shared/hosted demo instance.

## Screenshots

*Screenshots have not yet been added to this repository.* Suggested placeholders once available (drop images in `assets/` and reference them here):

- [ ] Entrepreneur Dashboard
- [ ] Forecast Studio (chart view)
- [ ] Risk Intelligence page
- [ ] Enterprise Health page
- [ ] Scheme Advisor page
- [ ] AI Assistant chat
- [ ] Officer Dashboard
- [ ] Risk Monitoring heat map
- [ ] Village/District Analytics

## Future Scope

- Hosted live demo deployment (frontend, backend, ML service, and managed MongoDB)
- Demo walkthrough video
- Push notifications for smart alerts (currently in-app only)
- Expanding beyond linear regression + moving average toward richer time-series models as more real historical data becomes available
- Additional regional languages beyond English/Hindi
- SMS/USSD fallback channel for entrepreneurs without reliable smartphone data access
- Automated test suite (unit + integration) — not yet present in this repository

## Hackathon Relevance & Impact

Agrow AI targets a concrete NABARD mandate — improving financial visibility and government scheme access for rural micro-enterprises — with a design that intentionally favors **explainability over model complexity**: every score a user sees (risk, health, forecast, scheme match) is backed by a visible, auditable calculation rather than an opaque model, which matters for both entrepreneur trust and for officer accountability when using this data to make monitoring or disbursement decisions. The officer-side portfolio view (district/village analytics, risk heat map) is built to scale from a single enterprise to the hundreds a NABARD field officer would realistically supervise.

## Security

- Helmet security headers, CORS locked to `CLIENT_URL`
- Custom NoSQL-injection and XSS sanitization middleware (Express-5-compatible — see comments in `backend/src/middleware/security.js` for why the usual npm packages weren't used)
- Rate limiting: global + stricter per-route limits on auth, forecast, and officer endpoints
- JWT auth with bcrypt password hashing, role-based route protection
- Centralized error handler that never leaks stack traces or internal error details in production

## License

See [`LICENSE`](LICENSE).
