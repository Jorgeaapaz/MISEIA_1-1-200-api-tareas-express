@~/.claude/prompts/new_functionality_prompt_spec.md

# Upgrade GitLab CI Pipeline — Add Test and Lint Stages

## Role
Act as a Software Architect and IT Infrastructure Engineer. You are an expert in GitLab CI/CD pipelines for Node.js applications.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
GitLab repo: `https://gitlab.codecrypto.academy/jorgeaapaz/1-1-200-api-tareas-express`  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant item: `cq_ci_funcional` (Excepcional — Code Quality)  
Issue: Current `.gitlab-ci.yml` only has a `build` stage that runs `npm ci`. There are no `test` or `lint` stages, so code quality is not verified on push.

Prerequisite: Task [002] (ESLint + Prettier) must be completed first. The `npm run lint` and `npm test` scripts must exist and pass locally before adding them to CI.

Use `/glab` for all GitLab operations.

## Task
Rewrite `.gitlab-ci.yml` to include three stages: `build`, `lint`, and `test`. The pipeline must pass on the `main` branch before merging any feature branch.

### GitLab CI Guidelines
- Stages order: `build` → `lint` → `test`
- Use `node:20-alpine` image for all jobs
- **Build job**: `npm ci`, cache `node_modules/` keyed on `package-lock.json` hash (existing behavior, keep it)
- **Lint job**: runs after build; uses cached `node_modules/`; runs `npm run lint`; fails the pipeline on lint errors
- **Test job**: runs after lint; uses cached `node_modules/`; runs `npm test`; uploads `coverage/` as artifact (expire in 7 days); sets `NODE_ENV=test` **only** on the test job's `variables` block, not at the global pipeline level
- `NODE_ENV=production` must **only** appear on an `npm run build` command if one exists — it must NOT be set as a job-level or global variable for test/lint jobs
- Do NOT add deployment steps
- Keep artifacts lean: only `coverage/` for the test job, only `node_modules/` for the build job

## Output Format
Updated `.gitlab-ci.yml` file at project root.

## Examples and Steps to Follow

```yaml
stages:
  - build
  - lint
  - test

.node_cache: &node_cache
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour
  <<: *node_cache

lint:
  stage: lint
  image: node:20-alpine
  needs: [build]
  script:
    - npm run lint
  <<: *node_cache

test:
  stage: test
  image: node:20-alpine
  needs: [lint]
  variables:
    NODE_ENV: test
  script:
    - npm test
  artifacts:
    paths:
      - coverage/
    expire_in: 7 days
  <<: *node_cache
```

1. Replace the existing `.gitlab-ci.yml` with the updated pipeline above
2. Push to a feature branch: `git push -u origin feature/gitlab-ci-test-lint`
3. Use `glab ci view` to monitor pipeline execution
4. Confirm all three stages pass (green) in the GitLab UI
5. Create MR and merge into `main`

## Output Checklist and Guardrails
- [ ] Three stages: build → lint → test
- [ ] `NODE_ENV=production` is NOT set at pipeline level or in lint/test jobs
- [ ] `NODE_ENV=test` is set only in the test job's `variables` block
- [ ] Pipeline passes on `main` branch (all three stages green)
- [ ] `coverage/` artifact uploaded by the test job
- [ ] No deployment steps added
- [ ] `/glab` used for all GitLab operations
