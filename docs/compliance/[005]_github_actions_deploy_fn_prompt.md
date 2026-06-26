@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a GitHub CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in GitHub and Google Cloud Services.

## Task
Create GitHub Actions that allow compiling and deploying the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory `~/MISEIA200_api-tareas-express`. Test and build must be done in GitHub Actions. The service must be created in the remote Ubuntu VM in Docker.

The app must be accessible through Traefik using the domain `api-tareas-express.deviaaps.com`, port `30001`, using the Traefik wildcard `*.deviaaps.com`.

Use `/gh` and `gcloud` for all secrets required.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
GitHub repo: `https://github.com/Jorgeaapaz/MISEIA_1-1-200-api-tareas-express`  
Non-compliant items resolved: `cq_ci_funcional`, `fn_deploy_publico_accesible`

**Prerequisites (must be done first):**
- Task [002]: ESLint + Prettier configured (`npm run lint` works)
- Task [008]: `Dockerfile` and `docker-compose.prod.yml` created for the app

**VM infrastructure (already running):**
- SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- Traefik v3.3 running on `miseia-net` Docker network
- Wildcard cert `*.deviaaps.com` via Cloudflare DNS-01
- MongoDB available at `mongodb:27017` on `miseia-net` (container name: `mongodb`)
- Network name: `miseia-net`

**App configuration:**
- App container name: `api-tareas-express`
- Deploy directory on VM: `~/MISEIA200_api-tareas-express`
- Internal Docker port: `3000`
- Traefik exposed domain: `api-tareas-express.deviaaps.com`
- Traefik entrypoint port: `30001` (mapped to the `websecure` entrypoint)

### GitHub Actions Guidelines
**CI workflow** (`.github/workflows/ci.yml`) — triggers on every push and PR to `main`:
1. `checkout`
2. `setup-node` with Node 20
3. `npm ci`
4. `npm run lint`
5. `npm test`
6. Upload coverage artifact

**CD workflow** (`.github/workflows/deploy.yml`) — triggers only on push to `main` after CI passes:
1. Build Docker image tagged as `api-tareas-express:latest`
2. Save image as tarball (`docker save`)
3. SCP tarball to the VM
4. SSH into VM and: load image → `docker compose -f docker-compose.prod.yml up -d --force-recreate`
5. Verify container is running (`docker ps | grep api-tareas-express`)

**Required GitHub Secrets** (set via `gh secret set`):
- `VM_HOST`: `34.174.56.186`
- `VM_USER`: `gcvmuser`
- `VM_SSH_KEY`: contents of `C:\ubuntuiso\.ssh\vboxuser`
- `MONGODB_URI`: connection string to MongoDB on VM (`mongodb://admin:<pass>@mongodb:27017/tareas_db?authSource=admin`)
- `JWT_SECRET`: production JWT secret

**Traefik labels for the app container** (in `docker-compose.prod.yml`):
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.api-tareas.rule=Host(`api-tareas-express.deviaaps.com`)"
  - "traefik.http.routers.api-tareas.entrypoints=websecure"
  - "traefik.http.routers.api-tareas.tls=true"
  - "traefik.http.routers.api-tareas.tls.certresolver=cloudflare"
  - "traefik.http.services.api-tareas-svc.loadbalancer.server.port=3000"
networks:
  - miseia-net
```

## Output Format
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `docker-compose.prod.yml` (if not already created by task [008])
- GitHub Secrets configured via `gh secret set`

## Examples and Steps to Follow
1. Use `gh secret set VM_SSH_KEY < C:\ubuntuiso\.ssh\vboxuser` to store SSH key
2. Use `gh secret set VM_HOST --body "34.174.56.186"` etc. for other secrets
3. Create `.github/workflows/ci.yml` with lint + test stages
4. Create `.github/workflows/deploy.yml` triggered by successful CI on `main`
5. Push a feature branch and verify CI passes in GitHub Actions tab
6. Merge to `main` and verify deploy workflow runs and container starts on VM
7. Test: `curl https://api-tareas-express.deviaaps.com/api/tasks` (expect 401 — server is up)
8. Update README with the public URL

## Output Checklist and Guardrails
- [ ] CI workflow: lint + test pass on every push
- [ ] Deploy workflow only runs on `main` after CI passes
- [ ] `NODE_ENV=production` is set only in the deploy step / container env, not in test steps
- [ ] All secrets are stored via `gh secret set`, never hardcoded in YAML
- [ ] App container joins `miseia-net` network
- [ ] Traefik labels use `api-tareas-express.deviaaps.com` domain
- [ ] `curl https://api-tareas-express.deviaaps.com/api/auth/login` returns a JSON response
- [ ] README updated with the public URL
