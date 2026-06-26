# api-tareas-express

> Node.js 20 + Express 4 REST API for task management with JWT authentication, MongoDB persistence, Swagger UI, and rate limiting.

---

## Endpoints Implemented

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Validates credentials and returns a signed JWT (24 h by default) |

### Tasks (all require `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tasks` | Paginated list with filters (`status`, `priority`, `search`) and sorting |
| `POST` | `/api/tasks` | Create a new task owned by the authenticated user |
| `GET` | `/api/tasks/:id` | Fetch a single task (ownership enforced) |
| `PUT` | `/api/tasks/:id` | Full replacement of a task |
| `PATCH` | `/api/tasks/:id` | Partial update of one or more fields |
| `DELETE` | `/api/tasks/:id` | Delete a task (returns 204 No Content) |

**Task fields:** `title` (max 100), `description` (max 500), `status` (`pending` | `in_progress` | `completed`), `priority` (`low` | `medium` | `high`), `dueDate` (ISO 8601).

---

## Project Structure

```
api-tareas-express/
├── src/
│   ├── config/
│   │   └── db.js                  # Mongoose connection helper
│   ├── controllers/
│   │   ├── auth.controller.js     # Login logic, JWT signing
│   │   └── tasks.controller.js    # CRUD handlers + inline validation
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT verification, attaches req.user
│   ├── models/
│   │   ├── User.js                # Mongoose schema, bcrypt pre-save hook
│   │   └── Task.js                # Task schema with userId ref
│   ├── routes/
│   │   ├── auth.routes.js         # POST /api/auth/login + Swagger JSDoc
│   │   └── tasks.routes.js        # Full CRUD routes + Swagger JSDoc
│   ├── seed/
│   │   └── seed.js                # Seeds 2 users and 10 sample tasks
│   ├── server.js                  # Express app factory (CORS, rate-limit, Swagger, routes)
│   └── index.js                   # Entry point — connects DB then starts server
├── tests/
│   ├── setup.js                   # MongoMemoryServer lifecycle hooks
│   ├── helpers.js                 # Shared test utilities (register, login)
│   └── auth.test.js               # Integration tests for auth endpoint
├── .env                           # Environment variables (not committed)
├── package.json
└── .gitignore
```

---

## Design Patterns / Architecture

- **MVC (Model-View-Controller)** — `models/` hold Mongoose schemas, `controllers/` contain business logic, `routes/` wire HTTP verbs to controllers. Express responses act as the view layer.
- **Middleware chain** — `auth.middleware.js` implements a Guard pattern: all task routes call `router.use(authenticate)` before any handler runs.
- **Repository-lite via Mongoose** — all DB access goes through Mongoose model methods (`find`, `findById`, `create`, `save`, `deleteOne`), keeping controllers decoupled from raw MongoDB queries.
- **Factory / app separation** — `server.js` exports the configured Express `app` without starting it, enabling `supertest` to import the app in tests without binding a port.

## Architecture

```mermaid
flowchart LR
    Client -->|HTTPS| Traefik
    Traefik -->|HTTP :3000| RateLimit

    subgraph Express["Express App (server.js)"]
        RateLimit["Rate Limiter\n100 req / 15 min"]
        Router["Router"]
        AuthMW["auth.middleware\nJWT verify → req.user"]
        AuthCtrl["auth.controller\nlogin + JWT sign"]
        TasksCtrl["tasks.controller\nCRUD scoped to userId"]

        RateLimit --> Router
        Router -->|"POST /api/auth/login\n(public)"| AuthCtrl
        Router -->|"/api/tasks/*\n(protected)"| AuthMW --> TasksCtrl
    end

    AuthCtrl --> Mongoose
    TasksCtrl --> Mongoose
    Mongoose["Mongoose ODM\nUser · Task models"] --> MongoDB[(MongoDB)]

    Express -.-|"GET /api-docs"| SwaggerUI["Swagger UI"]
```

---

## How It Works

A client logs in via `POST /api/auth/login` and receives a JWT. Every subsequent request to `/api/tasks/*` must include that token in the `Authorization` header; the `authenticate` middleware verifies it and injects `req.user`. Controllers then scope all DB queries to `userId: req.user._id`, ensuring users can only see and modify their own tasks.

```js
// Authenticate and create a task
const { token } = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password123' })
}).then(r => r.json());

const task = await fetch('http://localhost:3000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title: 'Write tests', priority: 'high' })
}).then(r => r.json());
// → { data: { _id: '...', title: 'Write tests', status: 'pending', priority: 'high', ... } }
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** 6+ (local) or a MongoDB Atlas connection string

### Clone

```bash
# GitLab
git clone https://gitlab.codecrypto.academy/jorgeaapaz/1-1-200-api-tareas-express.git
cd 1-1-200-api-tareas-express

# GitHub mirror
# git clone https://github.com/Jorgeaapaz/MISEIA_1-1-200-api-tareas-express.git
```

### Environment variables

Copy the provided template and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Express server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/tareas_db` |
| `JWT_SECRET` | Secret for signing JWTs — use a long random string in production | `your_jwt_secret_here` |
| `JWT_EXPIRES_IN` | JWT expiration duration | `24h` |
| `NODE_ENV` | Runtime environment | `development` |

### Install & run

```bash
npm install

# Seed the database with sample data (2 users, 10 tasks)
npm run seed

# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The API is available at `http://localhost:3000`.  
Interactive Swagger UI: `http://localhost:3000/api-docs`.

### Tests

```bash
npm test              # run all tests
npm run test:coverage # with coverage report
```

Tests use `mongodb-memory-server` — no external MongoDB needed.

---

## Example Output

**Success — login:**
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password123"}'
```
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Success — list tasks (paginated):**
```bash
curl -s "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```
```json
{
  "data": [
    { "_id": "...", "title": "Call dentist", "status": "pending", "priority": "high", "userId": "..." }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 5, "pages": 1, "hasNext": false, "hasPrev": false }
}
```

**Failure — missing token:**
```bash
curl -s http://localhost:3000/api/tasks
```
```json
{ "error": "Unauthorized", "message": "No token provided" }
```

**Failure — validation error:**
```bash
curl -s -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"status":"unknown"}'
```
```json
{
  "error": "ValidationError",
  "message": "Request validation failed",
  "details": {
    "errors": [
      { "field": "title", "message": "title is required" },
      { "field": "status", "message": "status must be one of: pending, in_progress, completed" }
    ]
  }
}
```

## Deploy

The app is containerised and deployed to a GCP VM behind Traefik.  
**Public URL:** `https://api-tareas-express.deviaaps.com`

### Prerequisites
- Docker installed locally and on the VM
- SSH access: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- Traefik v3.3 running on the VM (`miseia-net` Docker network, wildcard cert `*.deviaaps.com`)

### 1. Build the image locally
```bash
docker build -t api-tareas-express:latest .
```

### 2. Transfer the image to the VM
```bash
docker save api-tareas-express:latest | ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186 "docker load"
```

### 3. Create `.env.prod` on the VM
```bash
ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186
mkdir -p ~/MISEIA200_api-tareas-express && cd ~/MISEIA200_api-tareas-express
cat > .env.prod <<'EOF'
PORT=3000
MONGODB_URI=mongodb://admin:MongoAdmin2024!@mongodb:27017/tareas_db?authSource=admin
JWT_SECRET=<your_production_secret>
JWT_EXPIRES_IN=24h
NODE_ENV=production
EOF
```

### 4. Start the service
```bash
# Copy docker-compose.prod.yml to the VM first
scp -i C:\ubuntuiso\.ssh\vboxuser docker-compose.prod.yml gcvmuser@34.174.56.186:~/MISEIA200_api-tareas-express/

# On the VM
cd ~/MISEIA200_api-tareas-express
docker compose -f docker-compose.prod.yml up -d
```

### 5. Verify
```bash
curl https://api-tareas-express.deviaaps.com/api/auth/login
# Expected: {"error":"ValidationError",...} — server is up
```

---

## Technical Decisions

### 1. MongoDB over a relational database
**Decision:** MongoDB 7 via Mongoose 8 ODM.  
**Alternatives considered:** PostgreSQL + Sequelize, SQLite.  
**Reason:** Task documents have a predictable shape with no cross-entity joins required — user scoping is handled by an embedded `userId` reference. MongoDB's schemaless flexibility let us iterate on the Task schema (adding `priority`, `dueDate`) during development without writing migration files. For a CRUD API with a single owning relationship, MongoDB is a better fit than a relational model with foreign key constraints and migration tooling overhead.

### 2. CommonJS (`require`) over ES Modules
**Decision:** CommonJS (`require`/`module.exports`) throughout the project.  
**Alternatives considered:** `import`/`export` with `"type": "module"` in `package.json`.  
**Reason:** Jest 29 requires the `--experimental-vm-modules` flag plus a Babel or esbuild transform pipeline to run ESM natively in Node 20. Keeping CommonJS eliminates that configuration entirely — `npm test` runs as-is with zero transform config. The trade-off is that the codebase will need migration once Jest fully stabilises ESM support (expected Jest 30).

### 3. Stateless JWT over server-side sessions
**Decision:** JWT signed with HS256, 24 h expiry, stored and sent by the client.  
**Alternatives considered:** `express-session` + Redis session store, Passport.js with persistent sessions.  
**Reason:** Stateless JWT requires no session store, keeping the server horizontally scalable without a shared Redis dependency. For a task management tool, the inability to invalidate a token before expiry (a known JWT limitation) is acceptable — the worst-case exposure window is 24 h, and there is no high-value action (e.g. payment, admin escalation) that would justify the operational cost of a session store.

### 4. `mongodb-memory-server` for integration tests over mocking
**Decision:** `mongodb-memory-server` starts a real MongoDB process in-memory for each test suite run.  
**Alternatives considered:** `jest.mock()` mocking Mongoose methods, Docker-based MongoDB service in CI, shared test database.  
**Reason:** The in-memory server runs real Mongoose queries, which means schema constraints, index behaviour, and `$set` / `$push` operators are exercised exactly as in production. Mocking Mongoose would silently pass tests that would fail on a real database (e.g. unique index violations). Docker adds a service dependency to CI; the in-memory server avoids that while adding only ~30 s to a cold test run.

---

## AI Usage

This project was developed with **Claude Code (claude-sonnet-4-6)** as a coding assistant.

**What AI generated:**
- Initial route and controller scaffolding (GET/POST/PUT/PATCH/DELETE structure)
- Mongoose schema definitions for `User` and `Task`
- Swagger JSDoc annotations for all endpoints
- Test scaffolding for `auth.test.js` and `tasks.test.js`

**What was critically reviewed and changed:**
- **Ownership enforcement** — the AI's initial draft applied `userId` scoping only to `GET /tasks`. All mutation endpoints (PUT, PATCH, DELETE) and `GET /tasks/:id` were manually verified to return `403` when a different user's token is used, and test cases 22, 26, 31, 36 were added specifically to cover this.
- **PATCH vs PUT semantics** — the draft treated both identically. The PATCH handler was reworked to use `{ $set: body }` so only provided fields are updated, preserving unmentioned fields. Test case 29 validates this.
- **Validation on PATCH** — the draft skipped validation when the body was partial. The controller was updated to validate only the fields present in the request body, rejecting invalid enum values even in partial updates (test 30).
- **Error shape consistency** — the draft returned different error structures across endpoints. All error responses were normalised to `{ error, message, details }` with explicit status codes.

---

## Updates — 2026-06-25

- Added `vid/` to `.gitignore` to exclude local video recordings from version control.
- Added evaluation artifacts to `docs/compliance/`:
  - `compliance-report-2026-06-25.md` — full pass/fail assessment against evaluation rubric
  - `pert-compliance-plan-2026-06-25.md` — dependency-ordered remediation plan
  - `[001]`–`[009]` disciplined prompt files for each non-compliant item
