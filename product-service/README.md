# Product Service (ASP.NET Core 8 Web API)

Manages the product catalog with full CRUD operations. Uses PostgreSQL via Entity Framework Core.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL 14+

## Database Setup

1. Ensure PostgreSQL is running on `localhost:5432`
2. Create the database:
   ```sql
   CREATE DATABASE products_db;
   ```
3. The application will auto-create tables and seed sample data on first startup.

## Configuration

Configuration is loaded from environment variables (preferred) or `appsettings.json`:

| Variable           | Description                     | Default                                                                 |
|--------------------|---------------------------------|-------------------------------------------------------------------------|
| `DATABASE_URL`     | PostgreSQL connection string    | `Host=localhost;Port=5432;Database=products_db;Username=postgres;Password=postgres` |
| `ASPNETCORE_URLS`  | Service listen URL              | `http://+:5001`                                                         |

## Running Locally

```bash
# Restore dependencies
dotnet restore

# Run the service (port 5001)
dotnet run
```

Or with custom DB credentials:
```bash
DATABASE_URL="Host=localhost;Port=5432;Database=products_db;Username=myuser;Password=mypass" dotnet run
```

## API Endpoints

| Method | Endpoint             | Description         | Status Codes  |
|--------|----------------------|---------------------|---------------|
| GET    | `/api/products`      | List all products   | 200           |
| GET    | `/api/products/{id}` | Get product by ID   | 200, 404      |
| POST   | `/api/products`      | Create a product    | 201, 400      |
| PUT    | `/api/products/{id}` | Update a product    | 200, 400, 404 |
| DELETE | `/api/products/{id}` | Delete a product    | 204, 404      |
| GET    | `/api/health`        | Liveness probe      | 200           |
| GET    | `/api/ready`         | Readiness probe     | 200, 503      |

### Sample Requests

**Create Product:**
```json
POST /api/products
{
  "name": "Gaming Mouse",
  "price": 59.99,
  "description": "Ergonomic gaming mouse with 16000 DPI sensor",
  "stock": 100
}
```

**Update Product (partial):**
```json
PUT /api/products/1
{
  "stock": 145,
  "price": 74.99
}
```

**Sample Response:**
```json
{
  "id": 1,
  "name": "Wireless Bluetooth Headphones",
  "price": 79.99,
  "description": "Premium noise-cancelling over-ear headphones...",
  "stock": 150,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```
