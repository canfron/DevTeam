"""FastAPI application for CRUD Products with Inventory.

Follows .spec/api-contract.md exactly.
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

import uvicorn
from pydantic import BaseModel
from datetime import datetime

from .database import engine, SessionLocal, Base, get_db

# === SQLAlchemy Database Models ===

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sa_func


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=False, default="general")
    stock = Column(Integer, nullable=False, default=0)
    sku = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime, default=sa_func.now())
    inventory_movements = relationship("InventoryMovement", back_populates="product")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(String(3), nullable=False)  # "in" or "out"
    quantity = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=sa_func.now())
    reason = Column(String(500), nullable=True)
    product = relationship("Product", back_populates="inventory_movements")


# Initialize database tables
Base.metadata.create_all(bind=engine)

# === Pydantic Schemas ===


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = "general"
    stock: int
    sku: str


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    sku: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category: str
    stock: int
    sku: str
    created_at: Optional[str] = None

    model_config = {"from_attributes": True}


class InventoryCreate(BaseModel):
    type: str  # "in" or "out"
    quantity: int
    reason: Optional[str] = None


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    type: str
    quantity: int
    timestamp: Optional[str] = None
    reason: Optional[str] = None

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int


class DashboardStats(BaseModel):
    total_products: int
    total_stock: int
    low_stock_count: int
    recent_movements: int
    categories: list
    total_items: int


# === FastAPI App ===

app = FastAPI(title="CRUD Products with Inventory", version="1.0.0")


# === Dependency ===

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# === Helper Functions ===

def product_to_dict(product) -> dict:
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "stock": product.stock,
        "sku": product.sku,
        "created_at": product.created_at.isoformat() if product.created_at else None,
    }


def inventory_to_dict(inv) -> dict:
    return {
        "id": inv.id,
        "product_id": inv.product_id,
        "type": inv.type,
        "quantity": inv.quantity,
        "timestamp": inv.timestamp.isoformat() if inv.timestamp else None,
        "reason": inv.reason,
    }


# === Products Endpoints ===

@app.get("/products")
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    """GET /products — List products with pagination and filters."""
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    total = query.count()
    products = query.offset(skip).limit(limit).all()

    items = []
    for p in products:
        items.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "category": p.category,
            "stock": p.stock,
            "sku": p.sku,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    return {"items": items, "total": total, "skip": skip, "limit": limit}
