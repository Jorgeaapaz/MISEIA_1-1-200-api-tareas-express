# Compliance Report — api-tareas-express
**Date:** 2026-06-25  
**Student:** jorgeaapaz@hotmail.com  
**Project:** 1-1-200-api-tareas-express  
**Evaluator:** Claude Sonnet 4.6 (automated assessment)

---

## Summary Scores

| Category | Max | Achieved | Gap |
|---|---|---|---|
| Funcionalidad y cumplimiento del enunciado | 9/10 | ~8/9 ✅ | 1 item |
| Calidad de código y arquitectura | 7/10 | ~5/7 ⚠️ | 2 items |
| Documentación y decisiones | 5/10 | ~3/10 ❌ | 5 items |

---

## 1. Funcionalidad y cumplimiento del enunciado

### Base (4/4) ✅
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `fn_se_instala` | `npm install` works, documented in README | ✅ PASS | `package.json` + README Getting Started |
| `fn_arranca_local` | `npm start` / `npm run dev`, port 3000 documented | ✅ PASS | README + `src/index.js` |
| `fn_flujo_principal_funciona` | Full CRUD + auth end-to-end | ✅ PASS | 6 task endpoints + JWT auth implemented |
| `fn_persistencia_efectiva` | MongoDB via Mongoose, data survives restarts | ✅ PASS | `src/config/db.js` + `src/models/` |

### Notable (3/3) ✅
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `fn_validaciones_de_entrada` | Inputs validated, 422 on failure | ✅ PASS | `tasks.controller.js` + auth controller; field-level 422 errors |
| `fn_manejo_errores_consistente` | `{ error, message, details }` shape; no silent 500s | ✅ PASS | Global error handler in `server.js`; consistent shape across all endpoints |
| `fn_funciones_completas_del_enunciado` | All CRUD + auth + pagination + filters implemented | ✅ PASS | GET/POST/GET:id/PUT/PATCH/DELETE + status/priority/search/sort filters |

### Excepcional (1/2 applicable)
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `fn_features_extra_pertinentes` | Pagination, text search, sort, rate limiting, Swagger UI | ✅ PASS | Implemented in `tasks.controller.js` and `server.js` |
| `fn_estados_intermedios_ui` | UI load/error/empty states | ⏭️ N/A | API-only project — no frontend |
| `fn_deploy_publico_accesible` | Public URL in README | ❌ FAIL | No public deploy; README mentions GitLab/GitHub clones only |

---

## 2. Calidad de código y arquitectura

### Base (4/4) ✅
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `cq_estructura_carpetas_clara` | `src/`, `tests/`, `routes/`, `models/`, `controllers/` | ✅ PASS | Clear MVC layout; no monolith file |
| `cq_nombres_descriptivos` | Descriptive filenames and functions | ✅ PASS | `auth.controller.js`, `tasks.controller.js`, etc. |
| `cq_separacion_responsabilidades` | Controllers ≠ models ≠ middleware ≠ routes | ✅ PASS | Guards in `auth.middleware.js`, logic in controllers, schemas in models |
| `cq_dependencias_lockeadas` | `package-lock.json` committed | ✅ PASS | `package-lock.json` present in repo |

### Notable (2/3) ⚠️
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `cq_tests_minimos` | Automated tests covering critical flows | ✅ PASS | 37 tests (auth.test.js × 6, tasks.test.js × 31); `npm test` documented |
| `cq_linter_configurado` | ESLint/Prettier config committed at project root | ❌ FAIL | No `.eslintrc` or `.prettierrc` at root; only node_modules contain them |
| `cq_sin_secretos_en_repo` | No credentials in git history | ✅ PASS | `.env*` in `.gitignore`; `git log -p` shows no `.env` ever committed |

### Excepcional (1/3) ⚠️
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `cq_arquitectura_razonada` | Layered MVC with correct dependency direction | ✅ PASS | Factory pattern in `server.js`; guard middleware chain; repository-lite via Mongoose |
| `cq_cobertura_alta` | >60% domain coverage; badge or report in README | ❌ FAIL | Coverage threshold configured in `jest.config.js` (80%) but no badge or report in README |
| `cq_ci_funcional` | CI runs tests + linter on each push; last build green | ❌ FAIL | `.gitlab-ci.yml` only runs `npm ci` (build stage); no test or lint stages; no GitHub Actions |

---

## 3. Documentación y decisiones

### Base (3/4) ⚠️
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `dc_readme_presente` | README with what/install/run/endpoints | ✅ PASS | Full README with endpoints table, getting started, examples |
| `dc_env_example` | `.env.example` with all required variables, no real values | ❌ FAIL | Only `.env` (gitignored) — no `.env.example` template |
| `dc_comandos_verificacion` | Exact commands to verify work | ✅ PASS | `npm test`, `npm run test:coverage`, `npm run dev` documented |
| `dc_seccion_uso` | Real request/response examples | ✅ PASS | curl examples with full JSON responses in README |

### Notable (0/3) ❌
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `dc_diagrama_arquitectura` | Architecture diagram (ASCII, mermaid, draw.io) | ❌ FAIL | README has text description only; no visual diagram |
| `dc_decisiones_documentadas` | ≥2 real trade-offs with reasoning | ❌ FAIL | "Design Patterns" section describes what was used, not why over alternatives |
| `dc_cambios_ia_documentados` | Documents what changed from AI-generated draft | ❌ FAIL | AGENTS.md and PROMPT.md present; README has no AI usage review section |

### Excepcional (0/3) ❌
| ID | Requirement | Status | Evidence |
|---|---|---|---|
| `dc_adrs_o_decision_log` | ADRs with context/decision/consequences | ❌ FAIL | No `docs/` or ADR files |
| `dc_justificacion_cuantitativa` | ≥1 decision justified with numbers | ❌ FAIL | No benchmarks, latency measurements, or cost comparisons |
| `dc_instrucciones_deploy` | Deploy section with Dockerfile + cloud steps | ❌ FAIL | No Dockerfile; no deploy instructions in README |

---

## Non-Compliant Items — Action Required

| # | ID | Category | Priority | Prompt File |
|---|---|---|---|---|
| 1 | `dc_env_example` | Docs — Base | 🔴 High | `[001]_env_example_file_fn_prompt.md` |
| 2 | `cq_linter_configurado` | Quality — Notable | 🔴 High | `[002]_eslint_prettier_setup_fn_prompt.md` |
| 3 | `cq_cobertura_alta` | Quality — Excepcional | 🟡 Medium | `[003]_coverage_badge_readme_fn_prompt.md` |
| 4 | `cq_ci_funcional` (GitLab) | Quality — Excepcional | 🟡 Medium | `[004]_gitlab_ci_test_lint_fn_prompt.md` |
| 5 | `cq_ci_funcional` (GitHub) | Quality — Excepcional | 🟡 Medium | `[005]_github_actions_deploy_fn_prompt.md` |
| 6 | `dc_diagrama_arquitectura` | Docs — Notable | 🟡 Medium | `[006]_architecture_diagram_readme_fn_prompt.md` |
| 7 | `dc_decisiones_documentadas` | Docs — Notable | 🟡 Medium | `[007]_tradeoffs_decisions_readme_fn_prompt.md` |
| 8 | `fn_deploy_publico_accesible` + `dc_instrucciones_deploy` | Funcionalidad + Docs | 🟡 Medium | `[008]_docker_deploy_public_fn_prompt.md` |
| 9 | `dc_adrs_o_decision_log` | Docs — Excepcional | 🟢 Low | `[009]_adrs_decision_log_fn_prompt.md` |

All prompt files are located at: `docs/compliance/`
