# NexusTech Storefront & Admin Portal (Angular 21 Client)

Decoupled Frontend Application for E-Commerce and Backoffice Operations.

## Tech Stack
- **Framework**: Angular 21 (Standalone Components, Zoneless ready)
- **State Management**: Angular Signals (`signal()`, `computed()`)
- **Control Flow**: Modern Built-in Control Flow (`@if`, `@for`, `@let`)
- **Forms**: Angular Reactive Forms with Custom Validators
- **HTTP Client**: Functional HTTP Interceptors (`authInterceptor`)
- **Routing**: Modern Component Input Binding & Functional Guards (`authGuard`, `adminGuard`)
- **Styling**: Vanilla CSS Design Tokens (Dark slate glassmorphism, responsive grid)

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
# or: npx ng serve --port 4200
```
Open your browser at: `http://localhost:4200`

---

## Features
- **Storefront**:
  - Live search with instant filtering
  - Category selector pills
  - Sorting (Price Low-to-High, High-to-Low, Newest, Top Rated)
  - Interactive quick-view product modal
  - Stock warning badges (Low Stock, Sold Out)
- **Shopping Cart**:
  - Reactive Cart Drawer with Signals
  - Increment / decrement quantity with real-time stock ceiling
  - Auto-persists to `localStorage`
- **Checkout & Orders**:
  - Multi-input shipping & payment form with validation
  - Real-time stock deduction from Spring Boot backend
  - Customer Order tracking with status indicators
- **Admin Management**:
  - Executive Dashboard with KPI cards & low-stock alerts
  - Product Catalog CRUD (Add, Edit, Delete)
  - Order Status Workflow management (`PENDING` -> `SHIPPED` -> `DELIVERED`)
- **Quick Demo Login**:
  - 1-click buttons for Admin (`admin@store.com`) and Customer (`customer@store.com`)
