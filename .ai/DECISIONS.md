# DECISIONS.md — Architectural decision record

This file is append-only. Never delete an entry. If a decision changes, mark the old entry superseded and append a new uniquely numbered decision that references it.

## 2026-09-24 — D001: Treat the supplied engineering blueprint as authoritative scope

**Decision:** Use the user-supplied `payment_gateway_engineering_blueprint.docx` as the authoritative product specification, subject to later explicit user instructions. Keep current implementation status separate from target requirements.

**Why:** The repository contained no competing scope document or implementation evidence, and the user explicitly supplied this file with the project-memory request.

**Alternatives considered:** Infer scope from the empty repository; invent a smaller starter scope. Both would discard explicit user intent.

**Consequence:** V1 requirements and exclusions in `PROJECT.md` and `ROADMAP.md` come from the blueprint. The blueprint's embedded implementation task was not executed during this documentation-only session.

## 2026-09-24 — D002: Use a modular monolith for V1

**Decision:** Build V1 as a TypeScript modular monolith with explicit domain modules and a separate React dashboard, rather than distributed services.

**Why:** The blueprint requires strong domain boundaries while avoiding premature distributed-system complexity.

**Alternatives considered:** Microservices and an unstructured single application. Microservices are explicitly excluded from current scope; an unstructured application would undermine the learning and invariant boundaries.

**Consequence:** Modules remain independently understandable but financial transactions can use one PostgreSQL boundary. Introducing microservices requires explicit user approval and a superseding decision.

## 2026-09-24 — D003: Use PostgreSQL transactions, an append-only double-entry ledger, and a transactional outbox

**Decision:** Treat the ledger as the monetary source of truth. Store append-only ledger entries and atomically commit related payment/refund state, balanced ledger records, and outbox events in PostgreSQL.

**Why:** This preserves financial invariants and closes the failure gap between a database commit and event publication.

**Alternatives considered:** Mutable balance counters, single-entry history, and separate database-then-queue writes. Each weakens traceability or creates unrecoverable consistency windows.

**Consequence:** Corrections require compensating entries, balances derive from or reconcile against ledger postings, workers must be idempotent, and financial mutations require transactional/concurrency tests.

## 2026-09-24 — D004: Keep all payment instruments and processing synthetic

**Decision:** Accept documented test tokens only and use a deterministic fake processor. Do not collect or process real PANs, CVVs, bank credentials, identity documents, or funds.

**Why:** The product is an educational simulator and explicitly must not present itself as a compliant or licensed real processor.

**Alternatives considered:** Sandbox integrations with real providers or card-shaped inputs. Both add risk and contradict the explicit product boundary.

**Consequence:** API validation, fixtures, UI copy, logs, and tests must enforce the synthetic-only boundary. Real provider integrations require a separate explicit scope change.

## 2026-09-24 — D005: Adopt the blueprint's required technology direction

**Decision:** Target NestJS/TypeScript, React/Vite, PostgreSQL/Drizzle, Redis/BullMQ, Zod, Argon2id, Pino, Jest/Supertest, and Docker Compose. The Docker Compose portion is superseded by D015; the application stack remains current.

**Why:** These technologies are explicit architectural decisions in the authoritative scope and fit the required transaction, modularity, validation, observability, and worker behavior.

**Alternatives considered:** No repository implementation exists from which to justify alternatives. Changing this stack would redefine an explicit user-provided design.

**Consequence:** Phase 0 should implement and verify this stack. Package manager and workspace orchestration remain undecided and should receive a later decision once selected.

## 2026-09-24 — D006: Keep V2/V3 extensions outside the active roadmap

**Decision:** Limit the active roadmap to blueprint Phases 0–8 and V1 acceptance. Record Phase 9 and the V2/V3 feature list as future ideas outside current scope.

**Why:** Scheduling those features would expand the current product beyond its V1 Definition of Done.

**Alternatives considered:** Include a not-started V2 milestone in the active roadmap. That could invite unauthorized implementation and blur the completion boundary.

**Consequence:** Subscriptions, payouts, disputes, FX, risk scoring, MFA/passkeys, SDK generation, and other future extensions require explicit user approval before entering `ROADMAP.md`.

## 2026-09-24 — D007: Use pnpm workspaces for the initial monorepo

**Decision:** Use pnpm 10 workspaces for the PayForge monorepo.

**Why:** pnpm 10.20.0 is already available in the user's environment, supports the planned `apps/*` and `packages/*` structure, and avoids adding a separate orchestration tool before one is justified.

**Alternatives considered:** npm workspaces, Yarn, and adding Turborepo immediately. All are viable, but they add either a tool change or unnecessary orchestration at the current empty-repository stage.

**Consequence:** Root workspace configuration and commands should use pnpm. A task runner may be added later only when measured workflow needs justify it.

## 2026-09-24 — D008: Defer Docker while establishing the application foundation (superseded by D015)

**Decision:** Do not require Docker during initial project scaffolding. Retain Docker Compose as an M0 deliverable to add later, after the API and dashboard foundations exist.

**Why:** Docker is not installed in the user's current environment, and the user explicitly chose to avoid it for now. Node.js, pnpm, and Git are available, so workspace and application setup can proceed independently.

**Alternatives considered:** Stop until Docker is installed; remove Docker Compose permanently. Stopping would block unrelated foundation work, while permanent removal would conflict with the authoritative blueprint.

**Consequence:** Early checks may use mocked or unavailable dependency states. PostgreSQL/Redis integration tests and Docker Compose validation remain pending until suitable services are available.

## 2026-09-24 — D009: Start the API on NestJS 11

**Decision:** Scaffold the API with the NestJS 11 CLI and keep the blueprint's Jest/Supertest testing direction.

**Why:** The user's installed Node.js 22.13.0 satisfies the NestJS 11 foundation. The current NestJS 12 schematics require a newer Node.js 22 patch release, and the NestJS 12 default module-system path uses Vitest rather than the blueprint's explicit Jest direction.

**Alternatives considered:** Upgrade Node.js immediately and use NestJS 12; use NestJS 12 with custom testing changes. Either would add an unrelated environment change or immediate scaffold churn.

**Consequence:** Use `@nestjs/cli@11` for initial generation. A future major-version upgrade must be handled as an explicit dependency upgrade with passing tests, rather than happening implicitly through an unpinned generator.

## 2026-09-24 — D010: Encode 32-byte application encryption keys as canonical base64

**Decision:** Represent `APP_ENCRYPTION_KEY_V1` and `WEBHOOK_SECRET_ENCRYPTION_KEY` as canonical base64 strings that decode to exactly 32 bytes.

**Why:** The blueprint requires AES-256-GCM and safely encoded 32-byte keys but does not prescribe an encoding. Canonical base64 is portable in environment variables and can be validated deterministically at startup.

**Alternatives considered:** Hex encoding and arbitrary minimum-length strings. Hex is also viable but twice as long; arbitrary strings do not prove a 32-byte key.

**Consequence:** Startup validation rejects malformed or incorrectly sized encryption keys. `.env.example` contains placeholders rather than usable secrets, and real values must be generated outside source control.

## 2026-09-24 — D011: Pretty-print development logs while preserving production JSON

**Decision:** Use `pino-pretty` only when `NODE_ENV=development`; keep raw structured JSON in production and silent logging in the test environment.

**Why:** The user prefers the readable style of the original NestJS development logs, while the blueprint requires structured JSON for operational environments. Development formatting preserves Pino redaction and request correlation without sacrificing production log ingestion.

**Alternatives considered:** JSON in every environment; reverting to Nest's default logger. JSON-only output reduced local readability, while reverting would discard the structured request context and centralized redaction behavior.

**Consequence:** `pino-pretty` remains a development dependency. Logging tests must ensure the transport is enabled only in development and that redaction remains active independently of presentation.

## 2026-09-24 — D012: Use a lazy node-postgres pool behind an explicit Nest database module

**Decision:** Connect Drizzle through a node-postgres `Pool` owned by a non-global Nest `DatabaseModule`. Construct the pool during application composition, allow node-postgres to connect lazily on the first query, and close it through the Nest module lifecycle.

**Why:** A managed pool provides clear resource ownership, supports transactions and direct readiness probes, and lets the application build and exercise dependency-independent liveness behavior when PostgreSQL is unavailable. Keeping the module non-global makes database dependencies visible in each consuming module.

**Alternatives considered:** The postgres.js driver and a global database module. Both are supported approaches, but node-postgres gives an explicit pool suited to Nest lifecycle management, while global registration would hide module dependencies.

**Consequence:** Modules that query PostgreSQL must import `DatabaseModule` and use `DatabaseService.client`. `DatabaseService.checkConnection()` is reserved for readiness checks. Schema generation and migrations remain explicit commands and must never run implicitly during application startup.

## 2026-09-24 — D013: Keep Redis and BullMQ connections lazy during the foundation phase

**Decision:** Own direct Redis access through a non-global queue infrastructure module and configure both ioredis and BullMQ for lazy connection. Register no queues or workers until a concrete outbox or reconciliation job exists.

**Why:** M0 must establish the queue boundary without making dependency-independent startup or liveness require a running Redis service. Deferring queue registration also avoids inventing job contracts before their domain events exist.

**Alternatives considered:** Connect Redis eagerly during startup or create placeholder queues and processors. Eager connection would couple liveness to Redis availability, while placeholders would add speculative behavior.

**Consequence:** Consumers must explicitly import `QueueInfrastructureModule`. `RedisService.checkConnection()` is reserved for readiness checks. HTTP-facing producers use bounded retries; future long-running workers may require a separate BullMQ connection policy with `maxRetriesPerRequest: null`.

## 2026-09-24 — D014: Standardize external errors at a global API boundary

**Decision:** Convert thrown API exceptions into a shared error envelope containing a stable type, code, safe message, and request ID. Keep specialized successful or operational response contracts, such as readiness status, outside this general exception envelope.

**Why:** A single boundary prevents framework defaults, stack traces, database messages, and other internal details from leaking while giving clients stable machine-readable failure information.

**Alternatives considered:** Allow Nest's default error bodies or format errors separately in each controller. Defaults do not match the required contract, and controller-local formatting is inconsistent and easy to bypass.

**Consequence:** New domain errors must pass through the global boundary and eventually map to explicit stable codes. Unexpected failures return a generic 500 message and are logged with request correlation without recording the original exception message.

## 2026-09-24 — D015: Use native macOS services and exclude Docker

**Decision:** Run PostgreSQL and Redis directly on macOS for local PayForge development. Do not add Dockerfiles, Docker Compose, or a container-based local workflow unless the user explicitly reverses this decision.

**Why:** The user explicitly chose not to use Docker at all. PostgreSQL 17 is already installed locally, and Homebrew is available for Redis, so native services can satisfy the required persistence and queue behavior.

**Alternatives considered:** Keep Docker deferred or use hosted development services. Deferral would leave M0 permanently open, while hosted services add network and account dependencies that are unnecessary for local development.

**Consequence:** M0 verification uses native service commands and direct connectivity. Machine-level installation and service control remain user actions. Repository documentation and roadmap must not schedule Docker artifacts.
