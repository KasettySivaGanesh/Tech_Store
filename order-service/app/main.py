"""
Order Service — FastAPI application entry point.

This service manages customer orders and communicates with the Product Service
to validate product availability and update stock levels.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import orders, health
from app.middleware.request_logging import RequestLoggingMiddleware
from app.services.product_client import product_client

# ── Configure logging ──
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("order-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("Order Service starting up...")
    logger.info("Product Service URL: %s", settings.PRODUCT_SERVICE_URL)
    logger.info("Database: %s", settings.DATABASE_URL.split("@")[-1])

    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")

    yield

    # Shutdown
    logger.info("Order Service shutting down...")
    await product_client.close()
    await engine.dispose()
    logger.info("Cleanup complete.")


# ── Create FastAPI app ──
app = FastAPI(
    title="Order Service",
    description="Manages customer orders. Validates products via Product Service.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)

# ── Request logging ──
app.add_middleware(RequestLoggingMiddleware)

# ── Routers ──
app.include_router(orders.router)
app.include_router(health.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
