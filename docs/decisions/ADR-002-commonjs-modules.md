# ADR-002: CommonJS Modules over ES Modules

**Status:** Accepted  
**Date:** 2026-05-22

## Context

Node.js 20 supports ES Modules natively, but Jest 29 requires the `--experimental-vm-modules` flag plus a transpile pipeline (Babel or esbuild) to execute ESM test files. The project prioritises a zero-config test runner so that `npm test` works without additional tooling.

## Decision

Use **CommonJS** (`require` / `module.exports`) throughout — in `src/`, `tests/`, and all config files.

## Alternatives Considered

- **ESM (`import`/`export`) with `"type": "module"`**: The modern standard. Rejected because Jest 29 ESM support is marked experimental and requires `NODE_OPTIONS=--experimental-vm-modules` and either a Babel transform or a custom Jest resolver. This adds complexity with no functional benefit for a backend API.
- **Hybrid (ESM in src/, CJS in tests/)**: Possible but increases cognitive load and requires explicit `.cjs` / `.mjs` extensions or per-folder package.json settings. Rejected for simplicity.

## Consequences

**Positive:**
- `npm test` runs with zero extra flags or transforms.
- All Express ecosystem examples and middleware are documented in CommonJS — no adaptation needed.

**Negative:**
- The codebase will need an ESM migration when Jest fully stabilises ESM support (anticipated Jest 30 / 2026).
- Static analysis tools that prefer ESM (e.g. tree-shaking in bundlers) cannot operate on these files — not a concern for a server-side API.
