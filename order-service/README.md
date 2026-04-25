# Order Service (Python FastAPI)

Manages customer orders with product validation via the Product Service. Uses PostgreSQL via async SQLAlchemy.

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Product Service running (for order creation)

## Database Setup

1. Ensure PostgreSQL is running on `localhost:5432`
2. Create the database:
   ```sql
   CREATE DATABASE orders_db;
   ```
3. The application auto-creates tables on startup. Alternatively, use Alembic:
   ```bash
   alembic upgrade head
   ```

## Configuration

All configuration via environment variables (or a `.env` file):

| Variable               | Description                        | Default                                                           |
|------------------------|------------------------------------|-------------------------------------------------------------------|
| `DATABASE_URL`         | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:postgres@localhost:5432/orders_db`  |
| `SYNC_DATABASE_URL`    | Sync URL (for Alembic)             | `postgresql://postgres:postgres@localhost:5432/orders_db`          |
| `PRODUCT_SERVICE_URL`  | Product Service base URL           | `http://localhost:5001`                                           |
| `SERVICE_PORT`         | Port to listen on                  | `5002`                                                            |
| `LOG_LEVEL`            | Logging level                      | `INFO`                                                            |
| `PRODUCT_CLIENT_TIMEOUT` | HTTP timeout for Product Service (seconds) | `5.0`                                                    |
| `PRODUCT_CLIENT_RETRIES` | Retry attempts for Product Service | `3`                                                              |

## Running Locally

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run the service (port 5002)
uvicorn app.main:app --host 0.0.0.0 --port 5002 --reload
```

Or:
```bash
python -m app.main
```

## API Endpoints

| Method | Endpoint            | Description                      | Status Codes    |
|--------|---------------------|----------------------------------|-----------------|
| POST   | `/api/orders`       | Create an order                  | 201, 400, 503   |
| GET    | `/api/orders`       | List all orders                  | 200             |
| GET    | `/api/orders/{id}`  | Get order with items             | 200, 404        |
| GET    | `/api/health`       | Liveness probe                   | 200             |
| GET    | `/api/ready`        | Readiness probe (checks DB)      | 200, 503        |

### Sample Requests

**Create Order:**
```json
POST /api/orders
{
  "customer_name": "John Doe",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

**Response (201):**
```json
{
  "id": 1,
  "customer_name": "John Doe",
  "total_amount": 609.97,
  "status": "confirmed",
  "created_at": "2025-01-15T10:30:00Z",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Wireless Bluetooth Headphones",
      "quantity": 2,
      "unit_price": 79.99
    },
    {
      "id": 2,
      "product_id": 3,
      "product_name": "4K Ultra HD Monitor",
      "quantity": 1,
      "unit_price": 449.99
    }
  ]
}
```

## Resilience Features

- **Retry with exponential backoff**: Calls to Product Service retry up to 3 times on connection/timeout errors (0.5s → 1s → 2s)
- **Timeouts**: 5-second total timeout, 3-second connect timeout
- **Best-effort stock update**: If stock decrement fails after order confirmation, the order is still saved (logged as warning)
- **Request ID propagation**: `X-Request-Id` header forwarded to Product Service for distributed tracing

## Interactive API Docs

When running locally, visit:
- Swagger UI: http://localhost:5002/docs
- ReDoc: http://localhost:5002/redoc
