@~/.claude/prompts/new_functionality_prompt_spec.md

# Dockerize App and Add Deploy Instructions to README

## Role
Act as a Software Architect and IT Infrastructure Engineer. You are an expert in Docker, Docker Compose, Traefik, and Node.js production deployments.

## Context
Project: `1-1-200-api-tareas-express` — Express.js + MongoDB task management REST API.  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-200-api-tareas-express`  
Non-compliant items: `fn_deploy_publico_accesible` (Excepcional — Functionality) and `dc_instrucciones_deploy` (Excepcional — Documentation)  
Issues:  
1. No `Dockerfile` exists — app cannot be containerized or deployed to the GCP VM.  
2. README has no deploy section — evaluators cannot verify there is a production path.

**Target VM infrastructure (already running):**
- VM IP: `34.174.56.186`
- SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- Traefik v3.3 on `miseia-net` Docker network (bridge), wildcard cert `*.deviaaps.com`
- MongoDB container name: `mongodb`, on `miseia-net`, port `27017` internal
- MongoDB credentials from `.env`: `admin` / `MongoAdmin2024!`

**App deployment target:**
- Deploy directory: `~/MISEIA200_api-tareas-express`
- Docker container name: `api-tareas-express`
- Internal port: `3000`
- External domain: `api-tareas-express.deviaaps.com` (port 30001 on Traefik websecure)
- Docker network: `miseia-net` (must join existing network — do NOT recreate it)

## Task
Create a `Dockerfile`, a `docker-compose.prod.yml`, and add a `## Deploy` section to `README.md` with step-by-step instructions for deploying the app to the GCP VM.

### Dockerfile Guidelines
- Base image: `node:20-alpine`
- Multi-stage build: `builder` (install all deps) → `production` (copy only production deps + src)
- In production stage: `npm ci --only=production`
- Run as non-root user (`node`)
- `EXPOSE 3000`
- `CMD ["node", "src/index.js"]`
- Do NOT copy `.env` into the image — environment variables are injected at runtime
- Add `.dockerignore`: exclude `node_modules/`, `coverage/`, `.env`, `tests/`, `vid/`, `docs/`

### docker-compose.prod.yml Guidelines
- Service name: `api-tareas-express`
- Container name: `api-tareas-express`
- Image: `api-tareas-express:latest` (built locally before deploy)
- `restart: unless-stopped`
- Environment variables injected via `env_file: .env.prod` (a `.env.prod` file on the VM, never committed)
- Join `miseia-net` network as an **external** network (`external: true`)
- Traefik labels:
  ```yaml
  - "traefik.enable=true"
  - "traefik.http.routers.api-tareas.rule=Host(`api-tareas-express.deviaaps.com`)"
  - "traefik.http.routers.api-tareas.entrypoints=websecure"
  - "traefik.http.routers.api-tareas.tls=true"
  - "traefik.http.routers.api-tareas.tls.certresolver=cloudflare"
  - "traefik.http.services.api-tareas-svc.loadbalancer.server.port=3000"
  ```
- Do NOT expose any ports directly — Traefik handles ingress

### README Deploy Section
Add `## Deploy` section to README with:
1. Prerequisites (Docker installed on VM, VM SSH access, Traefik running)
2. Build image locally: `docker build -t api-tareas-express:latest .`
3. Save and transfer: `docker save api-tareas-express:latest | ssh gcvmuser@34.174.56.186 "docker load"`
4. SSH into VM and create `.env.prod` with production values
5. Start the service: `docker compose -f docker-compose.prod.yml up -d`
6. Verify: `curl https://api-tareas-express.deviaaps.com/api/auth/login`
7. Public URL: `https://api-tareas-express.deviaaps.com`

## Output Format
- `Dockerfile` at project root
- `.dockerignore` at project root
- `docker-compose.prod.yml` at project root
- Updated `README.md` with `## Deploy` section

## Examples and Steps to Follow
1. Create `Dockerfile` with multi-stage build
2. Create `.dockerignore`
3. Build locally: `docker build -t api-tareas-express:latest .`
4. Test locally: `docker run --rm -p 3000:3000 --env-file .env api-tareas-express:latest`
5. Confirm `curl http://localhost:3000/api/auth/login` returns JSON
6. Create `docker-compose.prod.yml`
7. Add `## Deploy` section to README
8. Commit: `feat: add Dockerfile and docker-compose.prod.yml for production deploy`

## Output Checklist and Guardrails
- [ ] `Dockerfile` uses multi-stage build, non-root user, `node:20-alpine`
- [ ] `.dockerignore` excludes `node_modules/`, `.env`, `tests/`, `vid/`, `coverage/`
- [ ] `docker build` succeeds locally
- [ ] `docker run` with `--env-file .env` starts the app on port 3000
- [ ] `docker-compose.prod.yml` joins `miseia-net` as external network
- [ ] Traefik labels use `api-tareas-express.deviaaps.com`
- [ ] No direct port mappings in `docker-compose.prod.yml`
- [ ] README `## Deploy` section has step-by-step instructions and the public URL
- [ ] `.env.prod` is NOT committed (add to `.gitignore`)
- [ ] `npm test` still passes locally after all changes
