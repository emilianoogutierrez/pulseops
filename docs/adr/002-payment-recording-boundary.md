# ADR 002: Record settlement, do not process money

## Status
Accepted

## Context
The operating model accepts domestic Mexican payments through SPEI or Mercado Pago and can accept USDT through Binance for international work. PulseOps does not need to become a regulated payment processor to track those flows.

## Decision
Represent payment capabilities, expected payments, external references and payment links. Treat provider settlement as an external system boundary.

## Consequences
The core product can rank payment compatibility and reconcile revenue without storing bank credentials or cryptocurrency private keys. Provider APIs remain optional adapters.
