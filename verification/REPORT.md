# Verification snapshot

This report records checks actually executed against the public PulseOps source while preparing the repository. It is an engineering snapshot, not a production certification, penetration test or guarantee that all defects have been found.

## Portable checks executed

The project was installed and exercised on Windows with Node.js 24 and npm 11 using the checked-in source and local `.env` configuration.

| Check | Result |
| :--- | :--- |
| Dependency installation | Passed |
| Public-repository hygiene | Passed on the final source tree |
| ESLint | Passed |
| Prisma client generation | Passed with Prisma 7.10.0 |
| Strict TypeScript check | Passed |
| Vitest unit suite | 23 passed |
| PostgreSQL integration suite during portable run | 4 skipped because no local PostgreSQL service was available |
| Next.js production build | Passed; 19 application routes generated |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm audit` | 0 vulnerabilities |

The final hygiene scanner also excludes generated/build directories and its own rule definitions so it detects private/meta content in public project files without self-matching.

## Checks delegated to database/browser CI

The local machine used for the portable run did not have Docker available, so database-backed integration and authenticated browser checks are intentionally not claimed as local results.

The GitHub Actions workflow provisions PostgreSQL 18 independently for both database integration and browser jobs. Those jobs:

1. install the project;
2. generate the Prisma client;
3. apply the PostgreSQL schema;
4. seed the synthetic demo workspace;
5. run the integration suite; and
6. for the browser job, install Chromium and execute authenticated Playwright checks against database-backed readiness.

A tagged release should only be created after those CI jobs are green on the release commit.

## What the test layers cover

- deterministic opportunity scoring and lifecycle invariants;
- payment routing, target policy and settlement arithmetic;
- proposal/project lifecycle contracts;
- password hashing/verification;
- workspace-scoped opportunity/payment creation;
- transactional proposal-to-project conversion;
- append-only settlement reconciliation;
- authenticated dashboard and mobile shell behavior;
- proposal-to-project browser flow;
- command search keyboard behavior;
- pipeline filters and payment reconciliation UI.

## Remaining production-specific work

Before any real deployment, independently validate backup/restore procedures, production monitoring, login abuse controls, provider-specific payment/email adapters, webhook authenticity/idempotency policy and operational incident procedures.
