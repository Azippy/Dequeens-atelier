# DeQueens Atelier Backend API

This repository contains the backend API for DeQueens Atelier, a boutique fashion brand and storefront application built with Node.js, Express, MongoDB, JWT authentication, Cloudinary, Paystack, and Socket.IO.

The backend handles user authentication, catalog management, shopping cart logic, order flow, payment verification, bespoke design requests, apprenticeship applications, and admin dashboard operations.

## Project Overview

DeQueens Atelier is a fashion commerce platform with both customer-facing and admin-facing capabilities. This backend is designed to support:

- Product browsing and sales
- Cart management and order placement
- Secure checkout via Paystack
- Real-time customer support chat
- Bespoke design request submissions
- Apprenticeship application intake
- Role-based admin access controls

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Socket.IO for live chat
- Cloudinary for media uploads
- Paystack for payment processing
- dotenv for environment setup
- nodemon for development mode

## Project Structure

```text
backend/
├── app.js
├── server.js
├── package.json
├── README.md
├── config/
│   ├── cloudinary.js
│   ├── db.js
│   └── email.js
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── socket/
├── utils/
├── scripts/
└── .env
```

## Environment Variables

Create a .env file in the backend root with values similar to the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dequeens-atelier
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_CALLBACK_URL=http://localhost:5000/api/payments/verify
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> Never commit your .env file to version control.

## Running the Project

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Run production server:

```bash
npm start
```

Default base URL:

```text
http://localhost:5000
```

## API Conventions

### Response Format

Most successful responses follow this structure:

```json
{
  "status": "success",
  "message": "Operation completed successfully"
}
```

For resource-returning endpoints, results are often nested under the resource name, for example:

```json
{
  "status": "success",
  "results": 12,
  "products": [
    {
      "_id": "...",
      "name": "Classic Satin Gown",
      "price": 250000
    }
  ]
}
```

### Error Format

Errors are returned in a consistent format:

```json
{
  "status": "fail",
  "message": "Product not found"
}
```

Validation errors may include a field-level breakdown:

```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Authentication

Protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

Use the token returned by the login endpoint.

### User Roles

- customer: standard storefront user
- admin: privileged user with dashboard and management access

## Authentication Routes

### 1) Register a new user

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Registration successful",
  "user": {
    "id": "64ab12c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer"
  }
}
```

### 2) Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64ab12c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer"
  }
}
```

## User Routes

### 3) Get logged-in user details

```http
GET /api/users/me
```

Headers:

```http
Authorization: Bearer <token>
```

Expected response:

```json
{
  "message": "Authenticated successfully",
  "user": {
    "_id": "64ab12c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "createdAt": "2026-08-30T10:00:00.000Z",
    "updatedAt": "2026-08-30T10:00:00.000Z"
  }
}
```

### 4) Get admin dashboard access

```http
GET /api/users/admin-dashboard
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "message": "Welcome to the DeQueens Atelier admin dashboard",
  "user": {
    "id": "64ab12c...",
    "name": "Admin User",
    "email": "admin@dequeens.com",
    "role": "admin"
  }
}
```

## Category Routes

### 5) Get all active categories

```http
GET /api/categories
```

Expected response:

```json
{
  "status": "success",
  "results": 3,
  "categories": [
    {
      "_id": "64ad...",
      "name": "Bridal",
      "slug": "bridal",
      "description": "Luxury bridal silhouettes",
      "image": "https://example.com/bridal.jpg",
      "isActive": true,
      "createdAt": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

### 6) Create a new category

```http
POST /api/categories
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Request body:

```json
{
  "name": "Evening Wear",
  "slug": "evening-wear",
  "description": "Dressy styles for evening occasions",
  "image": "https://example.com/evening.jpg"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Category created successfully",
  "category": {
    "_id": "64ad...",
    "name": "Evening Wear",
    "slug": "evening-wear",
    "description": "Dressy styles for evening occasions",
    "image": "https://example.com/evening.jpg"
  }
}
```

## Product Routes

### 7) Get products with filters and pagination

```http
GET /api/products
```

Query parameters:

```text
search=lace
category=64ad...
gender=women
minPrice=20000
maxPrice=150000
featured=true
readyToWear=true
bespoke=false
page=1
limit=12
sort=-createdAt
```

Expected response:

```json
{
  "status": "success",
  "results": 12,
  "pagination": {
    "currentPage": 1,
    "limit": 12,
    "totalProducts": 34,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "products": [
    {
      "_id": "64af...",
      "name": "Classic Satin Gown",
      "slug": "classic-satin-gown",
      "description": "Elegant evening gown with soft drape",
      "price": 180000,
      "gender": "women",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Black", "Ivory"],
      "stock": 10,
      "isReadyToWear": true,
      "isBespoke": false,
      "isFeatured": true,
      "category": {
        "_id": "64ad...",
        "name": "Bridal",
        "slug": "bridal"
      },
      "images": [
        {
          "url": "https://example.com/image.jpg",
          "publicId": "dequeens-atelier/products/abc123"
        }
      ]
    }
  ]
}
```

### 8) Get a single product by ID

```http
GET /api/products/:id
```

Example:

```http
GET /api/products/64af123abc
```

Expected response:

```json
{
  "status": "success",
  "product": {
    "_id": "64af123abc",
    "name": "Classic Satin Gown",
    "price": 180000,
    "description": "Elegant evening gown with soft drape",
    "stock": 10,
    "isActive": true
  }
}
```

### 9) Create a product

```http
POST /api/products
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Request body (multipart/form-data for image upload):

```text
name: Classic Satin Gown
slug: classic-satin-gown
description: Elegant evening gown with soft drape
price: 180000
category: 64ad...
subCategory: Evening
gender: women
sizes: ["S","M","L","XL"]
colors: ["Black","Ivory"]
stock: 10
isReadyToWear: true
isBespoke: false
isFeatured: true
```

Files:

```text
images: one or more image files
```

Expected response:

```json
{
  "status": "success",
  "message": "Product created successfully",
  "product": {
    "_id": "64af...",
    "name": "Classic Satin Gown",
    "price": 180000,
    "images": [
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "dequeens-atelier/products/abc"
      }
    ]
  }
}
```

### 10) Update an existing product

```http
PATCH /api/products/:id
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Request body example:

```json
{
  "price": 190000,
  "stock": 15,
  "isFeatured": true
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Product updated successfully",
  "product": {
    "_id": "64af...",
    "price": 190000,
    "stock": 15
  }
}
```

### 11) Delete a product

```http
DELETE /api/products/:id
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

## Cart Routes

### 12) Get logged-in user's cart

```http
GET /api/cart
```

Headers:

```http
Authorization: Bearer <token>
```

Expected response:

```json
{
  "status": "success",
  "cart": {
    "_id": "64c4...",
    "user": "64ab...",
    "items": [
      {
        "_id": "64c5...",
        "product": {
          "_id": "64af...",
          "name": "Classic Satin Gown",
          "price": 180000,
          "images": [{ "url": "https://..." }],
          "sizes": ["S", "M", "L"],
          "colors": ["Black", "Ivory"],
          "stock": 10
        },
        "quantity": 1,
        "size": "M",
        "color": "Black"
      }
    ]
  }
}
```

### 13) Add product to cart

```http
POST /api/cart/items
```

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "productId": "64af...",
  "quantity": 1,
  "size": "M",
  "color": "Black"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Product added to cart",
  "cart": {
    "_id": "64c4...",
    "items": [
      {
        "product": "64af...",
        "quantity": 1,
        "size": "M",
        "color": "Black"
      }
    ]
  }
}
```

### 14) Update a cart item quantity

```http
PATCH /api/cart/items/:itemId
```

Request body:

```json
{
  "quantity": 2
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Cart updated successfully",
  "cart": {
    "_id": "64c4...",
    "items": [
      {
        "_id": "64c5...",
        "quantity": 2
      }
    ]
  }
}
```

### 15) Remove one item from cart

```http
DELETE /api/cart/items/:itemId
```

Expected response:

```json
{
  "status": "success",
  "message": "Item removed from cart"
}
```

### 16) Clear the cart

```http
DELETE /api/cart
```

Expected response:

```json
{
  "status": "success",
  "message": "Cart cleared successfully"
}
```

## Order Routes

### 17) Create an order

```http
POST /api/orders
```

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "shippingAddress": {
    "fullName": "Jane Doe",
    "phone": "08012345678",
    "address": "12 Marina Road",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria"
  },
  "notes": "Please deliver before 5pm"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Order created successfully",
  "order": {
    "_id": "64d2...",
    "orderNumber": "DQ-123456789",
    "user": "64ab...",
    "items": [
      {
        "product": "64af...",
        "name": "Classic Satin Gown",
        "price": 180000,
        "quantity": 1,
        "size": "M",
        "color": "Black",
        "image": "https://example.com/image.jpg"
      }
    ],
    "shippingAddress": {
      "fullName": "Jane Doe",
      "phone": "08012345678",
      "address": "12 Marina Road",
      "city": "Lagos",
      "state": "Lagos State",
      "country": "Nigeria"
    },
    "subtotal": 180000,
    "shippingFee": 0,
    "totalAmount": 180000,
    "paymentStatus": "pending",
    "orderStatus": "pending"
  }
}
```

### 18) Get all orders for the logged-in user

```http
GET /api/orders/my-orders
```

Headers:

```http
Authorization: Bearer <token>
```

Expected response:

```json
{
  "status": "success",
  "results": 2,
  "orders": [
    {
      "_id": "64d2...",
      "orderNumber": "DQ-123456789",
      "paymentStatus": "pending",
      "orderStatus": "pending",
      "totalAmount": 180000
    }
  ]
}
```

### 19) Get a single order for the logged-in user

```http
GET /api/orders/my-orders/:id
```

Expected response:

```json
{
  "status": "success",
  "order": {
    "_id": "64d2...",
    "orderNumber": "DQ-123456789",
    "items": [],
    "shippingAddress": {},
    "totalAmount": 180000
  }
}
```

### 20) Cancel an order

```http
PATCH /api/orders/my-orders/:id/cancel
```

Headers:

```http
Authorization: Bearer <token>
```

Expected response:

```json
{
  "status": "success",
  "message": "Order cancelled successfully",
  "order": {
    "_id": "64d2...",
    "orderStatus": "cancelled"
  }
}
```

### 21) Get all orders (admin only)

```http
GET /api/orders
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "status": "success",
  "results": 15,
  "orders": [
    {
      "_id": "64d2...",
      "orderNumber": "DQ-123456789",
      "user": {
        "_id": "64ab...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "totalAmount": 180000,
      "paymentStatus": "paid",
      "orderStatus": "confirmed"
    }
  ]
}
```

### 22) Update order status (admin only)

```http
PATCH /api/orders/:id/status
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Request body:

```json
{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Order updated successfully",
  "order": {
    "_id": "64d2...",
    "orderStatus": "shipped",
    "paymentStatus": "paid"
  }
}
```

## Payment Routes

### 23) Initialize Paystack payment

```http
POST /api/payments/initialize
```

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "orderId": "64d2..."
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Payment initialized successfully",
  "payment": {
    "authorizationUrl": "https://checkout.paystack.com/xyz123",
    "accessCode": "xyz123",
    "reference": "DQ-64d2-1725000000000"
  }
}
```

### 24) Verify payment

```http
GET /api/payments/verify/:reference
```

Headers:

```http
Authorization: Bearer <token>
```

Expected response:

```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "order": {
    "_id": "64d2...",
    "paymentStatus": "paid",
    "orderStatus": "confirmed"
  }
}
```

### 25) Paystack webhook endpoint

```http
POST /api/payments/webhook
```

This route is used by Paystack to notify the backend of successful transactions. It expects the raw JSON payload from Paystack with the X-Paystack-Signature header.

## Design Request Routes

### 26) Create a bespoke design request

```http
POST /api/design-requests
```

Headers:

```http
Authorization: Bearer <token>
```

Request body (multipart/form-data):

```text
customerName: Jane Doe
phone: 08012345678
email: jane@example.com
designType: bridal
gender: female
occasion: Wedding
eventDate: 2026-12-10
preferredColor: Ivory
preferredFabric: Satin
budget: 350000
description: Custom wedding gown with lace neckline and train
measurements: {"height": 170, "chest": 88, "waist": 68}
```

Files:

```text
images: one or more reference images
```

Expected response:

```json
{
  "status": "success",
  "message": "Custom design request submitted successfully",
  "designRequest": {
    "_id": "64e1...",
    "requestNumber": "DR-12345",
    "customerName": "Jane Doe",
    "status": "pending"
  },
  "conversation": {
    "_id": "64e2...",
    "type": "bespoke",
    "status": "open"
  }
}
```

### 27) Get all my design requests

```http
GET /api/design-requests/my-requests
```

Expected response:

```json
{
  "status": "success",
  "results": 2,
  "requests": [
    {
      "_id": "64e1...",
      "requestNumber": "DR-12345",
      "status": "pending",
      "budget": 350000
    }
  ]
}
```

### 28) Get one of my design requests

```http
GET /api/design-requests/my-requests/:id
```

Expected response:

```json
{
  "status": "success",
  "request": {
    "_id": "64e1...",
    "requestNumber": "DR-12345",
    "status": "quoted",
    "quotedAmount": 280000
  }
}
```

### 29) Approve a quote for a design request

```http
PATCH /api/design-requests/my-requests/:id/approve
```

Expected response:

```json
{
  "status": "success",
  "message": "Design quote approved successfully",
  "request": {
    "_id": "64e1...",
    "status": "approved",
    "quoteApprovedAt": "2026-08-30T12:00:00.000Z"
  }
}
```

### 30) Get all design requests (admin only)

```http
GET /api/design-requests
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "status": "success",
  "results": 8,
  "requests": [
    {
      "_id": "64e1...",
      "customerName": "Jane Doe",
      "status": "pending",
      "user": {
        "_id": "64ab...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

### 31) Update design request status or quote (admin only)

```http
PATCH /api/design-requests/:id
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Request body:

```json
{
  "status": "quoted",
  "quotedAmount": 280000,
  "adminNote": "This style is approved with a satin finish and lace detailing."
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Design request updated successfully",
  "request": {
    "_id": "64e1...",
    "status": "quoted",
    "quotedAmount": 280000,
    "adminNote": "This style is approved..."
  }
}
```

## Apprenticeship Routes

### 32) Apply for apprenticeship

```http
POST /api/apprenticeships
```

Headers:

```http
Authorization: Bearer <token>
```

Request body (multipart/form-data):

```text
fullName: Jane Doe
phone: 08012345678
email: jane@example.com
location: Lagos, Nigeria
trainingArea: Fashion design
experienceLevel: beginner
previousExperience: Worked on local tailoring projects
reasonForApplying: I want to learn couture construction and draping.
availability: Full-time
preferredStartDate: 2026-09-15
```

Files:

```text
portfolioImages: one or more sample portfolio files
```

Expected response:

```json
{
  "status": "success",
  "message": "Apprenticeship application submitted successfully",
  "application": {
    "_id": "64f1...",
    "applicationNumber": "APP-1001",
    "fullName": "Jane Doe",
    "status": "pending"
  }
}
```

### 33) Get my apprenticeship application

```http
GET /api/apprenticeships/my-application
```

Expected response:

```json
{
  "status": "success",
  "application": {
    "_id": "64f1...",
    "applicationNumber": "APP-1001",
    "fullName": "Jane Doe",
    "status": "reviewing"
  }
}
```

### 34) Get all apprenticeship applications (admin only)

```http
GET /api/apprenticeships
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "status": "success",
  "results": 10,
  "applications": [
    {
      "_id": "64f1...",
      "applicationNumber": "APP-1001",
      "fullName": "Jane Doe",
      "status": "pending"
    }
  ]
}
```

### 35) Get one apprenticeship application (admin only)

```http
GET /api/apprenticeships/:id
```

Expected response:

```json
{
  "status": "success",
  "application": {
    "_id": "64f1...",
    "applicationNumber": "APP-1001",
    "fullName": "Jane Doe",
    "trainingArea": "Fashion design",
    "status": "reviewing"
  }
}
```

### 36) Review or update an apprenticeship application (admin only)

```http
PATCH /api/apprenticeships/:id
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Request body:

```json
{
  "status": "accepted",
  "adminNote": "Applicant shows good potential and strong interest in tailoring."
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Apprenticeship application updated successfully",
  "application": {
    "_id": "64f1...",
    "status": "accepted",
    "adminNote": "Applicant shows good potential..."
  }
}
```

## Chat Routes

The app supports live real-time chat using Socket.IO. HTTP endpoints are used to create and fetch conversations.

### 37) Create a conversation

```http
POST /api/chat/conversations
```

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "type": "general"
}
```

Valid types:

- general
- order
- bespoke

For order conversations:

```json
{
  "type": "order",
  "order": "64d2..."
}
```

For bespoke conversations:

```json
{
  "type": "bespoke",
  "designRequest": "64e1..."
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Conversation created successfully",
  "conversation": {
    "_id": "64a9...",
    "customer": "64ab...",
    "type": "general",
    "status": "open"
  }
}
```

### 38) Get my conversations

```http
GET /api/chat/conversations/my
```

Expected response:

```json
{
  "status": "success",
  "results": 2,
  "conversations": [
    {
      "_id": "64a9...",
      "type": "general",
      "status": "open",
      "lastMessage": "Hello",
      "lastMessageAt": "2026-08-30T12:00:00.000Z"
    }
  ]
}
```

### 39) Get messages in a conversation

```http
GET /api/chat/conversations/:id/messages
```

Expected response:

```json
{
  "status": "success",
  "results": 3,
  "messages": [
    {
      "_id": "64b8...",
      "conversation": "64a9...",
      "sender": {
        "_id": "64ab...",
        "name": "Jane Doe",
        "role": "customer"
      },
      "senderRole": "customer",
      "message": "Hi, I need help with my order.",
      "createdAt": "2026-08-30T12:10:00.000Z"
    }
  ]
}
```

### 40) Get all conversations (admin only)

```http
GET /api/chat/conversations
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "status": "success",
  "results": 5,
  "conversations": [
    {
      "_id": "64a9...",
      "customer": {
        "_id": "64ab...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "type": "general",
      "status": "open"
    }
  ]
}
```

## Admin Dashboard Routes

### 41) Get dashboard stats

```http
GET /api/admin/dashboard
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Expected response:

```json
{
  "status": "success",
  "dashboard": {
    "totalUsers": 130,
    "totalProducts": 90,
    "totalOrders": 310,
    "pendingOrders": 12,
    "totalDesignRequests": 18,
    "pendingDesignRequests": 5,
    "totalApplications": 7,
    "pendingApplications": 2,
    "totalRevenue": 2500000
  }
}
```

### 42) Get recent orders

```http
GET /api/admin/recent-orders
```

### 43) Get recent customers

```http
GET /api/admin/recent-customers
```

### 44) Get low-stock products

```http
GET /api/admin/low-stock
```

### 45) Get audit logs

```http
GET /api/admin/audit-logs?page=1&limit=20
```

Expected response:

```json
{
  "status": "success",
  "results": 20,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 82,
    "pages": 5
  },
  "logs": [
    {
      "_id": "64d8...",
      "action": "CREATE",
      "resource": "Product",
      "description": "Created product Classic Satin Gown",
      "createdAt": "2026-08-30T12:00:00.000Z"
    }
  ]
}
```

## Socket.IO Chat Events

The app also exposes a real-time chat layer for the frontend.

### Authentication

The frontend must send a JWT token in the socket handshake:

```javascript
const socket = io("http://localhost:5000", {
  auth: {
    token: "your_jwt_token",
  },
});
```

### Events supported

- joinConversation
- typing
- stopTyping
- sendMessage
- markMessagesAsRead
- userOnline
- conversationJoined
- newMessage
- userTyping
- userStoppedTyping
- chatError

Example message payload:

```javascript
socket.emit("sendMessage", {
  conversationId: "64a9...",
  message: "Hi, I would like to know the status of my order.",
});
```

Example incoming event:

```javascript
socket.on("newMessage", (message) => {
  console.log(message);
});
```

## Admin Setup

A bootstrap script exists to create an admin account if needed:

```bash
npm run create-admin
```

It is strongly recommended to update default credentials before deploying to a real environment.

## Notes

- This backend is already structured for a full boutique e-commerce workflow.
- It includes customer and admin flows, production-ready route separation, and external service integrations.
- The project still benefits from additional validation and test coverage depending on deployment scale.
- Real-time chat and payment flows should be tested in a staging environment before production release.

## License

ISC
