# BLOCKERS.md — Open blockers and manual actions

Live list. Close an item only when resolution is verified. Preserve non-trivial history by moving resolved items to `Resolved` with the date and evidence.

M0 scaffolding is not currently blocked. The items below affect later work and must be settled before their associated behavior is finalized.

## Open now

### B001 — Ledger posting convention and fee policy are unspecified

- **What is blocked:** Final ledger account directions/posting templates and platform-fee calculations in M3.
- **Why:** The blueprint gives a `$100` capture with a `$3` fee as an example, but deliberately leaves the debit/credit convention open and does not define whether the fee is fixed, percentage-based, configurable, or merely illustrative.
- **Type:** Required product/accounting decision; not a software bug and not an AI limitation.
- **Exact next action:** Before implementing M3 postings, propose a concrete convention and V1 fee rule with example journal entries, then obtain explicit user approval if no newer scope document resolves it.
- **Workaround:** M0–M2 may define interfaces and amount fields without committing to final posting directions or fee calculation.
- **Resolution condition:** A user-approved rule is recorded in a new `DECISIONS.md` entry and reflected in ledger tests/documentation.

### B002 — Partial-capture multiplicity is ambiguous

- **What is blocked:** Final capture state transitions and concurrency rules in M2/M4.
- **Why:** The blueprint requires full and partial capture but does not state whether V1 permits one partial capture followed by release/cancellation of the remainder, or multiple captures up to the authorized total.
- **Type:** Required financial-domain decision; not a software bug and not an AI limitation.
- **Exact next action:** Before implementing capture behavior, present the two semantics and obtain the user's explicit choice unless a newer authoritative requirement resolves it.
- **Workaround:** Foundation and identity work can proceed; payment interfaces should avoid locking in either behavior prematurely.
- **Resolution condition:** The selected behavior is recorded in `DECISIONS.md`, implemented in the state machine, and covered by limit/concurrency tests.

## Manual actions

### A001 — Docker is unavailable and intentionally deferred

- **Affected work:** Docker Compose validation and containerized PostgreSQL/Redis development services later in M0.
- **Current state:** The user confirmed on 2026-09-24 that the `docker` command is unavailable and chose to avoid Docker for now.
- **Exact next action:** Continue workspace and application scaffolding. When containerized infrastructure is reached, the user can install/start Docker Desktop or explicitly choose a supported local/hosted PostgreSQL and Redis alternative.
- **Resolution condition:** The selected dependency approach is available and its relevant connectivity/configuration checks pass.

Other potential needs such as deployment secrets, DNS/TLS, or an externally reachable webhook endpoint become manual actions only when the relevant work is attempted and the need is verified.

## Resolved

None.
