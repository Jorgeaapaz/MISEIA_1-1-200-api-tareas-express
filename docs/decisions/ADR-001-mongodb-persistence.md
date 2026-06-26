# ADR-001: MongoDB as the Persistence Layer

**Status:** Accepted  
**Date:** 2026-05-22

## Context

The task management API needs to persist two entity types: `User` and `Task`. Tasks have a fixed set of fields (`title`, `description`, `status`, `priority`, `dueDate`) and belong to exactly one user via a `userId` reference. No cross-entity joins are required — all queries scope to a single user. The team wanted to iterate on the Task schema during early development without incurring migration overhead.

## Decision

Use **MongoDB 7** as the database, accessed via **Mongoose 8** ODM.

## Alternatives Considered

- **PostgreSQL + Sequelize**: Strong referential integrity with foreign keys and migrations. Rejected because migrations add overhead for a project where the schema stabilised late, and the relational model offers no query advantage when all task queries are scoped by `userId` (a single equality filter).
- **SQLite (better-sqlite3)**: Zero-server setup. Rejected because SQLite uses file-level locking, which limits concurrent write throughput and is unsuitable for a multi-user API even at small scale.

## Consequences

**Positive:**
- Schema changes (e.g. adding `priority`, `dueDate`) required no migration files during development.
- Mongoose `{ timestamps: true }` auto-manages `createdAt`/`updatedAt` on every document.
- `mongodb-memory-server` provides a zero-config in-memory MongoDB for tests.

**Negative:**
- No referential integrity at the database level — if a `User` document is deleted, orphaned `Task` documents remain unless the application handles cleanup explicitly.
- Querying across users (e.g. admin reporting) would require aggregation pipelines rather than simple SQL JOINs.
