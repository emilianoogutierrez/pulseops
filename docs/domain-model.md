# Domain model

PulseOps keeps commercial, delivery and settlement records connected without collapsing them into one generic deal table.

## Identity and tenancy

- `User` — human identity and password hash.
- `Workspace` — tenant boundary and operating defaults.
- `Membership` — user role inside a workspace.
- `AuthSession` — hashed opaque session token pinned to one user/workspace pair.

## Commercial records

- `Client` — company/contact identity and settlement preference.
- `Opportunity` — qualified potential work with fit inputs, score, lifecycle stage and optimistic revision.
- `Proposal` — structured summary, deliverables, acceptance criteria, exclusions, price, delivery window and acceptance state. One proposal is attached to one opportunity in this release.

## Delivery records

- `Project` — delivery aggregate created from an accepted proposal. It preserves the originating opportunity and quoted amount and carries an optimistic revision.
- `Deliverable` — contracted unit of delivery materialized from accepted proposal scope and progressed through planned, in-progress, review and accepted states.

## Settlement records

- `WorkspacePaymentCapability` — which external settlement methods are operationally available for the workspace.
- `Payment` — requested external settlement amount and current aggregate settlement state.
- `PaymentSettlement` — append-only observed transfer with amount, external reference, note and settlement timestamp.

PulseOps does not custody funds.

## Operational history

- `ActivityEvent` — append-only application history. Events can reference an opportunity, project or payment. They support audit context and product timelines but are not the source of truth for current state.

## Opportunity invariant

The primary path is:

```text
DISCOVERED -> QUALIFIED -> CONTACTED -> REPLIED -> SCOPING -> QUOTED -> WON -> DELIVERING -> DELIVERED -> PAID
```

Loss/rejection exits are allowed only from defined pre-win states. A stale `version` cannot overwrite a newer mutation.

Qualification stores both the final score and the inputs that produced it so future weighting changes do not erase the original operating signals.

## Proposal invariant

Proposal scope is contract-shaped rather than free-form: summary, deliverables, acceptance criteria and exclusions are independent fields.

A proposal may be accepted only while `SENT`. Acceptance requires the associated opportunity to be able to transition to `WON`. Opportunity fencing, proposal acceptance, project creation, contracted deliverables and activity history commit in one transaction.

## Project invariant

Projects follow a constrained lifecycle:

```text
PLANNED -> ACTIVE -> REVIEW -> DELIVERED -> CLOSED
             |          |
             v          v
          BLOCKED --> ACTIVE
```

Project transitions are revision-fenced. Deliverables have their own smaller lifecycle and cannot skip directly from planned to accepted.

## Settlement invariant

Cumulative settlement cannot exceed the requested payment amount. Zero settlement is pending, a non-zero amount below the request is partial, and exact settlement is paid. Each observed transfer is retained as its own ledger record and the linked project collection total is updated in the same transaction.
