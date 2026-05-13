# API Contract — CRUD de Productos con Inventario

## Tech Stack
- FastAPI + SQLAlchemy + SQLite
- Pydantic validation
- Alembic migrations (optional)

## Entities

### Product
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | PK, auto-increment |
| name | string | required, max=255 |
| description | string | optional, max=2000 |
| price | float | required, gt=0 |
| category | string | default="general", max=100 |
| stock | int | required, ge=0 |
| sku | string | required, unique, max=50 |
| created_at | datetime | auto |

### Inventory Movement
| Field | Type | Constraints |
|-------|------|-------------|
| id | int | PK, auto-increment |
| product_id | int | FK -> Product.id |
| type | string | required, "in"|"out" |
| quantity | int | required, gt=0 |
| timestamp | datetime | auto |
| reason | string | optional, max=500 |

## Endpoints

### Products
- `GET /products?skip=0&limit=20&category=X&min_price=Y&max_price=Z`
  - Returns: list[Product], total count
  - 200 OK
- `GET /products/{product_id}`
  - Returns: Product or 404
  - 200 OK / 404 Not Found
- `POST /products`
  - Body: CreateProduct (name, description?, price, category, stock, sku)
  - Returns: Product or 409 if SKU already exists
  - 201 Created / 409 Conflict
- `PUT /products/{product_id}`
  - Body: UpdateProduct (fields are optional - partial update)
  - Returns: Product or 404
  - 200 OK / 404 Not Found
- `DELETE /products/{product_id}`
  - Returns: 200 OK or 404
  - 200 OK / 404 Not Found

### Inventory
- `GET /products/{product_id}/inventory?skip=0&limit=50`
  - Returns: list[InventoryMovement]
  - 200 OK
- `POST /products/{product_id}/inventory`
  - Body: CreateInventory (type="in"|"out", quantity, reason?)
  - Returns: InventoryMovement
  - 201 Created / 400 if quantity <= 0
  
### Dashboard
- `GET /dashboard/stats`
  - Returns: {total_products, total_stock, low_stock_count, recent_movements}
  - 200 OK

## Response Format
All list endpoints return: `{ "items": [...], "total": N, "skip": 0, "limit": 20 }`
All object endpoints return the object directly
