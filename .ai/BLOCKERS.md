# BLOCKERS.md — Open blockers and manual actions

Live list. Close an item only when resolution is verified. Preserve non-trivial history by moving resolved items to `Resolved` with the date and evidence.

The application portion of M0 is complete. A002 tracks the native PostgreSQL/Redis service work needed to close M0. B001 and B002 affect later domain milestones.

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

### A002 — Native PostgreSQL and Redis services require local setup

- **Affected work:** Live PostgreSQL/Redis connectivity, readiness verification, and M0 completion.
- **Current state:** After the user restarted the existing PostgreSQL 17 launch daemon, `pg_isready` reported that `localhost:5432` accepts connections. The PayForge role/database are not yet verified. Redis is not installed. Homebrew 6.0.11 is available.
- **Exact next action:** Create and verify the dedicated PayForge PostgreSQL role/database, install Redis with Homebrew, start Redis as a user service, then verify both direct clients before testing `/health/ready`.
- **Resolution condition:** PostgreSQL accepts a connection using the local PayForge database credentials, `redis-cli ping` returns `PONG`, the API returns ready while both run, and returns unavailable when either dependency is deliberately stopped.

Other potential needs such as deployment secrets, DNS/TLS, or an externally reachable webhook endpoint become manual actions only when the relevant work is attempted and the need is verified.

## Resolved

### 2026-09-24 — A001: Docker unavailable and deferred

The user explicitly decided that PayForge will not use Docker. D015 supersedes D008 and removes Docker Compose from M0. Native macOS PostgreSQL and Redis services replace the containerized development approach.
