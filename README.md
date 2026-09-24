# PayForge

PayForge is a developer-facing sandbox payment platform for learning payment architecture, financial invariants, idempotency, event delivery, privacy, and operational failure handling.

The platform will use synthetic test payment methods only. It must never accept real card numbers, CVVs, bank credentials, identity documents, or real funds.

## Current status

The project is in M0 Foundation. The pnpm workspace root is initialized, while the API and dashboard applications have not yet been scaffolded.

## Planned workspace

```text
apps/
  api/          NestJS API
  dashboard/    React and Vite dashboard
packages/
  contracts/    Shared schemas and transport types where appropriate
  test-fixtures/
```

## Local prerequisites

- Node.js 22 or later
- pnpm 10.20.0
- Git

PostgreSQL, Redis, and Docker Compose integration will be added later in M0. Docker is intentionally deferred during the initial application scaffolding.

## Project memory

Read `.ai/CONTEXT.md` before continuing implementation. The `.ai/` directory records the product boundary, roadmap, active tasks, decisions, progress, and blockers.

