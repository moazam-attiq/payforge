# TASKS.md — Current milestone checklist

## M0 — Foundation

The API and dashboard shells now exist. Complete only the remaining foundation work; do not implement payment logic.

### Part 1 — Repository and workspace

- [x] Re-inspect the repository and preserve user-created Git and pnpm root files.
- [x] Select pnpm workspaces as the package manager/workspace approach; recorded in D007.
- [x] Initialize Git; completed manually by the user. GitHub remote linking remains user-managed.
- [x] Create and baseline-verify `apps/api` as a NestJS 11 TypeScript application.
- [x] Create and baseline-verify `apps/dashboard` as a React/Vite TypeScript application.
- [x] Create only the shared packages currently needed: `@payforge/contracts` is installed, linked to the API, and build/typecheck verified; test fixtures remain deferred until there is a concrete shared use case.
- [x] Define real root scripts for API/dashboard development, build, typecheck, lint, tests, and formatting.

### Part 2 — API foundation

- [x] Add strict Zod environment validation that fails fast for security-critical configuration; configured startup is user-confirmed.
- [x] Configure PostgreSQL and Drizzle with an explicit database boundary; the lazy pool, typed Drizzle service, lifecycle cleanup, migration configuration, and dependency-independent checks are locally verified. Live PostgreSQL readiness remains tracked by the readiness tasks.
- [x] Configure Redis and BullMQ foundations without implementing payment/event jobs; lazy Redis and BullMQ configuration boundaries and dependency-independent application composition are locally verified. Live Redis behavior remains tracked by readiness verification.
- [x] Add Pino structured logging with tested redaction for credentials, authorization headers, tokens, secrets, and sensitive PII fields; use readable development output under D011.
- [x] Add request/correlation ID generation and HTTP propagation; job propagation will be implemented with the first real BullMQ job contract.
- [x] Add consistent safe error handling that does not expose stack traces or database details; the global error envelope and HTTP coverage passed user-run unit/e2e/build verification.
- [x] Add `GET /health/live` for process liveness; successful response is user-confirmed.
- [x] Add `GET /health/ready` that checks PostgreSQL and Redis concurrently and reports safe dependency states; unit, mocked HTTP, and build verification passed. Live service behavior remains tracked by the readiness verification task.
- [x] Establish empty module boundaries/interfaces needed by later phases without adding payment behavior; all blueprint V1 ownership modules, boundary documentation, and application composition passed user-run tests/build.

### Part 3 — Local infrastructure and configuration

- [~] Provision native macOS PostgreSQL and Redis services under D015; PostgreSQL 17 is accepting connections on port 5432 but the PayForge role/database are not yet verified, and Redis is not installed.
- [x] Add `.env.example` containing placeholders and safe local guidance only.
- [x] Ensure actual environment files and common secret-bearing artifacts are ignored; `.env` is ignored and no tracked `.env`, PEM, or key file was found. `.env.example` is intentionally tracked.
- [x] Document install, environment setup, startup, shutdown, verification, dependency behavior, database commands, and troubleshooting in `README.md`.

### Part 4 — Verification

- [x] Add and baseline-verify Jest/Supertest unit and e2e test configuration.
- [x] Verify configuration rejects missing or invalid critical values.
- [x] Verify sensitive fields are redacted from structured logs.
- [x] Verify liveness independently of dependencies.
- [~] Verify readiness in both dependency-ready and dependency-unavailable states; user-confirmed unit and HTTP-level mocked coverage passes, while live service checks remain pending.
- [ ] Verify native PostgreSQL and Redis service startup, direct client connectivity, and clean restart behavior.
- [x] Run the actual install, build, typecheck, lint, unit, and e2e commands and record outcomes in `PROGRESS.md`; package installation and runtime commands were user-run under the agreed workflow.
- [x] Inspect observed failures, fix in-scope causes, and rerun relevant checks before marking tasks complete.

### Part 5 — Documentation and handoff

- [x] Update `PROJECT.md` from planned to verified stack/structure details after implementation.
- [x] Record significant choices in `DECISIONS.md` without rewriting earlier entries.
- [x] Record unresolved software issues, external dependencies, and user actions in `BLOCKERS.md`.
- [x] Add reverse-chronological session entries to `PROGRESS.md` with changed files, verification evidence, remaining risks, and exact next tasks.
- [x] Reconcile milestone/task status across all seven `.ai/` files for the native-service foundation state.
- [x] Do not begin M1 while M0 remains active.
