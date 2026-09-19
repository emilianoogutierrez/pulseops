# ADR 001: Start as a modular monolith

## Status
Accepted

## Context
PulseOps has distinct business domains but a single product team, one transactional database and no measured need for independent service scaling.

## Decision
Keep one deployable Next.js application while enforcing code boundaries between UI, domain logic and persistence.

## Consequences
Cross-domain transactions remain straightforward, local development stays inexpensive and there is no database/broker dual-write problem. If a measured workload later requires an independently scalable worker or ingestion service, that boundary can be extracted with evidence rather than anticipation.
