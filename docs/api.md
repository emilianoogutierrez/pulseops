# HTTP boundary

PulseOps primarily uses Server Components and Server Actions for its browser application. HTTP routes exist where an external or programmatic boundary is useful.

## Authentication

Authenticated routes use the `pulseops_session` cookie (or `SESSION_COOKIE_NAME`). The value is an opaque token; PostgreSQL stores only its SHA-256 hash.

Unauthenticated API calls return `401`.

## `GET /api/v1/opportunities`

Returns opportunities from the active server-resolved workspace. The caller cannot choose a workspace by query parameter.

## `POST /api/v1/opportunities/{id}/transition`

Body:

```json
{
  "targetStage": "SCOPING",
  "expectedVersion": 3
}
```

The route applies the same state-machine and optimistic-concurrency service used by the product UI.

- `400` malformed contract
- `401` no valid session
- `409` stale expected version
- `422` illegal stage transition

Browser product mutations currently prefer Server Actions. Additional public write APIs require an explicit origin/CSRF policy before being treated as production-ready.
