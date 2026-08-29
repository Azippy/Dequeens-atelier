# DeQueens Atelier Backend

This repository is the backend API for DeQueens Atelier, a fashion storefront and boutique management system built with Node.js, Express, MongoDB, and Socket.IO.

## Current project stage

This codebase is currently an active backend MVP / early production-ready stage. The application includes core storefront, customer, admin, order, payment, communication, and custom service flows.

Implemented areas include:

- User authentication and role-based authorization
- Product catalog and category management
- Shopping cart and checkout-related order logic
- Payment flow with Paystack integration
- Chat and real-time messaging support using Socket.IO
- Design request management for custom orders
- Apprenticeship application workflow
- Admin dashboard style user access patterns
- Centralized error handling middleware

This is not just a starter scaffold; it includes functional route modules, controllers, models, services, and socket services tied together through the app entry points.

## Tech stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.IO
- Cloudinary for media uploads
- Paystack for payment processing
- dotenv for environment management
- nodemon for development

## Project structure

```text
app.js                 Express app setup
server.js              Server bootstrap and DB connection
config/                Database and external configuration
controllers/           Request handlers for app features
middleware/            Auth, authorization, upload, and error handling
models/                Mongoose schemas
routes/                 API routes
services/              Reusable business logic
socket/                Real-time socket handlers
utils/                 Token, order, payment, and helper utilities
Scripts/               Admin/bootstrap scripts
```

## Features implemented

### Authentication and users

- User signup and login
- JWT generation and validation
- Protected routes
- Admin-only authorization checks
- User profile retrieval and admin dashboard endpoint

### Catalog and storefront

- Categories CRUD flow
- Product creation, update, retrieval, and soft deletion logic
- Filtering, search, sorting, and pagination for products
- Product metadata such as gender, price, size, color, stock, and feature flags

### Cart and orders

- Cart management endpoints
- Order creation and tracking logic
- Order total calculations
- Expiration handling for pending orders

### Payments

- Paystack integration
- Payment initialization and verification
- Webhook handling route configuration

### Chat and messaging

- Conversation creation and retrieval
- Message storage and retrieval
- Real-time chat namespace/socket logic
- Authorization checks for customer vs admin access

### Custom services

- Design request submission and tracking
- Admin handling for design request updates and approval flow
- Apprenticeship application workflow
- Portfolio upload support via middleware

## Requirements

- Node.js 18+
- MongoDB instance
- npm
- Paystack credentials
- Cloudinary credentials
- JWT secret and app environment variables

## Installation

```bash
git clone <repository-url>
cd fashion
npm install
```

Create a `.env` file in the project root with the required environment values.

Example variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

Do not commit your `.env` file to source control.

## Running the app

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API usually runs on:

```text
http://localhost:5000
```

Health check:

```http
GET /
```

## Admin setup

A bootstrap script is included to create an admin user if needed:

```bash
npm run create-admin
```

Before using it in a real environment, review the script and replace default credentials with secure values.

## API overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

```http
GET /api/users/me
GET /api/users/admin-dashboard
```

### Categories

```http
GET /api/categories
POST /api/categories
```

### Products

```http
GET /api/products
GET /api/products/:id
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id
```

### Cart

```http
GET /api/cart
POST /api/cart
PATCH /api/cart/:itemId
DELETE /api/cart/:itemId
```

### Orders

```http
GET /api/orders
GET /api/orders/:id
POST /api/orders
```

### Payments

```http
POST /api/payments/initialize
GET /api/payments/verify/:reference
POST /api/payments/webhook
```

### Chat

```http
POST /api/chat/conversations
GET /api/chat/conversations/my
GET /api/chat/conversations/:id/messages
GET /api/chat/conversations
```

### Design requests

```http
POST /api/design-requests
GET /api/design-requests/my-requests
GET /api/design-requests/my-requests/:id
PATCH /api/design-requests/my-requests/:id/approve
GET /api/design-requests
PATCH /api/design-requests/:id
```

### Apprenticeships

```http
POST /api/apprenticeships
GET /api/apprenticeships/my-application
GET /api/apprenticeships
GET /api/apprenticeships/:id
PATCH /api/apprenticeships/:id
```

## Notes on current status

- The backend is structured for a full commerce + boutique workflow.
- Real-time chat and payment flows are included and wired up.
- Some areas may still need refinement, validation hardening, or additional edge-case handling depending on deployment needs.
- There is no automated test suite in the current repository state, so API verification should be done with manual testing or a Postman/Insomnia workflow.

## License

ISC
