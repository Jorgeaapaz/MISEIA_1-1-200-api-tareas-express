# PERT Compliance Plan — api-tareas-express
**Date:** 2026-06-25  
**Project:** 1-1-200-api-tareas-express  
**Based on:** `compliance-report-2026-06-25.md`

---

## PERT Compliance Plan

The following is a dependency-ordered graph of remediation tasks. Tasks with no dependencies can start in parallel. Tasks that depend on others must wait for their predecessors to complete.

```
[001] .env.example ──────────────────────────────────────────► [Done]
                                                                  │
[002] ESLint + Prettier ──────────────────────────┐               │
                                                  ▼               │
                                            [004] GitLab CI ──► [Done]
                                            [005] GitHub Actions (depends on [002]+[008])
                                                  │
[003] Coverage badge ── (depends on [002]) ───────┤
                                                  │
[006] Architecture Diagram ──────────────────────►│
                                                  │
[007] Trade-offs / Decisions ────────────────────►│
                                                  │
[008] Dockerfile + Docker Compose ───────────────►│──► [005] GitHub Actions ──► [Done]
                                                  │
[009] ADRs ──────────────────────────────────────►[Done]
```

### Dependency Map

| Task | Depends On | Blocks |
|---|---|---|
| [001] `.env.example` | — | — |
| [002] ESLint + Prettier | — | [003], [004], [005] |
| [003] Coverage badge in README | [002] | — |
| [004] GitLab CI (test + lint) | [002] | — |
| [005] GitHub Actions + VM deploy | [002], [008] | — |
| [006] Architecture diagram | — | — |
| [007] Trade-offs / decisions | — | — |
| [008] Dockerfile + public deploy | — | [005] |
| [009] ADRs | [007] | — |

---

## Proper Execution of Tasks

The following numbered list reflects the correct PERT execution order — GitHub CI/CD task is favored over GitLab when both exist for the same requirement.

1. **[001] Create `.env.example`** — No dependencies; immediate win for Base documentation score.  
   Prompt: `docs/compliance/[001]_env_example_file_fn_prompt.md`

2. **[002] Configure ESLint + Prettier** — No dependencies; enables tasks [003], [004], [005].  
   Prompt: `docs/compliance/[002]_eslint_prettier_setup_fn_prompt.md`

3. **[006] Add architecture diagram to README** — No dependencies; standalone documentation task.  
   Prompt: `docs/compliance/[006]_architecture_diagram_readme_fn_prompt.md`

4. **[007] Document trade-offs and decisions in README** — No dependencies; standalone documentation task.  
   Prompt: `docs/compliance/[007]_tradeoffs_decisions_readme_fn_prompt.md`

5. **[008] Dockerize app and add deploy instructions** — No dependencies; required before GitHub Actions deploy.  
   Prompt: `docs/compliance/[008]_docker_deploy_public_fn_prompt.md`

6. **[003] Add coverage badge to README** — Depends on [002] (linter must pass in CI before badge is meaningful).  
   Prompt: `docs/compliance/[003]_coverage_badge_readme_fn_prompt.md`

7. **[004] Upgrade GitLab CI pipeline (test + lint stages)** — Depends on [002].  
   Prompt: `docs/compliance/[004]_gitlab_ci_test_lint_fn_prompt.md`

8. **[005] Create GitHub Actions CI/CD + VM deploy** — Depends on [002] (linter) and [008] (Dockerfile).  
   Prompt: `docs/compliance/[005]_github_actions_deploy_fn_prompt.md`

9. **[009] Create ADRs (Architecture Decision Records)** — Depends on [007] (decisions must be written first).  
   Prompt: `docs/compliance/[009]_adrs_decision_log_fn_prompt.md`

---

## Expected Score After Full Remediation

| Category | Before | After |
|---|---|---|
| Funcionalidad | ~8/9 items | 9/9 items (public deploy added) |
| Calidad | ~7/9 items | 9/9 items (linter + CI + coverage) |
| Documentación | ~3/10 items | 10/10 items |
