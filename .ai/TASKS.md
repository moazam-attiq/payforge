# TASKS.md — Current milestone checklist

## M0 — Foundation

The repository contains no application code yet. Complete only the foundation milestone; do not implement payment logic.

### Part 1 — Repository and workspace

- [ ] Re-inspect the repository and preserve any user changes made after memory initialization.
- [x] Select pnpm workspaces as the package manager/workspace approach; recorded in D007.
- [ ] Initialize Git only if the user requests it or repository policy clearly authorizes it.
- [ ] Create `apps/api` as a NestJS TypeScript application.
- [ ] Create `apps/dashboard` as a React/Vite TypeScript application.
- [ ] Create only the shared packages needed for contracts/test fixtures; avoid speculative abstractions.
- [ ] Define real root scripts for build, typecheck, lint, test, and development workflows.

### Part 2 — API foundation

- [ ] Add strict Zod environment validation that fails fast for security-critical configuration.
- [ ] Configure PostgreSQL and Drizzle with an explicit database boundary.
- [ ] Configure Redis and BullMQ foundations without implementing payment/event jobs.
- [ ] Add Pino structured logging with tested redaction for credentials, authorization headers, tokens, secrets, and sensitive PII fields.
- [ ] Add request/correlation ID generation and propagation through HTTP context and the background-job interfaces established in this phase.
- [ ] Add consistent safe error handling that does not expose stack traces or database details.
- [ ] Add `GET /health/live` for process liveness.
- [ ] Add `GET /health/ready` that reports PostgreSQL/Redis dependency readiness without leaking secrets.
- [ ] Establish empty module boundaries/interfaces needed by later phases without adding payment behavior.

### Part 3 — Local infrastructure and configuration

- [ ] Later in M0, add Docker Compose services for PostgreSQL and Redis with health checks and non-secret development defaults; Docker is intentionally deferred under D008.
- [ ] Add `.env.example` containing placeholders and safe local guidance only.
- [ ] Ensure actual environment files and secret-bearing artifacts are ignored.
- [ ] Document startup, shutdown, dependency, and troubleshooting steps in `README.md`.

### Part 4 — Verification

- [ ] Add baseline Jest/Supertest unit and integration test configuration.
- [ ] Verify configuration rejects missing or invalid critical values.
- [ ] Verify sensitive fields are redacted from structured logs.
- [ ] Verify liveness independently of dependencies.
- [ ] Verify readiness in both dependency-ready and dependency-unavailable states.
- [ ] Validate the Docker Compose configuration after Docker becomes available; this does not block initial scaffolding.
- [ ] Run the actual install, build, typecheck, lint, and test commands and record exact outcomes in `PROGRESS.md`.
- [ ] Inspect all failures, fix in-scope causes, and rerun relevant checks before marking any task complete.

### Part 5 — Documentation and handoff

- [ ] Update `PROJECT.md` from planned to verified stack/structure details after implementation.
- [ ] Record significant choices in `DECISIONS.md` without rewriting earlier entries.
- [ ] Record unresolved software issues, external dependencies, and user actions in `BLOCKERS.md`.
- [ ] Add a reverse-chronological session entry to `PROGRESS.md` with changed files, verification evidence, remaining risks, and exact next task.
- [ ] Reconcile milestone/task status across all seven `.ai/` files.
- [ ] Stop after the verified foundation; do not begin M1 in the same milestone completion report.
