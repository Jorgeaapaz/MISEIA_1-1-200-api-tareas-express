# Retrospectiva de Sesión — 2026-05-22
### API REST de Gestión de Tareas con Express.js y MongoDB

---

## Resumen / Overview

Se construyó desde cero una API REST completa de gestión de tareas utilizando **Express.js** y **MongoDB (Mongoose)**. El proyecto incluye autenticación JWT, autorización por usuario, validación de entradas, paginación, filtros, documentación Swagger y una suite de 37 tests de integración con cobertura mínima del 80%. Se añadió un pipeline CI en GitLab y documentación completa en README.

El proyecto está completado y operativo. Todos los endpoints están documentados, testeados y listos para uso local o despliegue.

---

## Proceso de instalación / Installation

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd 1-1-200-api-tareas-express

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ya existe un .env con valores por defecto)
# Editar .env si se necesita cambiar MONGODB_URI o JWT_SECRET

# 4. Opcional: cargar datos de prueba en la base de datos
npm run seed
```

---

## Comandos ejecutados / Commands Run

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala todas las dependencias del proyecto |
| `npm run seed` | Inserta 2 usuarios y 10 tareas de ejemplo en MongoDB |
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor con hot-reload via nodemon |
| `npm test` | Ejecuta todos los tests con Jest (37 tests) |
| `npm run test:coverage` | Ejecuta tests y genera reporte de cobertura (≥80%) |

---

## Levantar y detener la aplicación / Running & Stopping

### Prerrequisito
MongoDB debe estar corriendo en `localhost:27017`. Si no está instalado localmente, se puede levantar con Docker:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

### Iniciar
```bash
npm run dev      # desarrollo (nodemon)
# o
npm start        # producción
```

### Detener
Presionar `Ctrl+C` en la terminal donde corre el servidor.

### Pruebas de endpoints con curl

```bash
# 1. Login — obtener token JWT
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | jq .

# Guarda el token:
TOKEN="<token_del_paso_anterior>"

# 2. Listar tareas (paginado)
curl -s http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Crear tarea
curl -s -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi tarea","priority":"high","status":"pending"}' | jq .

# 4. Obtener tarea por ID
curl -s http://localhost:3000/api/tasks/<task_id> \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. Actualización parcial (PATCH)
curl -s -X PATCH http://localhost:3000/api/tasks/<task_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}' | jq .

# 6. Reemplazar tarea completa (PUT)
curl -s -X PUT http://localhost:3000/api/tasks/<task_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nueva tarea","status":"in_progress","priority":"medium"}' | jq .

# 7. Eliminar tarea
curl -s -X DELETE http://localhost:3000/api/tasks/<task_id> \
  -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}"
  # Respuesta esperada: 204

# Filtros disponibles en GET /api/tasks
curl -s "http://localhost:3000/api/tasks?status=pending&priority=high&search=setup&sortBy=dueDate&sortOrder=asc&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Ejecutar tests
```bash
npm test
# ✓ 37 tests en 2 suites (auth.test.js + tasks.test.js)
# Tests corren contra MongoDB en memoria (no requiere MongoDB local)

npm run test:coverage
# Genera reporte de cobertura en ./coverage/
```

---

## Configuración de red / Network Configuration

Esta aplicación corre localmente en el puerto **3000**. No requiere configuración NAT ni port forwarding para uso en la misma máquina.

Si se ejecuta dentro de una VM con VirtualBox en modo NAT, sí se necesita configurar port forwarding:

| Nombre | Protocolo | IP Host | Puerto Host | IP Guest | Puerto Guest |
|--------|-----------|---------|-------------|----------|--------------|
| api-tareas | TCP | 127.0.0.1 | 3000 | — | 3000 |

### Ejemplo de configuración de NAT con port forwarding / Example NAT Configuration with Port Forwarding

> **Aclaración — VirtualBox NAT:** Si la VM corre con adaptador NAT en VirtualBox, el host Windows no accede directamente a la VM. Se debe agregar el port forwarding anterior y opcionalmente una entrada en el archivo de hosts de Windows.
>
> Editar (como Administrador) `C:\Windows\System32\drivers\etc\hosts` y agregar:
> ```
> 127.0.0.1   api-tareas.local
> ```
> Esto aplica si se quiere acceder por nombre de dominio en lugar de `localhost`.

---

## URLs de prueba / Test URLs

| Recurso | URL |
|---------|-----|
| API base | `http://localhost:3000/api` |
| Login | `POST http://localhost:3000/api/auth/login` |
| Tareas | `http://localhost:3000/api/tasks` |
| Swagger UI | `http://localhost:3000/api-docs` |

---

## Arquitectura del proyecto / Project Structure

```
src/
├── config/
│   └── db.js                    # Conexión Mongoose
├── controllers/
│   ├── auth.controller.js       # Lógica de login + generación JWT
│   └── tasks.controller.js      # CRUD de tareas + validación + paginación
├── middleware/
│   └── auth.middleware.js       # Verificación del Bearer token JWT
├── models/
│   ├── User.js                  # Schema Mongoose + hash bcrypt pre-save
│   └── Task.js                  # Schema Mongoose (title, status, priority, dueDate, userId)
├── routes/
│   ├── auth.routes.js           # POST /api/auth/login
│   └── tasks.routes.js          # GET/POST/GET:id/PUT/PATCH/DELETE /api/tasks
├── seed/
│   └── seed.js                  # 2 usuarios + 10 tareas de ejemplo
├── server.js                    # Express app (CORS, rate limiting, Swagger, rutas, error handler)
└── index.js                     # Punto de entrada — valida env vars, conecta DB, arranca server

tests/
├── setup.js                     # MongoMemoryServer + limpieza entre tests
├── helpers.js                   # createUser / getToken / createTask
├── auth.test.js                 # 6 tests de autenticación
└── tasks.test.js                # 31 tests de CRUD de tareas
```

---

## Endpoints implementados / API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login — devuelve token JWT |
| GET | `/api/tasks` | JWT | Listar tareas (paginado, filtros, búsqueda) |
| POST | `/api/tasks` | JWT | Crear tarea |
| GET | `/api/tasks/:id` | JWT | Obtener tarea por ID |
| PUT | `/api/tasks/:id` | JWT | Reemplazar tarea completa |
| PATCH | `/api/tasks/:id` | JWT | Actualización parcial de tarea |
| DELETE | `/api/tasks/:id` | JWT | Eliminar tarea |

**Filtros disponibles en GET /api/tasks:**
- `page`, `limit` — paginación
- `status` — `pending | in_progress | completed`
- `priority` — `low | medium | high`
- `search` — búsqueda en título y descripción (regex, case-insensitive)
- `sortBy` — `createdAt | dueDate | priority`
- `sortOrder` — `asc | desc`

---

## Usuarios de prueba (seed) / Seed Users

| Usuario | Contraseña |
|---------|------------|
| admin | password123 |
| user1 | password123 |

---

## Problemas encontrados / Problems & Solutions

| Problema | Solución |
|----------|----------|
| Tests de integración necesitan MongoDB sin depender de un servidor real | Se usó `mongodb-memory-server` — levanta una instancia MongoDB en memoria por suite de tests |
| Rate limiting interfería con los tests (429 errors) | Se deshabilitó el rate limiter cuando `NODE_ENV === 'test'` |
| Autorización incorrecta al acceder a tareas de otro usuario | Se añadió verificación `task.userId !== req.user._id` en todos los endpoints que operan sobre `/:id`, devolviendo 403 |

---

## Decisiones técnicas / Technical Decisions

- **PUT vs PATCH:** Se implementaron ambos semánticamente correctos — PUT reemplaza la tarea completa (requiere `title`), PATCH actualiza solo los campos enviados.
- **Seguridad:** Contraseñas hasheadas con bcrypt (salt rounds: 10). JWT firmado con secret configurable. Rate limit de 100 req/15min en producción.
- **Validación:** Manual en controllers (sin librerías externas como Joi/Zod) para mantener dependencias mínimas.
- **Tests:** 37 tests de integración numerados (1–37) usando Supertest + Jest. Cobertura mínima configurada al 80% en `jest.config.js`.
- **CI/CD:** Pipeline GitLab con stage `build` usando `node:20-alpine` + cache de `node_modules` por `package-lock.json`.

---

## Resultados y conclusiones / Results & Conclusions

**Lo que funcionó:**
- Arquitectura limpia: separación controllers / routes / models / middleware.
- 37 tests de integración cubriendo todos los casos de error (401, 403, 404, 422) y casos felices.
- Swagger UI operativa en `/api-docs` generada automáticamente desde JSDoc en las rutas.
- Pipeline CI en GitLab funcional (build + cache).
- Postman collection incluida (`api_tareas_express.postman_collection.json`).

**Para mejorar / próximos pasos:**
- Agregar endpoint de registro de usuarios (`POST /api/auth/register`) — actualmente solo existe seed.
- Añadir etapa `test` al pipeline de GitLab (actualmente solo hace `npm ci`).
- Implementar refresh tokens para mayor seguridad.
- Añadir índices MongoDB en `userId` y `status` para queries más eficientes en producción.
- Considerar despliegue en Railway, Render, o similar con MongoDB Atlas.
