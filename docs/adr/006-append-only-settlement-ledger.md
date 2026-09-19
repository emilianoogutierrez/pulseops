# ADR 006: Keep payment settlements append-only

## Status

Accepted.

## Context

A payment request can be settled in multiple external transfers. Replacing a single `paidAmount` field would lose the chronology and external references needed to reconcile SPEI, Mercado Pago or USDT settlements.

## Decision

`Payment` stores the requested amount and current aggregate settlement state. Each observed transfer creates a `PaymentSettlement` record. The service validates that cumulative settlement cannot exceed the request, updates the aggregate state and increments linked project collection in the same transaction.

## Consequences

- Partial collection is representable without rewriting history.
- Reconciliation retains external references and notes for each observed transfer.
- Corrections/refunds need an explicit compensating operation in a later version; history is not silently edited.
