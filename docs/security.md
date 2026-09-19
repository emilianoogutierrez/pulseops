# Security boundary

PulseOps treats the browser as untrusted and resolves identity/workspace scope on the server.

## Implemented

- Passwords use salted `scrypt` hashes; plaintext passwords are never persisted.
- Login sessions use 256-bit random opaque tokens.
- Only SHA-256 session-token hashes are stored in PostgreSQL.
- Session cookies are HttpOnly and SameSite=Lax; production cookies are Secure.
- Sessions are time limited and tied to one active workspace.
- Workspace membership is rechecked from the database when resolving session context.
- Business reads and mutation services are scoped by the server-resolved workspace.
- Viewer roles cannot invoke domain mutations.
- Opportunity/project writes use optimistic concurrency to reject stale decisions.
- Payment reconciliation rejects over-settlement and keeps observed transfers append-only.
- Mercado Pago URLs are references only and are constrained by the payment-link policy.
- Demo data contains no real customer data, bank credentials, provider secrets or cryptocurrency keys.
- Environment-specific configuration is excluded from version control.

## Residual risks / production gates

- Login rate limiting and account lockout are not implemented.
- Public write APIs beyond the current authenticated boundary need explicit origin/CSRF policy review.
- Session rotation and multi-device session management are intentionally minimal.
- Database row-level security is not implemented.
- Payment-provider credentials and webhook verification do not exist because provider automation is not implemented.
- Append-only application history cannot defend against a privileged database operator.
- A production deployment still needs dependency advisory review, backup/restore rehearsal and operational monitoring.

The public demo uses reserved `.test` email addresses and a documented local-only password.
