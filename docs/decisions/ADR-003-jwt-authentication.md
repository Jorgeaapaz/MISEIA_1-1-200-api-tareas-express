# ADR-003: Stateless JWT Authentication over Server-Side Sessions

**Status:** Accepted  
**Date:** 2026-05-22

## Context

The API must authenticate users across stateless HTTP requests. Each protected request must identify the calling user so the task controller can scope queries to `userId: req.user._id`. The system must work without shared state between server instances.

## Decision

Use **JWT (HS256)** tokens with a **24-hour expiry**, generated on login and sent by the client in the `Authorization: Bearer` header. No server-side session store.

## Alternatives Considered

- **express-session + Redis session store**: Enables server-side invalidation (logout, revocation). Rejected because it requires a Redis dependency, adding operational complexity for a project where horizontal scaling and token revocation are not immediate requirements.
- **Passport.js with session persistence**: Adds an abstraction layer and still requires a session store. Rejected for the same reason — over-engineered for the scope.
- **Short-lived tokens + refresh tokens**: Better security posture for high-value APIs. Rejected because the task management domain has no high-value actions (no payments, no admin escalation) that justify the added implementation complexity of a refresh-token flow.

## Consequences

**Positive:**
- Stateless: no session store required; the server can scale horizontally without shared state.
- Simple: a single `jsonwebtoken.verify()` call in middleware is the full auth check.

**Negative:**
- Tokens cannot be invalidated before the 24-hour expiry (e.g. after a password change or logout). Acceptable for this domain.
- If `JWT_SECRET` is compromised, all active tokens are compromised until the secret rotates and all clients re-login.
