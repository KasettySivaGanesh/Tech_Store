from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from decimal import Decimal


# ──────────────────────────────────────────
# Order Item Schemas
# ──────────────────────────────────────────

class OrderItemCreate(BaseModel):
    """Request schema for a single item in an order."""
    product_id: int = Field(..., gt=0, description="ID of the product to order")
    quantity: int = Field(..., gt=0, description="Number of units to order")


class OrderItemResponse(BaseModel):
    """Response schema for an order item."""
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# Order Schemas
# ──────────────────────────────────────────

class OrderCreate(BaseModel):
    """Request schema for creating a new order."""
    customer_name: str = Field(..., min_length=1, max_length=200)
    items: List[OrderItemCreate] = Field(..., min_length=1)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "customer_name": "John Doe",
                    "items": [
                        {"product_id": 1, "quantity": 2},
                        {"product_id": 3, "quantity": 1},
                    ],
                }
            ]
        }
    }


class OrderResponse(BaseModel):
    """Full order response including items."""
    id: int
    customer_name: str
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Compact order response for listing (without full items)."""
    id: int
    customer_name: str
    total_amount: Decimal
    status: str
    created_at: datetime
    item_count: int


# ──────────────────────────────────────────
# Product Schema (from Product Service)
# ──────────────────────────────────────────

class ProductInfo(BaseModel):
    """Schema representing a product fetched from the Product Service."""
    id: int
    name: str
    price: Decimal
    stock: int
