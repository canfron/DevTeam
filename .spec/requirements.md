# Requirements for DevTeam Project

## Project brief (auto-generated for testing)
**Brief:** "quiero un CRUD de productos con inventario"

## Requisitos funcionales

### Producto
- CRUD completo (create, read, update, delete)
- Campos: id, name (string, required), description (string, optional), price (float, gt=0), category (string, default="general"), stock (int, ge=0), sku (string, unique)
- Relaciones: categorías múltiples, historial de movimientos de inventario

### Inventario
- Rastrear movimientos de entrada/salida
- Campo: id, product_id (FK), type (in/out), quantity (int), timestamp, reason (string)
- Endpoint para historial por producto

### Dashboard
- Total de productos
- Total en stock
- Productos con stock bajo (< 10)
- Productos más frecuentes

## Requisitos no funcionales
- API REST con FastAPI
- SQLite como base de datos
- Validación Pydantic estricta
- Paginación con skip/limit
