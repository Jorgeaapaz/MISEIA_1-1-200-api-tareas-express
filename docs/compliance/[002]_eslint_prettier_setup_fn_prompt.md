@~/.claude/prompts/new_functionality_prompt_spec.md

# Configure ESLint and Prettier for the Project

## Role
Act as a Software Developer and Software Architect. You are an expert in JavaScript tooling, ESLint, and Prettier configuration for Node.js projects.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant item: `cq_linter_configurado` (Notable — Code Quality)  
Issue: No `.eslintrc` or `.prettierrc` exists at the project root. Only `node_modules` contain ESLint configs from dependencies. The project cannot enforce consistent code style or catch common errors automatically.

Tech stack: Node.js 20, CommonJS (`require`/`module.exports`), Jest for testing.

Note from `server.js` line 96: `// eslint-disable-next-line no-unused-vars` is already present, indicating the team is aware of ESLint conventions but has not formalized the config.

## Task
Add ESLint and Prettier configuration files to the project root, add lint/format scripts to `package.json`, and ensure all existing code passes linting without errors.

### ESLint + Prettier Guidelines
- Use ESLint flat config (`eslint.config.js`) for Node.js 20 compatibility, OR `.eslintrc.js` — pick what works cleanly with the existing CommonJS `require` style
- Base config: `eslint:recommended`
- Add `jest` environment for test files
- Set `env: { node: true, es2022: true }`
- Prettier config: `printWidth: 100`, `singleQuote: true`, `semi: true`, `trailingComma: 'es5'`
- Add to `package.json` scripts:
  - `"lint": "eslint src/ tests/"`
  - `"lint:fix": "eslint src/ tests/ --fix"`
  - `"format": "prettier --write src/ tests/"`
- Install as devDependencies: `eslint`, `prettier`, `eslint-config-prettier`
- Do NOT add TypeScript or React plugins — this is a plain Node.js project
- Exclude `node_modules/`, `coverage/`
- Fix any linting errors in existing source files (there should be few given the clean codebase)
- Verify `npm run lint` exits 0 before committing

## Output Format
- `.eslintrc.js` (or `eslint.config.js`) at project root
- `.prettierrc` at project root
- `.eslintignore` at project root (or `ignores` field in config)
- Updated `package.json` scripts section
- All existing source files pass `npm run lint`

## Examples and Steps to Follow
1. `npm install --save-dev eslint prettier eslint-config-prettier`
2. Create `.eslintrc.js` with `eslint:recommended` + prettier compat
3. Create `.prettierrc` with agreed style rules
4. Run `npm run lint` — fix any errors in `src/` and `tests/`
5. Run `npm test` — confirm tests still pass
6. Commit: `chore: add ESLint and Prettier configuration`

## Output Checklist and Guardrails
- [ ] `.eslintrc.js` or `eslint.config.js` exists at project root (not in node_modules)
- [ ] `.prettierrc` exists at project root
- [ ] `npm run lint` exits with code 0
- [ ] `npm test` still passes all 37 tests
- [ ] devDependencies added to `package.json` and `package-lock.json` updated
- [ ] No `node_modules/` files are linted
- [ ] Committed on a branch before merging
