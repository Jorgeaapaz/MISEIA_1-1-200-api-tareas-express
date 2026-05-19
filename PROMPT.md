Hacer una api en express.js para la gestion de tareas.
Activar cors.
Poner un rate limit.
Usar token de autenticación.
Generar el token con un endpoint con user y password.
genera la especificación openapi del api.
Add swager al server.
Soporte de datos en mogodb que ya esta instalado en local.
Hacer seed de datos.
Agregar tests al api con Jest y Supertest:
  - Usar mongodb-memory-server para tests aislados (sin tocar la base de datos local).
  - Cubrir todos los endpoints: auth y tasks (CRUD completo).
  - Verificar casos de éxito, errores de validación (422), acceso sin token (401),
    recurso no encontrado (404) y aislamiento entre usuarios (403).
  - Configurar scripts npm: "test" para ejecutar todos los tests,
    "test:coverage" para generar reporte de cobertura.
  - Alcanzar al menos 80% de cobertura en líneas y ramas.