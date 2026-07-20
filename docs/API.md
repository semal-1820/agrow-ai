# Agrow AI — API Reference

Base URL: `http://localhost:5000` (local dev). All routes below are mounted under `/api` unless noted.

**Auth**: routes marked 🔒 require an `Authorization: Bearer <JWT>` header (obtained from `/api/auth/login`). Routes marked 🔒👮 additionally require the token's role to be `officer`.

This document is generated directly from `backend/src/routes/*.js` — if a route is added or changed there, update this file to match.

---

## Auth — `/api/auth`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/test` | — | Liveness check for the auth router |
| POST | `/register` | — | Rate-limited (`authLimiter`), validated (`validateRegister`) |
| POST | `/login` | — | Rate-limited (`authLimiter`), validated (`validateLogin`) |
| GET | `/profile` | 🔒 | Current user's profile |

## Users — `/api/users`

| Method | Path | Auth |
|---|---|---|
| GET | `/profile` | 🔒 |
| PUT | `/profile` | 🔒 |

## Enterprise — `/api/enterprise`

| Method | Path | Auth |
|---|---|---|
| GET | `/` | 🔒 |
| GET | `/:id` | 🔒 |
| POST | `/` | 🔒 |
| PUT | `/:id` | 🔒 |
| DELETE | `/:id` | 🔒 |

## Financial Records — `/api/financial-records`

| Method | Path | Auth |
|---|---|---|
| GET | `/` | 🔒 |
| GET | `/:id` | 🔒 |
| POST | `/` | 🔒 |
| PUT | `/:id` | 🔒 |
| DELETE | `/:id` | 🔒 |

## Forecast — `/api/forecast`

| Method | Path | Auth | Notes |
|---|---|---|---|---|
| POST | `/:enterpriseId` | 🔒 | Rate-limited (`forecastLimiter`); calls the ML service with retry + local fallback |
| GET | `/comparison/:enterpriseId` | 🔒 | Forecast-vs-actual comparison |
| GET | `/accuracy/:enterpriseId` | 🔒 | Forecast accuracy tracking |

## Risk — `/api/risk`

| Method | Path | Auth |
|---|---|---|
| POST | `/:enterpriseId` | 🔒 |
| GET | `/:enterpriseId` | 🔒 |

## Enterprise Health — `/api/health`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/:enterpriseId` | 🔒 | This is the Enterprise Health **business feature** — not the infrastructure health check (see below) |

## Schemes — `/api/schemes`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | 🔒 | Any authenticated user |
| POST | `/` | 🔒👮 | Create a scheme |
| GET | `/eligible/:enterpriseId` | 🔒 | Eligibility check for an enterprise |

## Scheme Management — `/api/scheme-management`

| Method | Path | Auth |
|---|---|---|
| GET | `/applications` | 🔒👮 |
| PATCH | `/applications/:id/status` | 🔒👮 |
| PATCH | `/applications/:id/disburse` | 🔒👮 |
| GET | `/performance` | 🔒👮 |
| GET | `/beneficiaries` | 🔒👮 |

## Reports — `/api/reports`

| Method | Path | Auth |
|---|---|---|
| POST | `/generate` | 🔒 |
| GET | `/` | 🔒 |
| GET | `/:id` | 🔒 |
| GET | `/:id/download` | 🔒 |

## Notifications — `/api/notifications`

| Method | Path | Auth |
|---|---|---|
| GET | `/` | 🔒 |
| GET | `/:id` | 🔒 |
| POST | `/` | 🔒 |
| PUT | `/:id/read` | 🔒 |
| DELETE | `/:id` | 🔒 |

## Officer — `/api/officer` (all routes 🔒👮, rate-limited via `officerLimiter`)

| Method | Path |
|---|---|
| GET | `/dashboard` |
| GET | `/ai-dashboard` |
| GET | `/ai-insights` |
| POST | `/ai-alerts/generate` |
| GET | `/alerts` |
| GET | `/enterprises` |
| GET | `/enterprises/:id` |
| GET | `/enterprises/:id/financials` |
| GET | `/enterprises/:id/risk` |
| GET | `/enterprises/:id/health` |
| GET | `/enterprises/:id/forecast` |
| GET | `/district-analytics` |
| GET | `/village-analytics` |
| GET | `/sector-distribution` |
| GET | `/risk-monitoring` |
| GET | `/risk-heatmap` |
| GET | `/reports/portfolio-risk` |
| GET | `/reports/village-performance` |
| GET | `/reports/default-prediction` |

## AI — `/api/ai` (all routes 🔒)

| Method | Path | Notes |
|---|---|---|
| POST | `/chat` | Rate-limited (`globalLimiter`). Keyword-intent-classified, answers grounded in stored data only |
| GET | `/recommendations/:enterpriseId` | |
| GET | `/insights/:enterpriseId` | |

## Sync (offline support) — `/api/sync` (all routes 🔒)

| Method | Path | Notes |
|---|---|---|
| POST | `/queue` | Push an offline change onto the sync queue |
| GET | `/queue` | Get queued items |
| POST | `/conflict/:id/resolve` | Resolve a sync conflict |
| POST | `/retry/:id` | Retry a failed sync item |

## Localization — `/api/locale` (no auth — read-only reference data)

| Method | Path | Notes |
|---|---|---|
| GET | `/` | List supported languages (`en`, `hi`) |
| GET | `/:lang` | Full translation dictionary for a language |

## Infrastructure Health Check — `/health` (not under `/api`, no auth)

Returns `200` when healthy, `503` when degraded. Reports database connection status, ML service reachability, report-storage writability, and memory/CPU/uptime/Node version. Safe to point a Docker healthcheck, load balancer, or uptime monitor at directly.

## Static Files — `/uploads`

Serves generated PDF reports from `backend/uploads/reports` (`express.static`).

---

## Error Responses

Errors are returned as JSON via a centralized helper (`backend/src/utils/errorResponse.js`) and never leak stack traces or internal error details in production. Typical shape:

```json
{ "success": false, "message": "Human-readable error description" }
```

Validation errors (built on the `validator` npm package, see `backend/src/middleware/validators.js`) return a `400` with field-level detail; auth failures return `401`; role failures return `403`; not-found resources return `404`.
