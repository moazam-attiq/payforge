# API module boundaries

These Nest modules establish the V1 domain ownership boundaries. They are intentionally empty during M0; adding a module here does not imply that its behavior is implemented.

- `auth`: dashboard login, access/refresh tokens, sessions, rotation, and revocation.
- `merchants`: merchant identity, ownership, and merchant-scoped access rules.
- `api-keys`: publishable, secret, and restricted test credentials and scopes.
- `customers`: merchant-owned customer records and the isolated PII boundary.
- `payment-methods`: synthetic test-token instruments only.
- `payments`: Payment Intents, attempts, authorization, capture, and cancellation state machines.
- `refunds`: full and partial refund lifecycle and concurrency limits.
- `transactions`: immutable records of successful financial operations.
- `ledger`: append-only double-entry postings and derived per-currency balances.
- `outbox`: transactional domain-event records and publication state.
- `webhooks`: endpoints, subscriptions, signed deliveries, retries, dead letters, and replay.
- `audit`: immutable privileged-action records.
- `reconciliation`: invariant checks and operational alerts.
- `health`: process liveness and PostgreSQL/Redis readiness.

Controllers should remain thin. Business rules belong in application/domain services inside the owning module. A module must import `DatabaseModule` or `QueueInfrastructureModule` explicitly when it begins using that infrastructure. Do not move database models, authorization rules, or financial calculations into `packages/contracts`.
