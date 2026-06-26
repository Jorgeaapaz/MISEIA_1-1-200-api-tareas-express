@~/.claude/prompts/new_functionality_prompt_spec.md

# Document Technical Trade-offs and Decisions in README

## Role
Act as a Software Architect. You are an expert in documenting architectural decisions, trade-offs, and technical rationale for Node.js projects.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant items: `dc_decisiones_documentadas` and `dc_cambios_ia_documentados` (Notable — Documentation)  
Issues:  
1. The README "Design Patterns / Architecture" section describes what was used but not WHY over alternatives. Evaluators require at least 2 real trade-offs with reasoning — not generic statements.  
2. `AGENTS.md` and `PROMPT.md` in the repo indicate AI-assisted development, but the README does not document what was reviewed or changed from AI-generated output.

## Task
Add two new sections to `README.md`:
1. `## Technical Decisions` — documents at least 3 real trade-offs
2. `## AI Usage` — documents how AI was used and what was critically reviewed or changed

### Technical Decisions Guidelines
Each decision must follow this structure:
- **Decision:** what was chosen
- **Alternatives considered:** what else was evaluated
- **Reason:** the specific rationale (not generic — be precise)

Candidate decisions to document (pick real ones from this project):

**Decision 1 — MongoDB over relational DB**
- Alternatives: PostgreSQL, SQLite
- Reason: Task documents have a fixed, predictable shape with no relational joins needed; embedded userId reference covers user scoping without JOIN queries; schemaless flexibility allowed iterating on the Task shape during development without migrations

**Decision 2 — CommonJS (`require`) over ES Modules**
- Alternatives: `import/export` (ESM)
- Reason: Jest 29 has known issues with ESM + experimental vm modules in Node 20 without additional config; keeping CommonJS eliminates the `--experimental-vm-modules` flag and the transform pipeline, keeping test runs simple and reproducible

**Decision 3 — JWT stored client-side (stateless) over server-side sessions**
- Alternatives: express-session with Redis, cookie-based sessions
- Reason: Stateless JWT eliminates the need for a session store, making horizontal scaling trivial; 24h expiry is acceptable for a task management tool where session invalidation urgency is low

**Decision 4 — mongodb-memory-server for tests over mocking**
- Alternatives: `jest.mock()` for Mongoose, Docker-based MongoDB for tests
- Reason: In-memory server runs real MongoDB queries, catching schema constraint and index issues that mocks would silently pass; avoids a Docker dependency in CI; faster than a persistent test database

### AI Usage Guidelines
Document honestly:
- What AI tools were used (Claude Code / Claude API)
- What the AI generated (route structure, controller logic, test scaffolding)
- What was critically reviewed and changed (validation logic refinements, ownership checks, error message consistency, PATCH vs PUT distinction)
- What was left as-is and why

## Output Format
Updated `README.md` with two new sections: `## Technical Decisions` and `## AI Usage`.

## Examples and Steps to Follow
1. Add `## Technical Decisions` section with 3-4 decision blocks (format: Decision / Alternatives / Reason)
2. Add `## AI Usage` section documenting AI-assisted development and critical review
3. Confirm no existing content is removed
4. Commit: `docs: add technical decisions and AI usage sections to README`

## Output Checklist and Guardrails
- [ ] At least 3 decisions documented with Alternatives and Reason
- [ ] Reasons are specific to this project — no generic statements like "it's popular"
- [ ] AI Usage section present and honest
- [ ] No existing README content removed
- [ ] Decisions match what is actually implemented in the code
- [ ] Committed and pushed
