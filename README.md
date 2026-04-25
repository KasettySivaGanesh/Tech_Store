# TechStore — Microservices Demo Application

A medium-complexity microservices application designed for learning Kubernetes deployment. Built with three independent services, each with its own database, communicating via REST APIs.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend   │────▶│  Product Service  │     │  Order Service    │
│  (React)     │────▶│  (ASP.NET Core)  │◀────│  (Python FastAPI) │
│  Port 5173   │     │  Port 5001       │     │  Port 5002        │
└─────────────┘     └────────┬─────────┘     └────────┬─────────┘
                             │                         │
                     ┌───────▼───────┐         ┌───────▼───────┐
                     │  products_db   │         │   orders_db    │
                     │  (PostgreSQL)  │         │  (PostgreSQL)  │
                     └───────────────┘         └───────────────┘
```

### Service Communication
- **Frontend → Product Service**: Fetch product catalog
- **Frontend → Order Service**: Place orders, view order history
- **Order Service → Product Service**: Validate products & update stock on order creation

### Key Design Patterns
- **Database per service** — No shared database; each service owns its data
- **Denormalized data** — Order items store `product_name` to avoid cross-service joins
- **Resilient communication** — Retry with exponential backoff, timeouts
- **Distributed tracing** — `X-Request-Id` propagated across all services
- **Health endpoints** — Standardized `/api/health` (liveness) and `/api/ready` (readiness) for Kubernetes probes

## Prerequisites

- **PostgreSQL 14+** — Running on `localhost:5432`
- **.NET 8 SDK** — For the Product Service
- **Python 3.11+** — For the Order Service
- **Node.js 18+** — For the Frontend

## Quick Start

### 1. Set Up Databases

```sql
-- Connect to PostgreSQL and create databases
CREATE DATABASE products_db;
CREATE DATABASE orders_db;
```

### 2. Start Product Service (Port 5001)

```bash
cd product-service
dotnet restore
dotnet run
```

The service will auto-create tables and seed 6 sample products.

### 3. Start Order Service (Port 5002)

```bash
cd order-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5002 --reload
```

### 4. Start Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Reference

### Product Service (`:5001`)

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| GET    | `/api/products`      | List all products   |
| GET    | `/api/products/{id}` | Get product by ID   |
| POST   | `/api/products`      | Create product      |
| PUT    | `/api/products/{id}` | Update product      |
| DELETE | `/api/products/{id}` | Delete product      |
| GET    | `/api/health`        | Liveness probe      |
| GET    | `/api/ready`         | Readiness probe     |

### Order Service (`:5002`)

| Method | Endpoint            | Description                |
|--------|---------------------|----------------------------|
| POST   | `/api/orders`       | Create order               |
| GET    | `/api/orders`       | List all orders            |
| GET    | `/api/orders/{id}`  | Get order with items       |
| GET    | `/api/health`       | Liveness probe             |
| GET    | `/api/ready`        | Readiness probe            |

### Sample: Create an Order

```bash
curl -X POST http://localhost:5002/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Jane Smith",
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 4, "quantity": 1 }
    ]
  }'
```

## Environment Variables

| Variable               | Service  | Default                                              |
|------------------------|----------|------------------------------------------------------|
| `DATABASE_URL`         | Product  | `Host=localhost;Port=5432;Database=products_db;...`   |
| `ASPNETCORE_URLS`      | Product  | `http://+:5001`                                      |
| `DATABASE_URL`         | Order    | `postgresql+asyncpg://postgres:...@localhost/orders_db` |
| `PRODUCT_SERVICE_URL`  | Order    | `http://localhost:5001`                               |
| `VITE_PRODUCT_API_URL` | Frontend | `http://localhost:5001`                               |
| `VITE_ORDER_API_URL`   | Frontend | `http://localhost:5002`                               |

## Kubernetes Readiness

This application is designed to be containerized and deployed to Kubernetes. Key features that support this:

- ✅ **Health endpoints** — `/api/health` and `/api/ready` on every service
- ✅ **Environment-based config** — All settings via env vars
- ✅ **Stateless services** — State lives in databases, not in the process
- ✅ **Independent databases** — Each service has its own DB
- ✅ **CORS configured** — Ready for cross-origin requests
- ✅ **Graceful shutdown** — Both services handle shutdown cleanly
- ✅ **Structured logging** — Request IDs for distributed tracing

## Project Structure

```
├── product-service/           # ASP.NET Core 8 Web API
│   ├── Controllers/           #   API controllers
│   ├── Models/                #   EF Core entity models
│   ├── Data/                  #   DbContext + seed data
│   ├── Dtos/                  #   Request/response DTOs
│   ├── Middleware/            #   Request logging
│   ├── Program.cs             #   App entry point
│   └── README.md
├── order-service/             # Python FastAPI
│   ├── app/
│   │   ├── routers/           #   API route handlers
│   │   ├── services/          #   Product Service HTTP client
│   │   ├── middleware/        #   Request logging
│   │   ├── models.py          #   SQLAlchemy ORM models
│   │   ├── schemas.py         #   Pydantic schemas
│   │   ├── config.py          #   Environment config
│   │   ├── database.py        #   Async DB setup
│   │   └── main.py            #   App entry point
│   ├── alembic/               #   Database migrations
│   └── README.md
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/        #   UI components
│   │   ├── context/           #   Cart state management
│   │   ├── api/               #   Axios API clients
│   │   ├── App.jsx            #   Root component + routing
│   │   └── App.css            #   Styles
│   └── README.md
└── README.md                  # This file
```
