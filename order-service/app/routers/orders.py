"""
Order endpoints — create orders and fetch order history.

Order creation flow:
1. Validate each item by calling Product Service (check existence + stock)
2. Calculate totals using live prices from Product Service
3. Persist order + order_items
4. Decrement stock on Product Service for each item
"""

import logging
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Order, OrderItem
from app.schemas import OrderCreate, OrderResponse, OrderListResponse
from app.services.product_client import product_client, ProductServiceError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new order.

    Validates product availability by calling the Product Service,
    calculates totals, persists the order, then decrements stock.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info(
        "[%s] Creating order for customer '%s' with %d item(s)",
        request_id,
        order_data.customer_name,
        len(order_data.items),
    )

    # ── Step 1: Validate products and gather info ──
    validated_items = []
    for item in order_data.items:
        try:
            product = await product_client.get_product(
                item.product_id, request_id=request_id
            )
        except ProductServiceError as e:
            if e.status_code == 404:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product with ID {item.product_id} does not exist.",
                )
            raise HTTPException(
                status_code=503,
                detail=f"Unable to validate product {item.product_id}: {e.message}",
            )

        # Check stock
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.name}' "
                    f"(requested: {item.quantity}, available: {product.stock})."
                ),
            )

        validated_items.append(
            {
                "product": product,
                "quantity": item.quantity,
            }
        )

    # ── Step 2: Calculate total and build order ──
    total_amount = Decimal("0")
    order_items = []

    for vi in validated_items:
        product = vi["product"]
        quantity = vi["quantity"]
        line_total = product.price * quantity
        total_amount += line_total

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                unit_price=product.price,
            )
        )

    order = Order(
        customer_name=order_data.customer_name,
        total_amount=total_amount,
        status="confirmed",
        items=order_items,
    )

    # ── Step 3: Persist ──
    db.add(order)
    await db.commit()
    await db.refresh(order)

    logger.info(
        "[%s] Order %d created — total: $%s, items: %d",
        request_id,
        order.id,
        total_amount,
        len(order_items),
    )

    # ── Step 4: Decrement stock (best-effort) ──
    for vi in validated_items:
        product = vi["product"]
        new_stock = product.stock - vi["quantity"]
        try:
            await product_client.update_product_stock(
                product.id, new_stock, request_id=request_id
            )
        except ProductServiceError as e:
            logger.warning(
                "[%s] Failed to update stock for product %d: %s (order still confirmed)",
                request_id,
                product.id,
                e.message,
            )

    return order


@router.get("", response_model=List[OrderListResponse])
async def list_orders(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """List all orders with item counts (most recent first)."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info("[%s] Fetching all orders", request_id)

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    return [
        OrderListResponse(
            id=o.id,
            customer_name=o.customer_name,
            total_amount=o.total_amount,
            status=o.status,
            created_at=o.created_at,
            item_count=len(o.items),
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get a single order with full item details."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.info("[%s] Fetching order %d", request_id, order_id)

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        logger.warning("[%s] Order %d not found", request_id, order_id)
        raise HTTPException(status_code=404, detail="Order not found")

    return order
