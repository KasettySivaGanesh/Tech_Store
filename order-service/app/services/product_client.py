"""
HTTP client for calling the Product Service with retry and timeout handling.

Retry policy:
- Up to 3 attempts (configurable via PRODUCT_CLIENT_RETRIES)
- Exponential backoff: 0.5s → 1s → 2s
- Only retries on connection errors and timeouts
- Non-retryable errors (404, 400) fail immediately
"""

import logging
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.config import settings
from app.schemas import ProductInfo

logger = logging.getLogger(__name__)

TIMEOUT = httpx.Timeout(
    timeout=settings.PRODUCT_CLIENT_TIMEOUT,
    connect=3.0,
)


class ProductServiceError(Exception):
    """Raised when the Product Service returns an error or is unreachable."""

    def __init__(self, message: str, status_code: int = 503):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ProductClient:
    """Resilient HTTP client for the Product Service."""

    def __init__(self):
        self.base_url = settings.PRODUCT_SERVICE_URL
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=TIMEOUT,
            headers={"Accept": "application/json"},
        )

    @retry(
        stop=stop_after_attempt(settings.PRODUCT_CLIENT_RETRIES),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
        retry=retry_if_exception_type(
            (httpx.ConnectError, httpx.TimeoutException)
        ),
        before_sleep=lambda retry_state: logger.warning(
            "Retrying product service call (attempt %d)", retry_state.attempt_number
        ),
    )
    async def get_product(
        self, product_id: int, request_id: str = ""
    ) -> ProductInfo:
        """
        Fetch a product by ID from the Product Service.
        Retries on connection/timeout errors; fails fast on 404.
        """
        logger.info(
            "[%s] Fetching product %d from Product Service", request_id, product_id
        )
        try:
            response = await self.client.get(
                f"/api/products/{product_id}",
                headers={"X-Request-Id": request_id},
            )

            if response.status_code == 404:
                raise ProductServiceError(
                    f"Product {product_id} not found in catalog",
                    status_code=404,
                )

            response.raise_for_status()
            data = response.json()
            return ProductInfo(**data)

        except httpx.HTTPStatusError as e:
            logger.error(
                "[%s] Product Service returned HTTP %d",
                request_id,
                e.response.status_code,
            )
            raise ProductServiceError(
                f"Product Service error: HTTP {e.response.status_code}",
                status_code=e.response.status_code,
            )
        except (httpx.ConnectError, httpx.TimeoutException):
            raise  # Let tenacity handle retry
        except ProductServiceError:
            raise  # Don't wrap our own errors
        except Exception as e:
            logger.error(
                "[%s] Unexpected error calling Product Service: %s",
                request_id,
                str(e),
            )
            raise ProductServiceError(f"Failed to reach Product Service: {str(e)}")

    @retry(
        stop=stop_after_attempt(settings.PRODUCT_CLIENT_RETRIES),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
        retry=retry_if_exception_type(
            (httpx.ConnectError, httpx.TimeoutException)
        ),
    )
    async def update_product_stock(
        self, product_id: int, new_stock: int, request_id: str = ""
    ):
        """Decrement stock on the Product Service after a successful order."""
        logger.info(
            "[%s] Updating stock for product %d → %d",
            request_id,
            product_id,
            new_stock,
        )
        try:
            response = await self.client.put(
                f"/api/products/{product_id}",
                json={"stock": new_stock},
                headers={"X-Request-Id": request_id},
            )
            response.raise_for_status()
        except (httpx.ConnectError, httpx.TimeoutException):
            raise  # Let tenacity retry
        except Exception as e:
            logger.error(
                "[%s] Failed to update stock for product %d: %s",
                request_id,
                product_id,
                str(e),
            )
            raise ProductServiceError(f"Failed to update product stock: {str(e)}")

    async def close(self):
        """Close the underlying HTTP client."""
        await self.client.aclose()


# Singleton instance
product_client = ProductClient()
