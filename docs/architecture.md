# Agrow AI — Architecture

## Overview

Agrow AI is a three-service system:

1. **Frontend** — React 19 SPA (Vite), serving two role-gated portals (entrepreneur `/app`, officer `/officer`) from a single build.
2. **Backend** — Node.js/Express 5 REST API. Owns authentication, authorization, validation, rate limiting, orchestration of the ML service, and all deterministic business logic (risk, health, scheme matching).
3. **ML Service** — Python FastAPI microservice that does one thing: turn a series of financial records into a 6-month forecast.

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

## Why this split

- The ML service is intentionally narrow (forecasting only) and stateless, so it can be scaled, redeployed, or swapped independently of the rest of the system without touching auth, data storage, or the other AI features (risk/health/scheme matching), which live in the backend as deterministic, dependency-free logic.
- The frontend never calls the ML service directly — every forecast request goes through the backend, which adds auth, rate limiting (`forecastLimiter`), and a graceful local fallback if the ML service is unreachable (see `backend/src/services/forecastService.js`).

## Backend internal layout

```
backend/src/
├── controllers/   Thin request handlers — parse input, call a service, shape the response
├── services/      Business logic: forecast orchestration, risk scoring, health scoring,
│                  scheme matching, AI assistant (intent classification + data gathering),
│                  alerts, reports, localization
├── routes/        Express routers — wire paths to controllers, attach auth/role/rate-limit
│                  middleware and per-route validators
├── middleware/    JWT auth (authMiddleware), role checks (roleMiddleware), rate limiting,
│                  security sanitization (NoSQL-injection/XSS), centralized error handling
├── models/        Mongoose schemas (see Database below)
├── locales/       en.json / hi.json translation dictionaries
├── utils/         Logger (winston), env validation, standardized error responses
└── config/        MongoDB connection setup
```

## Database

MongoDB via Mongoose. Collections (one model file each, in `backend/src/models/`):

- `User` — entrepreneur or officer accounts, role, credentials (bcrypt-hashed)
- `Enterprise` — a rural business: type, location, owner reference
- `FinancialRecord` — monthly revenue/expenses/assets/liabilities/loanEMI per enterprise
- `RiskAssessment` — stored risk score results
- `ForecastResult` — stored forecast outputs, used for later accuracy comparison
- `GovernmentScheme` — scheme definitions (eligibility criteria)
- `SchemeApplication` — an entrepreneur's application to a scheme, and its officer-reviewed status
- `Notification` — in-app notifications
- `Report` — generated PDF report metadata
- `SyncQueue` — queued offline changes awaiting sync, with conflict state

The system uses flat MongoDB collections rather than a separate data warehouse — officer-side analytics (district/village aggregates, sector distribution, risk heat maps) are computed on read from these same collections.

## Request flow example: generating a forecast

1. Frontend (`ForecastStudio` page) calls `POST /api/forecast/:enterpriseId`.
2. `forecastRoutes.js` → `protect` (JWT check) → `forecastLimiter` (rate limit) → `forecastController.forecastCashFlow`.
3. Controller loads the enterprise's `FinancialRecord` history from MongoDB and calls `forecastService.getForecast()`.
4. `forecastService` calls the FastAPI `/forecast` endpoint with an 8s timeout and up to 2 retries; on repeated failure or a non-retryable 4xx, it computes a local fallback forecast instead of failing the request.
5. Result is optionally persisted as a `ForecastResult` and returned to the frontend, which renders it in Recharts.

## Offline support

`syncRoutes.js`/`syncController.js` implement a queue-based model: the frontend can push locally-made changes to `/api/sync/queue` once connectivity returns, list queued items, resolve conflicts (`/api/sync/conflict/:id/resolve`), and retry failed syncs (`/api/sync/retry/:id`). This is designed for the intermittent connectivity common in rural areas rather than assuming an always-on connection.

## Localization

Read-only, unauthenticated `/api/locale` endpoints serve translation dictionaries (`backend/src/locales/en.json`, `hi.json`) so the frontend can fetch strings before a user is logged in.

## Security posture (see also root README → Security)

- Helmet security headers, CORS restricted to `CLIENT_URL`
- Custom NoSQL-injection/XSS sanitization middleware, written specifically for Express 5 compatibility (the commonly used npm packages for this predate Express 5's routing changes — see comments in `backend/src/middleware/security.js`)
- JWT auth + bcrypt password hashing, role-based route protection (`authorizeRoles`)
- Rate limiting: a global limiter plus stricter limiters on auth, forecast, and officer routes
- Centralized error responses that never leak stack traces or internal details in production
