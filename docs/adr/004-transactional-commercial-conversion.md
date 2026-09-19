# ADR 004: Proposal acceptance is a transaction

## Status

Accepted.

## Decision

Accepting a proposal is not modeled as three unrelated UI writes. PulseOps performs opportunity fencing, proposal acceptance, project creation and activity history in one PostgreSQL transaction.

## Why

A project without an accepted proposal, or an accepted proposal whose opportunity still appears quoted, is contradictory business state. The transition crosses aggregate boundaries and therefore belongs in an application service with one transaction.

## Consequences

- The mutation requires an expected opportunity revision.
- Partial conversion is rolled back.
- Delivery starts from a traceable commercial record rather than duplicated form data.
