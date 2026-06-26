@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example Template File

## Role
Act as a Software Developer. You are an expert in Node.js project configuration and security best practices.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant item: `dc_env_example` (Base — Documentation)  
Issue: The project has a `.env` file (gitignored) but no `.env.example` template. New contributors have no reference for required environment variables.

Current `.env` variables used by the application (from `src/index.js`, `src/config/db.js`, `src/server.js`, `src/controllers/auth.controller.js`):
- `PORT` — Express server port
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRES_IN` — JWT expiration duration
- `NODE_ENV` — Node environment (test/development/production)

## Task
Create a `.env.example` file at the project root with all required environment variables listed with placeholder (non-real) values and a comment for each variable explaining what it does.

### .env.example Guidelines
- List every environment variable the app reads
- Use placeholder values, never real secrets
- Include a one-line comment above each variable explaining its purpose
- Match the exact variable names used in the application code
- Add a header comment explaining how to use the file
- Commit the file to git (it is safe — no real values)
- Update `README.md` to reference `.env.example` in the "Getting Started" section

## Output Format
A `.env.example` file at project root and an updated README.md "Getting Started / Environment variables" section referencing it.

## Examples and Steps to Follow
1. Create `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express\.env.example`
2. Copy real variable names from `.env` + from `process.env.*` references in source code
3. Replace all real values with safe placeholders: `your_jwt_secret_here`, `your_mongodb_uri_here`
4. Add comments: `# Port the Express server listens on`
5. Update README Getting Started section: "Copy `.env.example` to `.env` and fill in your values"
6. Run `npm test` to confirm nothing is broken
7. Commit on the current branch: `docs: add .env.example template`

## Output Checklist and Guardrails
- [ ] File is named exactly `.env.example`
- [ ] No real secrets or passwords in the file
- [ ] All variables used by `process.env.*` in `src/` are represented
- [ ] README references `.env.example`
- [ ] Tests still pass after the change
- [ ] File is committed to git
