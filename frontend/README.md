# Frontend (React + Vite)

A modern storefront for browsing products, managing a cart, and placing orders.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- Product Service running on `http://localhost:5001`
- Order Service running on `http://localhost:5002`

## Configuration

Create a `.env` file (or use the existing one):

| Variable              | Description              | Default                 |
|-----------------------|--------------------------|-------------------------|
| `VITE_PRODUCT_API_URL`| Product Service base URL | `http://localhost:5001`  |
| `VITE_ORDER_API_URL`  | Order Service base URL   | `http://localhost:5002`  |

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

Then open http://localhost:5173

## Features

- **Product Catalog** — Browse all products with stock status
- **Shopping Cart** — Add/remove items, adjust quantities
- **Place Orders** — Submit cart to Order Service (validates stock via Product Service)
- **Order History** — View past orders with expandable line items
- **Request Tracing** — Generates X-Request-Id for each API call

## Pages

| Route      | Description                |
|------------|----------------------------|
| `/`        | Product catalog (home)     |
| `/cart`    | Shopping cart + checkout   |
| `/orders`  | Order history              |

## Production Build

```bash
npm run build
npm run preview   # Preview production build locally
```

The production bundle will be in the `dist/` directory, ready to be served by any static file server (Nginx, etc.).
