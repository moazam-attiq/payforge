# PROJECT.md — PayForge project source of truth

## Authority and evidence

The authoritative product scope is the user-supplied `payment_gateway_engineering_blueprint.docx` reviewed in full on 2026-09-24. At that time it was located at `/Users/adroiditsolutions/Downloads/payment_gateway_engineering_blueprint.docx` and had SHA-256 `cf737aa1617a33120f65a2beed70d3f4f47a6f3bc109970e3bdde56c58182464`.

The repository itself was empty when this memory system was initialized: there was no Git repository, source code, package manifest, README, configuration, test suite, or prior `.ai/` memory. The product requirements below remain confirmed from the blueprint; current implementation claims are separately labeled as verified repository state.

Evidence priority for future work:

1. Explicit user instructions and scope updates.
2. Explicit user decisions.
3. The engineering blueprint summarized here.
4. Verified repository state.
5. Git history, once available.
6. Clearly labeled inference.

## Goal

Build a developer-facing sandbox payment platform for learning payment architecture and reliability/security patterns. Merchants should be able to create test credentials, synthetic customers and payment methods, exercise payment intent authorization/capture/refund lifecycles, inspect balances and double-entry ledger entries, receive and replay signed webhooks, and study operational failure modes.

This is a portfolio-quality simulator. It must not process real cards, bank credentials, or funds, and it must not claim PCI compliance or licensed payment-processor status.

## Scope

### In scope for V1

- Merchant registration and dashboard authentication with short-lived access tokens, rotated hashed refresh tokens, session revocation, and reuse detection.
- Test publishable, secret, and restricted API keys with scopes, expiration, rotation/revocation, and last-used metadata.
- Synthetic customers with isolated PII profiles and application-level encryption where recoverable sensitive data is required.
- Synthetic payment methods represented only by documented test tokens.
- Payment Intents with enforced state transitions, multiple retained attempts, automatic or manual capture, authorized/capturable/received amounts, cancellation, and supported full/partial capture behavior.
- Deterministic fake-processor outcomes for success, declines, insufficient funds, expiry, timeout/unknown result, delayed completion, capture failure, and duplicate callbacks.
- Transactions created from successful financial operations.
- Full and partial refunds with transactional concurrency protection.
- An append-only, per-currency double-entry ledger as the financial source of truth; balanced entries must commit atomically with related state and outbox records.
- Pending and available merchant balances derived from ledger semantics.
- Retry-safe financial mutations using merchant-and-operation-scoped idempotency keys and request fingerprints.
- A transactional outbox, idempotent workers, stable domain event IDs, BullMQ/Redis delivery, and reconciliation jobs.
- Signed webhooks with subscriptions, delivery history, exponential retry with jitter, dead-letter state, and manual replay.
- Immutable audit records for privileged actions and reconciliation alerts for invariant violations.
- Privacy controls: data minimization, PII isolation, log redaction, retention rules, and deletion/anonymization of removable PII while retaining non-identifying ledger integrity.
- A React merchant dashboard covering overview, payments and attempts, transactions/refunds, customers, API keys, webhooks/deliveries, events, ledger, audit, and explicit-confirmation test-data reset.
- Operational visibility through structured logs, correlation IDs, metrics, liveness/readiness health checks, queue/dead-letter visibility, and security/invariant alerts.
- Automated unit, integration, API, end-to-end, retry, rollback, and concurrency tests for the documented invariants and scenarios.

### V1 REST API surface

The target V1 endpoints are:

- `POST /v1/auth/register`, `POST /v1/auth/login`, `POST /v1/auth/refresh`
- `POST /v1/api-keys`, `GET /v1/api-keys`, `POST /v1/api-keys/:id/revoke`
- `POST /v1/customers`, `GET /v1/customers/:id`
- `POST /v1/payment-intents`, `GET /v1/payment-intents/:id`
- `POST /v1/payment-intents/:id/payment-method`
- `POST /v1/payment-intents/:id/confirm`, `/capture`, and `/cancel`
- `POST /v1/refunds`, `GET /v1/refunds/:id`
- `GET /v1/transactions`, `GET /v1/balance`
- `POST /v1/webhook-endpoints`, `GET /v1/webhook-endpoints`
- `POST /v1/webhook-deliveries/:id/replay`
- `GET /v1/events`, `GET /v1/audit-logs`

### Explicitly out of current scope

- Collecting, transmitting, storing, or processing real PANs, CVVs, bank credentials, identity documents, or real funds.
- Real payment-provider integrations or real provider secret keys.
- Claims of PCI compliance or operation as a licensed payment processor.
- Microservices; V1 is a modular monolith unless the user explicitly changes this decision.
- V2/V3 extensions: products/prices, invoices/subscriptions, payouts, disputes/chargebacks, explicit simulated FX and broader multi-currency enhancements, resource-level restricted-key policies, MFA/passkeys, synthetic risk scoring, a Node SDK/webhook package, generated OpenAPI developer documentation, and advanced chaos testing. These are recorded future ideas, not scheduled work.

### Current scope rule

Development must not exceed the documented V1 scope without explicit user approval. Existing code never expands scope by itself. If future code conflicts with the blueprint, record the discrepancy and ask for a decision rather than silently redefining the product.

## Non-negotiable invariants

- Accept and persist synthetic payment tokens only; never accept real card or bank credentials.
- Represent money as integer minor units and an explicit currency; never use floating point.
- Keep accounts and balances separate by currency; never perform silent currency conversion.
- Enforce payment and refund transitions in domain code rather than arbitrary status writes.
- Never capture more than the authorized amount.
- Never allow successful refunds to exceed captured amount minus prior successful refunds.
- Every ledger transaction must balance before commit; ledger entries are append-only and corrections use compensating entries.
- Commit related financial state, ledger records, and outbox events atomically.
- Prevent cross-merchant access at both transport and service/domain boundaries where practical.
- Reject revoked or expired API keys immediately.
- Prevent a reused idempotency key from creating a second financial mutation, and reject materially different payloads for the same key scope.
- Keep event IDs stable across retries; webhook retries must not create new domain events.
- Keep secrets and sensitive PII out of logs, errors, and unrelated payment/ledger payloads.
- Produce an audit record for every privileged operation.
- Keep test and any future live-like namespaces from implicitly sharing credentials or resources.

## Architecture

### Verified current architecture

As of 2026-09-24, the repository is a pnpm workspace with a NestJS 11 API at `apps/api`, a React/Vite dashboard shell at `apps/dashboard`, and shared Zod transport schemas in `packages/contracts`. The API has validated configuration, liveness and dependency readiness endpoints, structured logging with readable development output, redaction, HTTP request correlation, a safe global error boundary, a lazy PostgreSQL/Drizzle boundary, and a lazy Redis/BullMQ configuration boundary. Empty Nest modules establish the intended V1 domain ownership boundaries but do not implement those domains. Database schemas, queues/workers, payment behavior, and real dashboard product views have not been implemented. Git is initialized and linked to a user-managed `origin` remote.

### Required target architecture

Use a TypeScript modular monolith with explicit domain boundaries:

```text
React merchant dashboard
        |
NestJS HTTP/API layer
  authentication, authorization/scopes, rate limiting,
  validation, idempotency, request correlation
        |
Domain modules
  auth, merchants, API keys, customers, payment methods,
  payments/attempts, refunds, transactions, ledger/balances,
  webhooks, outbox, audit, reconciliation
        |
PostgreSQL transaction
  domain state + ledger + outbox event
        |
Transactional outbox -> BullMQ/Redis workers
  webhook dispatch/retry/dead letter + reconciliation
```

Keep controllers thin. Put business rules in application/domain services. Use database constraints together with domain validation for critical invariants. Make every queue worker and event handler idempotent.

The current API module boundary list and ownership notes are documented in `apps/api/src/modules/README.md`. Empty module presence is architectural scaffolding only and never evidence that a feature is implemented.

## Technology stack

Verified foundation tooling and dependencies:

- Node.js 22.13.0 and pnpm 10.20.0.
- pnpm workspaces covering `apps/*` and `packages/*`.
- NestJS 11.2.6 with Express, TypeScript 5.9.3, Jest 30, and Supertest 7.3.0 in `apps/api`.
- React 19.3.0, Vite 8.3.0, and TypeScript 6.0.2 in `apps/dashboard`.
- A private ESM `@payforge/contracts` workspace package using TypeScript 5.9.3 and Zod 4.6.5 for transport schemas and inferred types.
- Pino 10.3.1 with `nestjs-pino` 5.2.0 and development-only `pino-pretty` 13.1.3.
- Drizzle ORM 0.45.3 with node-postgres 8.23.0 and Drizzle Kit 0.31.10.
- `@nestjs/bullmq` 11.0.5 with BullMQ 5.81.5 and ioredis 5.11.1.

The following blueprint stack remains partly or wholly unimplemented:

- Backend: NestJS and TypeScript.
- Frontend: React and Vite.
- Database service/runtime: PostgreSQL; local service provisioning and live connectivity remain pending.
- Database access: Drizzle ORM with an explicit lazy pool boundary; schemas, migrations, and transaction behavior remain pending.
- Queue/background jobs: BullMQ and Redis configuration is present; live connectivity, queues, and workers remain pending.
- Validation: Zod for API/configuration schemas and shared contracts where appropriate.
- Authentication security: Argon2id password hashing; hashed rotated refresh tokens.
- Logging: Pino structured JSON logging with redaction and correlation IDs.
- Testing: Jest and Supertest.
- Local infrastructure: native macOS PostgreSQL and Redis services under D015; Docker is excluded by explicit user decision.

pnpm workspaces are the selected monorepo approach under D007. No additional task runner is currently justified.

## Data and API conventions

- Use integer minor units with lowercase ISO-style currency codes, for example `{ "amount": 5000, "currency": "usd" }`.
- Use non-sequential prefixed public IDs such as `pi_`, `pa_`, `txn_`, `re_`, `cus_`, `evt_`, `we_`, and `key_`.
- Emit external timestamps as UTC ISO-8601 strings.
- Use cursor pagination where practical.
- Return stable machine-readable error codes, safe human messages, and a request/correlation ID.
- Size-limit metadata and never treat it as a secret store.
- Validate external input strictly and reject unsupported content types and oversized bodies.
- Never expose stack traces, database details, authentication specifics, or sensitive headers to clients.
- Keep secrets out of source control and store only placeholders in `.env.example`.
- Use established cryptographic primitives: secure random generation, constant-time comparison where applicable, HMAC-SHA256 webhook signatures, and AES-256-GCM with key versions for recoverable protected values.

## Repository structure

### Verified current structure

```text
PayForge/
├── .ai/                  # persistent project memory
├── apps/
│   ├── api/              # NestJS 11 API foundation
│   └── dashboard/        # React/Vite dashboard foundation
├── packages/
│   └── contracts/        # shared transport schemas and types
├── .env.example          # documented environment variable placeholders
├── .gitignore
├── package.json          # private pnpm workspace root
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

Git is initialized. A test-fixtures package has intentionally not been created because no concrete cross-package fixture use case exists yet.

### Target structure from the blueprint

```text
apps/
  api/src/
    modules/
    common/
    database/
    config/
  dashboard/
packages/
  contracts/
  test-fixtures/
docs/
.env.example
README.md
```

The exact workspace files should be established in Phase 0 and then documented here based on verified reality.

## Definition of Done

### Milestone completion

A milestone is complete only when its acceptance behavior exists and has been verified. For every milestone:

- relevant build, typecheck, lint, unit, integration, and end-to-end checks pass;
- security, privacy, financial, retry, and concurrency invariants relevant to the milestone have meaningful tests;
- API/setup documentation reflects actual behavior;
- no manual action is reported complete without user confirmation;
- `.ai/ROADMAP.md`, `.ai/TASKS.md`, `.ai/PROGRESS.md`, `.ai/DECISIONS.md`, and `.ai/BLOCKERS.md` are reconciled with the result.

The root manifest provides recursive `build`, `typecheck`, `lint`, `test`, `test:e2e`, `format:check`, and `format` commands. Future sessions must read the current manifests before running them. Service startup still requires a valid ignored root `.env`, and dependency-ready verification remains pending PostgreSQL and Redis integration.

### V1 product completion

V1 is done only when the merchant/auth/API-key workflow, synthetic payment lifecycle, retained attempts, atomic balanced ledger, safe concurrent refunds, idempotency, outbox/webhooks, key controls, privacy/log redaction, audit, reconciliation, dashboard visibility, and documented failure scenarios all work and are covered by appropriate automated verification. The complete behavior must satisfy the non-negotiable invariants above.

## Manual Action Rule

Never fabricate completion of an external or human-only action. Credentials and secret material, OAuth or third-party authorization, cloud-console configuration, production deployment, DNS/TLS setup, external account creation, and hardware/device testing require explicit user action or confirmation when applicable.

For local development, generate only clearly documented development secrets when safe and authorized. Do not commit them. If PostgreSQL, Redis, network access, or platform permissions are unavailable, record the exact failure in `BLOCKERS.md` rather than claiming infrastructure is ready. Do not add Docker artifacts unless the user explicitly reverses D015.
