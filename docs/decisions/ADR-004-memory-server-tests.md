# ADR-004: mongodb-memory-server for Integration Tests

**Status:** Accepted  
**Date:** 2026-05-22

## Context

The test suite runs integration tests against real Mongoose queries. A MongoDB instance is needed for every test run. The instance must be isolated (tests cannot affect a shared database), reproducible, and available in CI without external service dependencies.

## Decision

Use **`mongodb-memory-server`** to spin up an in-process MongoDB instance in `tests/setup.js` before the test suite runs and tear it down after.

## Alternatives Considered

- **`jest.mock()` mocking Mongoose methods**: Fast but shallow — mocks return what you tell them, so schema constraints, unique indexes, and update operators (`$set`, `$push`) are never exercised. Rejected because mocked tests passed in a previous project while the real migration failed in production (MongoDB unique index behaviour differs from a naive mock).
- **Docker-based MongoDB service in CI**: Closer to production but requires Docker-in-Docker or a service container configuration in CI. Adds ~45 s to CI spin-up and a Docker dependency. Rejected in favour of a lighter approach.
- **Shared test database**: Tests interact with a persistent MongoDB. Rejected because test isolation requires careful setup/teardown per suite, and parallel test runs risk data collisions.

## Consequences

**Positive:**
- Tests exercise real Mongoose query behaviour, including schema validation, unique indexes, and aggregation operators.
- No external process or Docker required — `npm test` works on any machine with Node.js.
- Each test suite gets a clean database via `beforeEach` hooks in `tests/setup.js`.

**Negative:**
- Cold start adds ~20–30 s to the first test run while `mongodb-memory-server` downloads its MongoDB binary (~70 MB, cached after first run).
- Binary download can fail in air-gapped CI environments — requires `MONGOMS_DOWNLOAD_URL` override.
