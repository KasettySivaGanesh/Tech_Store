"""Request logging middleware with X-Request-Id propagation for distributed tracing."""

import logging
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("order-service")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that:
    1. Assigns or propagates X-Request-Id for request correlation
    2. Logs incoming requests and outgoing responses with timing
    """

    async def dispatch(self, request: Request, call_next):
        # Get or generate request ID
        request_id = request.headers.get(
            "X-Request-Id", uuid.uuid4().hex[:12]
        )
        request.state.request_id = request_id

        start_time = time.time()
        logger.info(
            "[%s] → %s %s",
            request_id,
            request.method,
            request.url.path,
        )

        try:
            response = await call_next(request)
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                "[%s] ✗ %s %s failed after %sms: %s",
                request_id,
                request.method,
                request.url.path,
                duration_ms,
                str(e),
            )
            raise

        duration_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-Id"] = request_id

        logger.info(
            "[%s] ← %s %s responded %d in %sms",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

        return response
