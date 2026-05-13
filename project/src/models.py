"""Pydantic schemas for the CRUD Products with Inventory application."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ===== Product Schemas =====

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    price: float = Field(..., gt=0)
    category: Optional[str] = Field("general", max_length=100)
    stock: int = Field(..., ge=0)
    sku: str = Field(..., min_length=1, max_length=50)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, max_length=100)
    stock: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category: str
    stock: int
    sku: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ===== Inventory Schemas =====

class InventoryCreate(BaseModel):
    type: str = Field(..., pattern="^(in|out)$")
    quantity: int = Field(..., gt=0)
    reason: Optional[str] = Field(None, max_length=500)


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    type: str
    quantity: int
    timestamp: Optional[datetime] = None
    reason: Optional[str] = None

    model_config = {"from_attributes": True}


# ===== Dashboard Schema =====

class DashboardStats(BaseModel):
    total_products: int
    total_stock: int
    low_stock_count: int
    recent_movements: int
    categories: List[str]
    total_items: int


# ===== Pagination helper =====

class ListResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int
