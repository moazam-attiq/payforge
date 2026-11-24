# PayForge

PayForge is a developer-facing sandbox payment platform for learning payment architecture, financial invariants, idempotency, event delivery, privacy, and operational failure handling.

The platform will use synthetic test payment methods only. It must never accept real card numbers, CVVs, bank credentials, identity documents, or real funds.

## Current status

The project is in M0 Foundation. The NestJS API, React/Vite dashboard, and shared contracts package are present. The API includes validated configuration, structured logging, request correlation, safe errors, liveness/readiness health, lazy PostgreSQL/Drizzle and Redis/BullMQ boundaries, and empty V1 domain modules. Native PostgreSQL and Redis services, live readiness verification, and product behavior remain pending. Docker is not part of the project under D015.

## Workspace

```text
apps/
  api/          NestJS API
  dashboard/    React and Vite dashboard
packages/
  contracts/    Shared schemas and transport types
```

A test-fixtures package will be added only when a concrete cross-package need exists.

## Local prerequisites

- Node.js 22 or later
- pnpm 10.20.0
- Git

The PostgreSQL and Redis application boundaries are present, while native local service provisioning and live readiness verification remain pending. Local dependencies run directly on macOS; the project does not use Docker.

## Initial setup

Install workspace dependencies from the repository root:

```bash
pnpm install
```

Create the ignored local environment file from the documented template:

```bash
cp .env.example .env
```

Replace every `replace-with-...` placeholder before starting the API. JWT secrets and the API-key pepper must each contain at least 32 characters. Both encryption-key variables must contain canonical base64 that decodes to exactly 32 bytes; generate each value separately with:

```bash
openssl rand -base64 32
```

Never commit `.env`. The example database and Redis URLs are local placeholders; they do not provision either service.

## Development

Start the API in one terminal:

```bash
pnpm dev:api
```

Start the dashboard in another terminal:

```bash
pnpm dev:dashboard
```

The default API URL is `http://localhost:3000`, and the dashboard uses `http://localhost:5173`. Stop either development process with `Ctrl+C`. Nest shutdown hooks close any opened PostgreSQL and Redis clients.

The API can start without PostgreSQL or Redis because both clients connect lazily. In that state, `/health/live` succeeds and `/health/ready` returns HTTP 503.

## Verification

Run the repository checks from the root:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Unit and e2e tests use isolated test configuration and mocked readiness probes. They do not require live PostgreSQL or Redis services.

## Database foundation

The API owns a lazy node-postgres pool and typed Drizzle client under `apps/api/src/database`. Starting the application does not run migrations automatically. Drizzle schema definitions belong under `apps/api/src/database/schema`, and generated SQL migrations will belong under `apps/api/drizzle` once the first real domain schema is introduced.

The available migration commands are:

```bash
pnpm --filter @payforge/api db:generate
pnpm --filter @payforge/api db:migrate
```

Do not run `db:migrate` until a PostgreSQL service is available and the target `DATABASE_URL` has been checked. There is currently no schema migration to apply.

## Queue foundation

The API configures BullMQ and a direct Redis readiness client under `apps/api/src/queue`. Both connections are lazy, and no queues or workers are registered yet. Starting or testing dependency-independent liveness does not require Redis. Queue names and job payloads will be introduced only with the relevant outbox or reconciliation behavior.

## Health endpoints

- `GET /health/live` reports whether the API process is running and never checks external dependencies.
- `GET /health/ready` checks PostgreSQL and Redis concurrently. It returns HTTP 200 when both are ready and HTTP 503 otherwise, with safe per-dependency status labels only.

## API errors

General API failures use a stable envelope:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "not_found",
    "message": "The requested resource was not found.",
    "requestId": "request-correlation-id"
  }
}
```

Unexpected errors never expose exception messages or stack traces. The readiness endpoint keeps its separate dependency-status response when returning HTTP 503.

## API module boundaries

The V1 Nest module ownership map is documented in `apps/api/src/modules/README.md`. These modules are empty M0 scaffolding and do not indicate that authentication, payments, refunds, ledger behavior, events, or webhooks are implemented.

## Troubleshooting

- **The API rejects environment configuration:** compare `.env` with `.env.example`. Required values cannot be omitted, the JWT secrets must differ, and encryption keys must be canonical base64-encoded 32-byte values.
- **Port 3000 or 5173 is already in use:** stop the conflicting process. The dashboard port is intentionally strict; the API port can be changed with `PORT` and the dashboard API URL with `VITE_API_BASE_URL`.
- **`/health/live` works but `/health/ready` returns 503:** PostgreSQL, Redis, or both are unavailable at the configured URLs. This is expected while local services remain deferred.
- **Database commands fail immediately:** confirm the root `.env` exists and `DATABASE_URL` is set. Do not run migrations against an unverified database target.
- **Development logs look different from production:** development uses readable Pino output; production deliberately emits JSON.
- **Tests print a Console Ninja message:** the editor extension may add an informational hook message. User-run tests have passed with that message present.

## Project memory

Read `.ai/CONTEXT.md` before continuing implementation. The `.ai/` directory records the product boundary, roadmap, active tasks, decisions, progress, and blockers.
