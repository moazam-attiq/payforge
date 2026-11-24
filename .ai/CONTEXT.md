# CONTEXT.md — Session resumption guide

## Project summary

PayForge is a developer-facing sandbox payment platform under active construction. It teaches payment lifecycle, accounting, idempotency, event delivery, privacy, and operational-failure patterns using synthetic test instruments only. It must never accept real card/bank data or move real funds.

The authoritative scope is the user-supplied engineering blueprint summarized in `PROJECT.md`. The repository was empty when `.ai/` was initialized on 2026-09-24, but it now contains the verified M0 application foundation described in `PROGRESS.md`. Do not mistake empty domain-module scaffolding or the detailed target design for implemented product behavior.

## How to determine current state

Read these files in this order at the start of every session:

1. `PROJECT.md` — authority, V1 boundary, invariants, required architecture, and completion rules.
2. `ROADMAP.md` — milestone sequence and status.
3. `TASKS.md` — the only detailed checklist for the active milestone.
4. `PROGRESS.md` — what previous sessions actually changed and verified.
5. `BLOCKERS.md` — unresolved decisions, bugs, external dependencies, and manual actions.
6. `DECISIONS.md` — binding architectural history; read before proposing structural changes.

Then inspect current repository state and Git history, if Git has since been initialized. Prefer newer verified repository evidence for implementation status, but never use code presence to override explicit user scope.

## Current milestone

The active milestone is identified in both the bottom of `ROADMAP.md` and the heading of `TASKS.md`; they must match. The active milestone is **M0 — Foundation**. The application foundation is implemented and locally verified. M0 remains active while native PostgreSQL/Redis services and live readiness are completed under D015/A002. Docker is excluded. Do not begin M1 until M0 is completed or the user explicitly changes the milestone plan.

## Session continuation rules

- Continue the active milestone and its checklist. Do not start unrelated phases.
- Inspect `BLOCKERS.md` before work and resolve only what can be supported by evidence.
- Stay within the V1 boundary in `PROJECT.md`; future V2/V3 ideas are not active scope.
- Read applicable decisions before changing architecture. Supersede decisions with a new entry; never erase history.
- Inspect the repository before editing and preserve correct existing work and user changes.
- Keep controllers thin and financial/security rules in domain/application services.
- Do not create or apply destructive database operations without explicit authorization. Schema definitions can be authored as required, but migration execution must follow the user's current authorization and project rules.
- Do not guess about ambiguous financial behavior. Record the issue in `BLOCKERS.md` and request a user decision before the affected implementation.
- Verify relevant type, lint, test, and build checks before declaring work complete. Record exact commands and outcomes in `PROGRESS.md`.
- Update project memory during the same session whenever scope, milestone status, significant decisions, blockers, or verified implementation state changes.

## Important project conventions

These conventions come from the authoritative blueprint. Foundation-level enforcement exists where recorded in `PROGRESS.md`; later domain behavior remains target state.

### Domain and repository boundaries

- Use a modular monolith with explicit modules for auth, merchants, API keys, customers, payment methods, payments/attempts, refunds, transactions, ledger/balances, webhooks, outbox, audit, and reconciliation.
- Use shared contracts only where they genuinely serve both API and dashboard; do not let shared packages absorb domain behavior.
- Keep transport concerns in controllers/guards/interceptors and business rules in services/domain code.

### Money and persistence

- Store money in integer minor units plus explicit currency.
- Keep ledger entries append-only and use compensating entries for corrections.
- Require balanced debits/credits before commit.
- Commit financial state, ledger entries, and outbox events in one PostgreSQL transaction.
- Use transactions and row locks or equivalent protection for capture/refund limits; reinforce invariants with database constraints where possible.

### Identity and security

- Separate dashboard JWT authentication from machine-to-machine API-key authentication.
- Hash passwords with Argon2id and store refresh tokens as hashes with rotation/reuse detection.
- Show raw API secrets once and store a verification hash where possible.
- Never log authorization headers, API keys, refresh tokens, webhook secrets, client secrets, or sensitive PII.
- Enforce merchant isolation and authorization at service/domain boundaries as well as HTTP guards where practical.

### API and events

- Validate external input with strict Zod schemas.
- Use stable prefixed public IDs, UTC ISO-8601 timestamps, stable error codes, request IDs, and cursor pagination where practical.
- Scope idempotency by merchant and operation; fingerprint requests and replay the original completed response.
- Preserve stable domain event IDs. Make outbox processors, workers, callbacks, and webhook handlers safe to retry.
- Sign webhooks over `timestamp + "." + raw_request_body` using HMAC-SHA256 and expose timestamp, signature, and event ID headers.

### Testing and documentation

- Add meaningful tests for financial invariants and every bug fixed.
- Cover rollback, concurrency, retry, duplicate, delayed, timeout, and cross-merchant cases where relevant.
- Do not claim a phase, test, deployment, or manual action succeeded without evidence.
- Keep README/API setup documentation and all seven `.ai/` files consistent with verified behavior.
