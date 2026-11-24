# ROADMAP.md — Sequential development plan

Status convention: `[ ]` not started, `[~]` in progress, `[x]` completed.

M0 is substantially implemented but remains open for native PostgreSQL/Redis provisioning and live dependency checks. Docker was removed by explicit user decision D015. No milestone is complete. The blueprint's Phase 9 and V2/V3 extensions are outside the current V1 scope and are intentionally not scheduled below.

## [~] M0 — Foundation

**Objective:** Establish the runnable monorepo foundation without implementing payment behavior.

**Major deliverables:** Workspace structure for `apps/api`, `apps/dashboard`, and appropriate shared packages; NestJS and React/Vite shells; validated configuration; native PostgreSQL/Drizzle and Redis/BullMQ connectivity; Pino logging with sensitive-field redaction; request correlation; liveness/readiness checks; `.env.example`; baseline Jest/Supertest setup; developer README; explicit module boundaries/interfaces for later phases.

**Verification:** Install/build/typecheck/lint/test scripts defined in actual manifests must pass. Health checks must be exercised with native dependencies ready and unavailable. Logging tests must demonstrate redaction. Record exact commands and results in `PROGRESS.md`.

**Manual actions:** The user installs/starts native macOS PostgreSQL and Redis services and supplies local credentials where required.

## [ ] M1 — Identity and merchant security

**Objective:** Implement secure dashboard identity, merchant ownership, sessions, API-key authentication/scopes, rate limits, and audit foundations.

**Major deliverables:** Merchant/user registration; login/refresh/logout and session revocation; Argon2id password hashing; refresh rotation and reuse response; scoped publishable/secret/restricted test keys; one-time secret display, hashing, expiration, rotation/revocation, last-use; per-IP/per-credential rate limits; merchant isolation; audit skeleton.

**Verification:** Unit/integration/API tests for auth success/failure, refresh reuse, revocation, expiration, scope enforcement, cross-merchant denial, rate limits, secret redaction, and privileged-action audit records.

**Manual actions:** None known.

## [ ] M2 — Payments core

**Objective:** Implement synthetic customers, payment methods, Payment Intents, attempts, deterministic fake-processor behavior, and valid authorization/capture/cancel transitions.

**Major deliverables:** Customer/PII boundary; synthetic-token instruments; intent/attempt schemas and services; automatic/manual capture; allowed partial capture behavior; deterministic success and failure scenarios; timeout/unknown result handling; delayed and duplicate callbacks; V1 payment endpoints.

**Verification:** State-machine unit tests and API/integration scenarios for every token; retained attempts; capture limits; cancellation rules; retries; merchant isolation; and absence of captured-money ledger movement on declines. Financial ambiguity B002 in `BLOCKERS.md` must be resolved before capture semantics are finalized.

**Manual actions:** User decision required for B002 unless clarified by a later explicit scope update.

## [ ] M3 — Financial core

**Objective:** Make transactions and the append-only double-entry ledger the verified source of monetary truth.

**Major deliverables:** Transactions, ledger accounts/transactions/entries, per-currency pending/available balances, atomic payment-ledger-outbox writes, invariant enforcement, and reconciliation checks/alerts.

**Verification:** Tests for balanced entries, rollback of all related writes, append-only behavior, compensating corrections, currency separation, derived balances, deliberate imbalance detection, and concurrent capture protection. B001 in `BLOCKERS.md` must be resolved before ledger postings are finalized.

**Manual actions:** User decision required for B001 unless clarified by a later explicit scope update.

## [ ] M4 — Refunds, idempotency, and concurrency

**Objective:** Support retry-safe full/partial refunds and enforce financial limits under concurrent requests.

**Major deliverables:** Refund lifecycle/endpoints; refundable-amount calculation; transactional locks; idempotency storage, fingerprinting, response replay, expiry/retention; capture/refund concurrency controls.

**Verification:** Parallel refund/capture tests; over-refund rejection; same-key response replay; different-payload key rejection; failure rollback; stable original payment/ledger history; and compensating refund entries.

**Manual actions:** None known.

## [ ] M5 — Events and webhooks

**Objective:** Reliably publish committed domain events and deliver signed, retryable webhooks without duplicating domain state.

**Major deliverables:** Transactional outbox claiming; stable events; BullMQ dispatch; endpoint subscriptions; raw-body HMAC signatures; delivery history; retry/backoff/jitter; sanitized response excerpts; dead-letter state; dashboard/API replay; duplicate/delayed event simulation.

**Verification:** Commit/outbox atomicity, safe multi-worker claiming, worker retry idempotency, signature/timestamp verification, retryable response handling, dead-letter/replay, and proof that retries do not create new domain events.

**Manual actions:** External callback testing may require a user-provided reachable test endpoint; local fixtures should cover automated behavior first.

## [ ] M6 — Privacy and hardening

**Objective:** Complete the V1 privacy, encryption, retention, secret-rotation, and security-hardening requirements.

**Major deliverables:** AES-256-GCM protected fields with key versions; PII access boundary; sanitized errors/logs; retention jobs for sessions, idempotency data, webhook excerpts, and operational logs; deletion/anonymization workflows; secret rotation support; body/content/CORS/header controls; security alert signals.

**Verification:** Security/privacy tests for ciphertext/key versions, rotation, PII isolation, redaction, retention/anonymization, generic external errors, input/body limits, restrictive CORS, and invariant/security alerts.

**Manual actions:** Production-grade encryption/signing keys and deployed TLS configuration require user-managed secret and infrastructure setup. Local tests must use non-committed test values.

## [ ] M7 — Merchant dashboard

**Objective:** Provide the V1 learning and operational interface over verified backend behavior.

**Major deliverables:** Overview; payment/attempt timeline; transaction/refund detail with linked ledger entries; customers; API-key management; webhook configuration/delivery/replay; event viewer; ledger explorer; authorized audit view; explicit destructive confirmation for test-data reset.

**Verification:** Frontend build/typecheck/lint/tests; role/merchant access behavior; core user flows against the API; safe secret display; loading/error/empty states; and explicit reset confirmation.

**Manual actions:** Browser-level review may be required for final visual/interaction acceptance.

## [ ] M8 — Failure lab and V1 acceptance

**Objective:** Demonstrate recovery behavior and verify the complete V1 Definition of Done.

**Major deliverables:** Guided timeout, delayed completion, duplicate callback/event, worker crash, webhook failure/retry, reconciliation failure, and race scenarios; operational metrics/queue visibility; complete setup/API/failure-lab documentation.

**Verification:** Full automated suite and end-to-end blueprint scenarios; deliberate worker interruption around commit/publication; invariant and isolation checks; clean setup rehearsal; dashboard walkthrough; and final cross-file project-memory reconciliation.

**Manual actions:** Final deployment, external TLS/DNS, production-like credentials, and hosted callback validation require explicit user action if requested. Deployment is not implicitly part of repository completion.

## Current milestone

**M0 — Foundation** is active. The application foundation is locally verified; follow `.ai/TASKS.md` for native service setup and live readiness checks, and do not begin M1 or payment logic.
