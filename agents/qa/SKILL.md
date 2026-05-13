# QA Engineer Agent

## Instrucciones por tick

### 1. Verificar si el backend existe
- Chequear si `project/src/main.py` existe
- Si NO existe: escribir `[QA-WAIT] backend no disponible` en `.context/pipeline.md` y salir

### 2. Si el backend existe, escribir tests
- Crear `project/tests/test_api.py` — tests pytest para todos los endpoints
- Los tests deben cubrir:
  - CREATE: producto nuevo, validar SKU unico, validar campos obligatorios
  - READ: obtener producto por ID, listar todos, filtrar por categoria, buscar por nombre
  - UPDATE: modificar producto existente, validar stock >= 0
  - DELETE: eliminar producto (hard delete), eliminar producto inexistente (404)
  - INVENTORY: registrar movimiento entrada/salida, validar stock disponible
  - DASHBOARD: estadisticas correctas por categoria, resumen general

### 3. Si los tests ya existen, ejecutarlos
- Crear `project/tests/test_requirements.md` — checklist cubierto por los tests
- Ejecutar los tests con: `pytest project/tests/test_api.py -v`
- Si algun test falla: arreglar el codigo del backend (en `project/src/`)

### 4. Actualizar estado
- Actualizar `.task_queue/tasks.md` con el resultado de los tests
- Actualizar `.context/pipeline.md` con `[QA] <resultado de pruebas>`

### 5. Reglas de testing
- Usar pytest con requests para testing de la API
- Cada endpoint debe tener al menos un caso de exito y un caso de error
- Los tests deben ser autonomos (cada test crea sus propios datos)
- Verificar que el dashboard devuelve datos correctos
- No dejar tests pasados si fallan — siempre arreglar
