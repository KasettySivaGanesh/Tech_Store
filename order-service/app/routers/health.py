"""
Health check endpoints for Kubernetes liveness and readiness probes.

- /api/health  → liveness  (is the process alive?)
- /api/ready   → readiness (can it serve traffic? checks DB connectivity)
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/health")
async def health():
    """Liveness probe — returns 200 if the process is running."""
    return {
        "status": "healthy",
        "service": "order-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/ready")
async def ready(db: AsyncSession = Depends(get_db)):
    """Readiness probe — returns 200 if the service can accept traffic."""
    try:
        await db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "service": "order-service",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error("Readiness check failed — database error: %s", str(e))
        from fastapi.responses import JSONResponse

        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "service": "order-service",
                "database": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
