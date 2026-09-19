# Testing strategy

PulseOps separates deterministic domain checks from persistence and browser verification.

## Unit

Vitest covers:

- opportunity scoring and legal/illegal opportunity transitions;
- payment routing and payment-link policy;
- proposal lifecycle and structured scope contract;
- project lifecycle rules;
- settlement arithmetic and over-settlement rejection;
- scrypt password hashing and verification.

Unit tests do not prove PostgreSQL transaction behavior.

## PostgreSQL integration

`tests/integration/revenue-workflow.test.ts` runs only when `DATABASE_URL` is present. It exercises the seeded database and verifies cross-record workflows including:

- accepting a sent proposal creates a project in the same workspace and materializes contracted deliverables;
- recording an external settlement updates payment state, preserves a settlement ledger record and writes activity;
- scored opportunity creation remains inside the authenticated workspace;
- cross-workspace payment creation is rejected.

The GitHub Actions `postgres` job provisions PostgreSQL 18, applies the Prisma schema, seeds the demo workspace and runs the integration suite.

## Browser

Playwright signs in through the real login surface and waits on database-backed readiness. Browser checks cover:

- authenticated dashboard data;
- mobile navigation;
- proposal scope and proposal-to-project conversion;
- command search keyboard behavior;
- operator pipeline filters;
- payment reconciliation detail.

## Static / build checks

The quality workflow runs public-content hygiene, ESLint, Prisma generation, strict TypeScript checking, unit tests and a production Next.js build.

Test results are engineering evidence, not a security certification or capacity benchmark.
