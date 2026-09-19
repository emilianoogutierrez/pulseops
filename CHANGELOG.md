# Changelog

## Unreleased

### Added

- Structured proposal builder with explicit deliverables, acceptance criteria, exclusions and delivery terms.
- Proposal detail workspace and lifecycle transition from draft to sent to accepted delivery.
- Contracted deliverables materialized when an accepted proposal creates a project.
- Project lifecycle with optimistic concurrency and auditable status transitions.
- Deliverable lifecycle with explicit review/acceptance state.
- Append-only payment settlement ledger with partial-payment reconciliation.
- Payment detail workspace with external-reference history and remaining-balance visibility.
- Database-backed readiness endpoint for browser and deployment checks.
- Keyboard-navigable command menu, skip link, loading/error/not-found states and reduced-motion support.
- Unit coverage for project lifecycle, proposal contracts and settlement arithmetic.
- PostgreSQL integration and Playwright flows for revenue conversion and reconciliation.

### Changed

- Collected-cash analytics now use actual settled amount instead of treating only fully paid requests as revenue.
- Product surfaces use a single restrained, content-first design system and real object detail workspaces.
- Demo identity and seed data remain synthetic and provider-independent.

## 0.1.0-alpha.3

- Added global command search across clients, opportunities and projects.
- Added real opportunity filters and an audited opportunity creation flow.
- Added opportunity, client and project detail workspaces with chronology and payment context.
- Added external payment-request registration for SPEI, Mercado Pago links and Binance/USDT references.
- Expanded source, service and payment analytics.
- Reworked product UI around a restrained product-specific design system.
