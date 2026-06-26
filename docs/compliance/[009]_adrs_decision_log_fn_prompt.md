@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Architecture Decision Records (ADRs)

## Role
Act as a Software Architect. You are an expert in Architecture Decision Records (ADRs), technical documentation, and the MADR (Markdown Architectural Decision Records) format.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant item: `dc_adrs_o_decision_log` (Excepcional — Documentation)  
Issue: No ADRs or decision log exists. Evaluators at the Excepcional level require structured ADRs with context, decision, and consequences.  
Prerequisite: Task [007] (Trade-offs documentation) should be completed first — the decisions listed there feed directly into ADRs.

## Task
Create a `docs/decisions/` directory containing individual ADR files following the MADR format for the 4 key decisions made in this project.

### ADR Guidelines
- Use MADR (Markdown Any Decision Records) format
- Directory: `docs/decisions/`
- File naming: `ADR-001-<short-title>.md`, `ADR-002-<short-title>.md`, etc.
- Each ADR has these sections: **Status**, **Context**, **Decision**, **Alternatives Considered**, **Consequences**
- Status values: `Accepted`, `Deprecated`, `Superseded by ADR-XXX`
- Be specific and quantitative where possible
- Add an index `docs/decisions/README.md` listing all ADRs

**ADRs to create:**

**ADR-001: MongoDB as the persistence layer**
- Context: Need to store user and task data; task schema is known; no relational joins required
- Decision: MongoDB via Mongoose ODM
- Alternatives: PostgreSQL (Sequelize), SQLite (better.js)
- Consequences: Flexible schema evolution; no migration files needed; loses referential integrity guarantees

**ADR-002: CommonJS modules over ES Modules**
- Context: Node.js 20 supports ESM natively but Jest 29 requires `--experimental-vm-modules` flag for ESM
- Decision: CommonJS (`require`/`module.exports`) throughout
- Alternatives: ESM (`import/export`) with `"type": "module"` in package.json
- Consequences: Simpler Jest setup; consistent with Express ecosystem examples; will need migration when Jest fully stabilizes ESM support

**ADR-003: Stateless JWT authentication over server sessions**
- Context: API needs to authenticate users across requests; team familiar with JWT
- Decision: JWT signed with HS256, 24h expiry, stored client-side
- Alternatives: express-session + Redis store; Passport.js with session persistence
- Consequences: Stateless — no session store needed; cannot invalidate tokens before expiry (acceptable for task management domain); horizontal scaling trivial

**ADR-004: mongodb-memory-server for integration tests**
- Context: Tests need a MongoDB instance; CI must not depend on external services
- Decision: `mongodb-memory-server` spun up per test suite run
- Alternatives: Jest mocks for Mongoose; Docker-based MongoDB in CI; shared test database
- Consequences: Tests run real Mongoose queries (catches schema bugs mocks would miss); adds ~30s to cold start; no Docker required in CI

### README Update
Add a `## Architecture Decision Records` section to README linking to `docs/decisions/README.md`.

## Output Format
- `docs/decisions/README.md` — ADR index
- `docs/decisions/ADR-001-mongodb-persistence.md`
- `docs/decisions/ADR-002-commonjs-modules.md`
- `docs/decisions/ADR-003-jwt-authentication.md`
- `docs/decisions/ADR-004-memory-server-tests.md`
- Updated `README.md` with ADR link

## Examples and Steps to Follow

Example ADR structure:
```markdown
# ADR-001: MongoDB as the Persistence Layer

**Status:** Accepted  
**Date:** 2026-05-22

## Context
The task management API needs to persist User and Task documents...

## Decision
Use MongoDB 7 via Mongoose 8 ODM.

## Alternatives Considered
- **PostgreSQL + Sequelize**: Strong relational guarantees, migrations required...
- **SQLite**: Zero-server setup, but poor fit for multi-user concurrent writes...

## Consequences
**Positive:**
- Schema changes require no migration files during development
- Mongoose timestamps (`{ timestamps: true }`) auto-manage createdAt/updatedAt

**Negative:**
- No referential integrity at the database level (enforced only by Mongoose)
- Harder to query across collections compared to SQL JOINs
```

1. Create `docs/decisions/` directory
2. Write ADR-001 through ADR-004
3. Create `docs/decisions/README.md` index
4. Add ADR link to main README
5. Commit: `docs: add Architecture Decision Records for key project decisions`

## Output Checklist and Guardrails
- [ ] 4 ADR files created in `docs/decisions/`
- [ ] Each ADR has: Status, Date, Context, Decision, Alternatives Considered, Consequences
- [ ] `docs/decisions/README.md` index lists all ADRs with one-line descriptions
- [ ] Main `README.md` links to `docs/decisions/README.md`
- [ ] Decisions match the actual implementation in the codebase
- [ ] No code changes — documentation only
- [ ] Committed and pushed
