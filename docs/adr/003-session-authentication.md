# ADR 003: Database-backed opaque sessions

## Status

Accepted.

## Decision

PulseOps uses random opaque browser session tokens. The browser receives the token in an HttpOnly cookie; PostgreSQL stores only a SHA-256 hash plus user, active workspace and expiry.

Passwords use salted scrypt hashes from Node's standard crypto library.

## Why

The application does not need self-contained bearer tokens. Database-backed sessions allow immediate revocation, avoid exposing claims to the browser and keep the active workspace tied to server-side state.

## Consequences

- Authentication requires a database lookup.
- Session cleanup/rotation can evolve independently of business records.
- Production still needs login rate limiting and stronger session-management UX.
