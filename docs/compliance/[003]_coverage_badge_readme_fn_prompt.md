@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Test Coverage Badge and Report to README

## Role
Act as a Software Developer. You are an expert in Jest coverage reporting and GitHub/GitLab CI badge integration.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant item: `cq_cobertura_alta` (Excepcional — Code Quality)  
Issue: `jest.config.js` already enforces 80% coverage threshold, but the README has no coverage badge and no coverage report is visible to reviewers.

Current `jest.config.js` coverage threshold: 80% lines/branches/functions/statements.  
Prerequisite: Task [002] (ESLint) must be completed first so the CI pipeline can run both checks.

## Task
Generate a coverage report, add a coverage badge to the README, and configure the CI pipeline to publish the coverage artifact so the badge URL stays current.

### Coverage Badge Guidelines
- Run `npm run test:coverage` locally to generate the report in `coverage/`
- Add `coverage/` to `.gitignore` (do not commit generated reports)
- For the badge: use a static Shields.io badge referencing the threshold: `![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen)` — or configure GitLab Pages / GitHub Actions to publish dynamic coverage from the CI artifact
- Add the badge to the README header section, next to the project title
- Add a "Test Coverage" subsection to the README's "Tests" section explaining: threshold is 80%, run `npm run test:coverage` to generate the `coverage/lcov-report/index.html` report locally
- Update `jest.config.js` to also output `lcov` and `text` reporters: `coverageReporters: ['text', 'lcov', 'html']`

## Output Format
- Updated `README.md` with coverage badge and coverage subsection
- Updated `jest.config.js` with `coverageReporters` array
- `coverage/` added to `.gitignore` if not already present

## Examples and Steps to Follow
1. Run `npm run test:coverage` and confirm it passes the 80% threshold
2. Update `jest.config.js`: add `coverageReporters: ['text', 'lcov', 'html']`
3. Add `coverage/` to `.gitignore`
4. Add Shields.io badge to README header: `![Coverage](https://img.shields.io/badge/coverage-%3E80%25-brightgreen)`
5. Add coverage instructions in README Tests section
6. Run tests again to confirm nothing broke
7. Commit: `docs: add coverage badge and coverage reporter config`

## Output Checklist and Guardrails
- [ ] `npm run test:coverage` passes with 80%+ threshold
- [ ] Badge appears in README header
- [ ] `coverage/` is in `.gitignore`
- [ ] `jest.config.js` includes `coverageReporters`
- [ ] README Tests section explains how to generate the local HTML report
- [ ] All 37 tests still pass
