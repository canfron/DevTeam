# Architecture — CRUD de Productos con Inventario

## Tech Stack
- **Runtime:** Python 3.11+
- **Web Framework:** FastAPI
- **ORM:** SQLAlchemy (async preferred, but sync is OK for PoC)
- **Database:** SQLite (dev) → configurable for PostgreSQL (prod)
- **Validation:** Pydantic v2
- **Testing:** pytest + pytest-asyncio + httpx
- **Deployment:** Docker + Docker Compose

## Project Structure
```
project/
├── database.py      # SQLAlchemy setup, Base, engine
├── models.py        # Pydantic schemas (Create/Product/Update)
├── main.py          # FastAPI app + all CRUD endpoints
├── requirements.txt
├── tests/
│   ├── test_products.py
│   └── test_inventory.py
├── static/          # HTML UI (optional for PoC)
└── README.md
```

## Key Design Decisions
1. **SQLite** for simplicity in PoC. Use env var DATABASE_URL to switch backends
2. **SQLAlchemy sync** for initial implementation (simpler than async)
3. **Pydantic V2** for all request/response models
4. **No authentication** in the PoC (security layer for later)
5. **Pagination** on all list endpoints (skip/limit pattern)
6. **Soft delete NOT implemented** — hard delete is sufficient for PoC

## Database Model
```python
# SQLAlchemy models (sync)
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(100), default="general")
    stock = Column(Integer, nullable=False, default=0)
    sku = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime, default=func.now())

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(String(3), nullable=False)  # "in" or "out"
    quantity = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=func.now())
    reason = Column(String(500), nullable=True)
```
