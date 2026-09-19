# Architecture

PulseOps is a modular monolith built with Next.js, TypeScript and PostgreSQL. It separates rendering, deterministic domain rules, authenticated workspace context, persistence and cross-aggregate transactions without introducing network boundaries the current workload does not justify.

## Boundaries

- `src/app` owns routing, rendering, Server Actions and HTTP entry points.
- `src/domain` contains deterministic scoring, lifecycle and settlement rules.
- `src/server/auth` owns password/session behavior.
- `src/server/contracts` validates mutation boundaries with Zod.
- `src/server/repositories` owns workspace-scoped reads.
- `src/server/services` owns transactional mutations that span aggregates.
- `prisma` defines the relational model and synthetic demo seed.

## Authentication and workspace resolution

A successful login creates a random opaque session token. Only its SHA-256 hash is persisted. The browser receives the opaque value in an HttpOnly, SameSite=Lax cookie; production cookies are Secure.

The session pins both user and active workspace. Each request resolves membership from the database before returning a `WorkspaceContext`. Business queries do not authorize against a workspace ID supplied by the browser.

Password material is hashed with Node's `scrypt` using a random per-password salt. The local seed password is explicitly demo-only.

## Multi-tenancy

Every business aggregate is scoped to `workspaceId`. Repository reads and transactional services require a server-resolved workspace context. Owner and operator roles may mutate data; viewer is read-only.

Application-level scoping is not the same thing as PostgreSQL row-level security. This release does not claim protection from a privileged database operator.

## Optimistic concurrency

Mutable opportunities and projects carry a `version` integer. State transitions update with `WHERE id = ? AND workspace_id = ? AND version = expected` and increment the version atomically. A stale browser view therefore fails instead of silently overwriting a newer decision.

## Transactional commercial conversion

Accepting a proposal is a cross-aggregate operation and lives in a service transaction:

1. resolve the proposal inside the authenticated workspace;
2. verify that its state is `SENT`;
3. fence the opportunity with its expected revision;
4. move the opportunity to `WON`;
5. mark the proposal accepted;
6. create the delivery project with the quoted amount and due date;
7. materialize contracted deliverables from structured proposal scope;
8. append proposal/project activity records;
9. commit all state together.

A partial conversion is not considered valid state.

## Payment reconciliation

PulseOps records external settlement; it does not custody money. Each observed transfer creates an append-only `PaymentSettlement`. The reconciliation service validates cumulative settlement, updates the aggregate payment status and linked project collection total, and appends activity in one transaction.

This allows a request to remain `PARTIAL` without losing the chronology or external references of prior transfers.

SPEI, Mercado Pago and USDT/Binance are operating methods, not claims of live provider integration.

## Activity history

`ActivityEvent` is append-only application history linked optionally to opportunities, projects and payments. Current state remains in relational tables, so the architecture is deliberately **not** described as event sourcing.

## Analytics

Current analytics are derived from persisted operational records. Collected cash is computed from settlement aggregates rather than inferred from proposal or project state. A separate analytics store is deliberately deferred until query volume or historical snapshot requirements justify it.

## Readiness

`/api/health` is process liveness. `/api/health/ready` verifies PostgreSQL reachability so browser/deployment checks do not confuse a running Node process with an operational application.
