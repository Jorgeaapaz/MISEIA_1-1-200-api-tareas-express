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

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/tareas_db
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=24h
PORT=3000
```

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

## Updates — 2026-06-25

- Added `vid/` to `.gitignore` to exclude local video recordings from version control.
