# AGENTS.md — Task Management API Specification

## Project Overview

REST API for task management built with **Express.js** and **MongoDB**. Supports JWT authentication, CORS, rate limiting, Swagger UI, and database seeding.

---

## Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Runtime        | Node.js                 |
| Framework      | Express.js              |
| Database       | MongoDB (local)         |
| ODM            | Mongoose                |
| Auth           | JWT (jsonwebtoken)      |
| Docs           | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Testing        | Jest + Supertest + mongodb-memory-server |
| Rate Limiting  | express-rate-limit      |
| CORS           | cors                    |

---

## Project Structure

```
/
├── src/
│   ├── server.js           # Express app setup (CORS, rate limit, routes, Swagger)
│   ├── index.js            # Entry point (connects MongoDB, starts server)
│   ├── config/
│   │   └── db.js           # Mongoose connection
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── Task.js         # Task schema
│   ├── routes/
│   │   ├── auth.routes.js  # POST /api/auth/login
│   │   └── tasks.routes.js # CRUD /api/tasks
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── tasks.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT verification
│   └── seed/
│       └── seed.js         # Database seeding script
├── tests/
│   ├── setup.js            # Global Jest setup (in-memory MongoDB)
│   ├── helpers.js          # Shared helpers (createUser, getToken, createTask)
│   ├── auth.test.js        # Auth endpoint tests
│   └── tasks.test.js       # Tasks CRUD tests
├── jest.config.js          # Jest configuration with coverage thresholds
├── package.json
└── .env
```

---

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tareas_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

---

## Data Models

### User

```json
{
  "_id": "ObjectId",
  "username": "string (unique, required)",
  "password": "string (bcrypt hashed, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Task

```json
{
  "_id": "ObjectId",
  "title": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "status": "enum: ['pending', 'in_progress', 'completed']",
  "priority": "enum: ['low', 'medium', 'high']",
  "dueDate": "Date (optional)",
  "userId": "ObjectId (ref: User, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## API Base URL

```
http://localhost:3000/api
```

Swagger UI available at:
```
http://localhost:3000/api-docs
```

---

## Authentication

The API uses **Bearer Token (JWT)** authentication.

### Obtain Token

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Response `401 Unauthorized`:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid username or password"
}
```

### Using the Token

Include in every protected request:
```
Authorization: Bearer <token>
```

**Response `401 Unauthorized` (missing/invalid token):**
```json
{
  "error": "Unauthorized",
  "message": "No token provided" | "Invalid or expired token"
}
```

---

## Endpoints

### Auth

| Method | Path             | Auth | Description        |
|--------|------------------|------|--------------------|
| POST   | /api/auth/login  | No   | Obtain JWT token   |

### Tasks

| Method | Path              | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | /api/tasks        | Yes  | List tasks (paginated)   |
| POST   | /api/tasks        | Yes  | Create a task            |
| GET    | /api/tasks/:id    | Yes  | Get a task by ID         |
| PUT    | /api/tasks/:id    | Yes  | Replace a task           |
| PATCH  | /api/tasks/:id    | Yes  | Update task fields       |
| DELETE | /api/tasks/:id    | Yes  | Delete a task            |

---

## Endpoint Details

### GET /api/tasks

Returns paginated list of tasks belonging to the authenticated user.

**Query Parameters:**

| Parameter  | Type    | Default | Description                              |
|------------|---------|---------|------------------------------------------|
| page       | integer | 1       | Page number (min: 1)                     |
| limit      | integer | 10      | Items per page (min: 1, max: 100)        |
| status     | string  | -       | Filter by status: `pending`, `in_progress`, `completed` |
| priority   | string  | -       | Filter by priority: `low`, `medium`, `high` |
| search     | string  | -       | Full-text search on title and description |
| sortBy     | string  | `createdAt` | Sort field: `createdAt`, `dueDate`, `priority` |
| sortOrder  | string  | `desc`  | Sort direction: `asc`, `desc`            |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2026-04-15T00:00:00.000Z",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d0",
      "createdAt": "2026-04-09T10:00:00.000Z",
      "updatedAt": "2026-04-09T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### POST /api/tasks

Creates a new task for the authenticated user.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "pending | in_progress | completed (default: pending)",
  "priority": "low | medium | high (default: medium)",
  "dueDate": "ISO 8601 date string (optional)"
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "priority": "medium",
    "dueDate": "2026-04-15T00:00:00.000Z",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d0",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T10:00:00.000Z"
  }
}
```

---

### GET /api/tasks/:id

Returns a single task by ID. Only accessible if the task belongs to the authenticated user.

**Response `200 OK`:**
```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "priority": "medium",
    "dueDate": "2026-04-15T00:00:00.000Z",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d0",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T10:00:00.000Z"
  }
}
```

**Response `404 Not Found`:**
```json
{
  "error": "NotFound",
  "message": "Task not found"
}
```

---

### PUT /api/tasks/:id

Replaces the entire task. All required fields must be provided.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "pending | in_progress | completed (required)",
  "priority": "low | medium | high (required)",
  "dueDate": "ISO 8601 date string (optional)"
}
```

**Response `200 OK`:** Returns the updated task (same shape as GET).

---

### PATCH /api/tasks/:id

Partial update. Only include fields to change.

**Request Body (all fields optional):**
```json
{
  "title": "string",
  "description": "string",
  "status": "pending | in_progress | completed",
  "priority": "low | medium | high",
  "dueDate": "ISO 8601 date string"
}
```

**Response `200 OK`:** Returns the updated task.

---

### DELETE /api/tasks/:id

Deletes a task. Only accessible if the task belongs to the authenticated user.

**Response `204 No Content`:** Empty body.

**Response `404 Not Found`:**
```json
{
  "error": "NotFound",
  "message": "Task not found"
}
```

---

## Error Responses

All errors follow this structure:

```json
{
  "error": "ErrorType",
  "message": "Human-readable description",
  "details": {}
}
```

### HTTP Status Code Reference

| Status | Meaning                          | When used                                |
|--------|----------------------------------|------------------------------------------|
| 200    | OK                               | Successful GET, PUT, PATCH               |
| 201    | Created                          | Successful POST                          |
| 204    | No Content                       | Successful DELETE                        |
| 400    | Bad Request                      | Malformed JSON, invalid query params     |
| 401    | Unauthorized                     | Missing or invalid JWT                   |
| 403    | Forbidden                        | Task belongs to another user             |
| 404    | Not Found                        | Resource does not exist                  |
| 422    | Unprocessable Entity             | Validation errors on request body        |
| 429    | Too Many Requests                | Rate limit exceeded                      |
| 500    | Internal Server Error            | Unexpected server error                  |

### Validation Error (422)

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

---

## Rate Limiting

Applied globally to all routes.

| Property        | Value                     |
|-----------------|---------------------------|
| Window          | 15 minutes                |
| Max requests    | 100 per IP per window     |
| Headers         | `RateLimit-*` (RFC 6585)  |

**Response `429 Too Many Requests`:**
```json
{
  "error": "TooManyRequests",
  "message": "Too many requests, please try again later"
}
```

---

## CORS

Enabled for all origins in development. In production, restrict `origin` to known domains.

```js
// Development
cors({ origin: '*' })

// Production (example)
cors({ origin: ['https://your-frontend.com'] })
```

---

## Seed Data

Run the seed script to populate the database with sample users and tasks:

```bash
node src/seed/seed.js
```

The seed creates:
- 2 users: `admin` / `user1` (password: `password123` each)
- 10 sample tasks distributed between both users with varied statuses and priorities

---

## Testing

### Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "mongodb-memory-server": "^9.x"
  }
}
```

### npm Scripts

```json
{
  "scripts": {
    "test": "jest --forceExit",
    "test:coverage": "jest --coverage --forceExit",
    "test:watch": "jest --watch"
  }
}
```

### Jest Configuration (`jest.config.js`)

```js
module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/setup.js',
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/seed/**'
  ]
}
```

### Test Infrastructure

**`tests/setup.js`** — starts `mongodb-memory-server` before the suite and tears it down after. Sets `process.env.MONGODB_URI` to the in-memory URI so the app connects to it automatically. No writes reach the local MongoDB.

**`tests/helpers.js`** — exports three async helpers used across test files:
- `createUser(username, password)` — inserts a hashed user directly via the model
- `getToken(app, username, password)` — calls `POST /api/auth/login` and returns the JWT string
- `createTask(app, token, overrides)` — calls `POST /api/tasks` with a default payload merged with `overrides`

### Test Cases

#### `tests/auth.test.js`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | POST /api/auth/login — valid credentials | 200, `{ token, expiresIn }` |
| 2 | POST /api/auth/login — wrong password | 401, `error: "Unauthorized"` |
| 3 | POST /api/auth/login — unknown username | 401, `error: "Unauthorized"` |
| 4 | POST /api/auth/login — missing `username` | 422, validation error on `username` |
| 5 | POST /api/auth/login — missing `password` | 422, validation error on `password` |
| 6 | POST /api/auth/login — empty body | 422, validation errors |

#### `tests/tasks.test.js`

**GET /api/tasks**

| # | Scenario | Expected |
|---|----------|----------|
| 7  | No token | 401 |
| 8  | Valid token, no tasks | 200, `data: []`, `pagination.total: 0` |
| 9  | Valid token, tasks exist | 200, only tasks of authenticated user |
| 10 | `?page=2&limit=3` | 200, correct page slice |
| 11 | `?status=completed` | 200, only completed tasks |
| 12 | `?priority=high` | 200, only high-priority tasks |
| 13 | `?search=keyword` | 200, tasks matching title or description |

**POST /api/tasks**

| # | Scenario | Expected |
|---|----------|----------|
| 14 | No token | 401 |
| 15 | Valid body | 201, task with `userId` = authenticated user |
| 16 | Missing `title` | 422, error on `title` |
| 17 | Invalid `status` value | 422, error on `status` |
| 18 | Invalid `priority` value | 422, error on `priority` |

**GET /api/tasks/:id**

| # | Scenario | Expected |
|---|----------|----------|
| 19 | No token | 401 |
| 20 | Own task | 200, full task document |
| 21 | Non-existent ID | 404 |
| 22 | Task belonging to another user | 403 |

**PUT /api/tasks/:id**

| # | Scenario | Expected |
|---|----------|----------|
| 23 | No token | 401 |
| 24 | Full valid body | 200, task fully replaced |
| 25 | Missing required field | 422 |
| 26 | Another user's task | 403 |
| 27 | Non-existent ID | 404 |

**PATCH /api/tasks/:id**

| # | Scenario | Expected |
|---|----------|----------|
| 28 | No token | 401 |
| 29 | Partial update (`status` only) | 200, only `status` changed |
| 30 | Invalid field value | 422 |
| 31 | Another user's task | 403 |
| 32 | Non-existent ID | 404 |

**DELETE /api/tasks/:id**

| # | Scenario | Expected |
|---|----------|----------|
| 33 | No token | 401 |
| 34 | Own task | 204, empty body |
| 35 | Deleted task — GET again | 404 |
| 36 | Another user's task | 403 |
| 37 | Non-existent ID | 404 |

### Coverage Target

Minimum **80%** on lines, branches, functions, and statements. Enforced via `coverageThreshold` in `jest.config.js` — the `test:coverage` script fails the build if thresholds are not met.

---

## OpenAPI Specification

Available at runtime via Swagger UI:
```
GET http://localhost:3000/api-docs
```

The OpenAPI 3.0 spec is generated from JSDoc annotations in route files using `swagger-jsdoc`.

---

## Implementation Notes for Agents

1. **User isolation**: tasks queries must always include `userId: req.user._id` to prevent cross-user access.
2. **Password hashing**: use `bcryptjs` with salt rounds ≥ 10. Never store plain text passwords.
3. **JWT payload**: include only `{ sub: user._id, username: user.username }`. Do not include sensitive fields.
4. **Mongoose timestamps**: enable `{ timestamps: true }` on all schemas to auto-manage `createdAt` / `updatedAt`.
5. **Pagination defaults**: always apply a default `limit` to prevent unbounded queries.
6. **PUT vs PATCH**: PUT replaces the full document (omitted optional fields reset to defaults); PATCH only updates provided fields using `{ $set: ... }`.
7. **DELETE response**: return `204 No Content` with no body — do not return the deleted document.
8. **Rate limiter placement**: mount before routes so it applies to all endpoints including `/api/auth/login`.
9. **Error handler middleware**: register a global `(err, req, res, next)` handler as the last middleware to catch unhandled errors and return consistent error shapes.
10. **Environment validation**: validate that `MONGODB_URI` and `JWT_SECRET` are set at startup and fail fast if missing.
