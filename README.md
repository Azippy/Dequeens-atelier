# DeQueens Atelier API

Backend API for DeQueens Atelier, a fashion catalog and storefront service built with Node.js, Express, and MongoDB.

## Features

- Customer registration and login
- JWT-based authentication
- Role-based authorization for admin operations
- Product and category management
- Product search, filtering, sorting, and pagination
- Soft deletion of products through `isActive`
- Centralized error handling

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- npm

## Installation

```bash
git clone <repository-url>
cd fashion
npm install
```

Create a private `.env` file in the project root with the configuration required by the application. Do not add its contents to this README, commit it, or share it publicly.

Use strong, unique values for database credentials and signing secrets. Rotate any credentials that may already have been exposed.

## Running the API

```bash
# Development mode with automatic restarts
npm run dev

# Production-style start
npm start
```

The API runs at `http://localhost:5000` by default.

Health check:

```http
GET /
```

## Create an admin user

The included script creates an admin account if it does not already exist:

```bash
npm run create-admin
```

Review the admin bootstrap script before running it and change its initial credentials. Never publish those credentials or commit them to source control. For production use, move admin credentials into secure environment variables or a secrets manager.

## Authentication

Register or log in to receive a JWT:

```http
Authorization: Bearer <token>
```

Protected routes return `401` when the token is missing or invalid. Admin-only routes return `403` when the authenticated user does not have the `admin` role.

## API endpoints

### Authentication

| Method | Endpoint             | Auth   | Description                          |
| ------ | -------------------- | ------ | ------------------------------------ |
| `POST` | `/api/auth/register` | Public | Create a customer account            |
| `POST` | `/api/auth/login`    | Public | Authenticate a user and return a JWT |

Registration body:

```json
{
  "name": "Ada User",
  "email": "ada@example.com",
  "password": "strong-password"
}
```

Login body:

```json
{
  "email": "ada@example.com",
  "password": "strong-password"
}
```

### Users

| Method | Endpoint                     | Auth  | Description                         |
| ------ | ---------------------------- | ----- | ----------------------------------- |
| `GET`  | `/api/users/me`              | User  | Return the authenticated user       |
| `GET`  | `/api/users/admin-dashboard` | Admin | Return the admin dashboard response |

### Categories

| Method | Endpoint          | Auth   | Description            |
| ------ | ----------------- | ------ | ---------------------- |
| `GET`  | `/api/categories` | Public | List active categories |
| `POST` | `/api/categories` | Admin  | Create a category      |

Category body:

```json
{
  "name": "Dresses",
  "slug": "dresses",
  "description": "Ready-to-wear and bespoke dresses",
  "image": "https://example.com/dresses.jpg"
}
```

### Products

| Method   | Endpoint            | Auth   | Description            |
| -------- | ------------------- | ------ | ---------------------- |
| `GET`    | `/api/products`     | Public | List active products   |
| `GET`    | `/api/products/:id` | Public | Get one active product |
| `POST`   | `/api/products`     | Admin  | Create a product       |
| `PATCH`  | `/api/products/:id` | Admin  | Update a product       |
| `DELETE` | `/api/products/:id` | Admin  | Soft-delete a product  |

Product list query parameters include:

- `search`
- `category`
- `gender`: `men`, `women`, `kids`, or `unisex`
- `minPrice` and `maxPrice`
- `featured`: `true` or `false`
- `readyToWear`: `true` or `false`
- `bespoke`: `true` or `false`
- `page` and `limit` (maximum limit: `50`)
- `sort` (default: `-createdAt`)

Example:

```http
GET /api/products?gender=women&minPrice=100&featured=true&page=1&limit=12
```

Product body:

```json
{
  "name": "Silk Evening Dress",
  "slug": "silk-evening-dress",
  "description": "A tailored silk evening dress.",
  "price": 250,
  "category": "<category-id>",
  "subCategory": "Evening wear",
  "gender": "women",
  "sizes": ["S", "M", "L"],
  "colors": ["Black"],
  "images": ["https://example.com/dress.jpg"],
  "stock": 5,
  "isReadyToWear": true,
  "isBespoke": false,
  "isFeatured": true
}
```

## Project structure

```text
config/       Database configuration
controllers/  Request handlers
middleware/   Authentication, authorization, and error handling
models/       Mongoose schemas
routes/       Express route definitions
Scripts/      Utility scripts such as admin creation
utils/        Shared application utilities
app.js        Express application setup
server.js     Database connection and server startup
```

## Testing

No automated tests are configured yet. The current `npm test` script exits with a placeholder error. API requests can be exercised with Postman, Insomnia, curl, or the REST Client extension for VS Code.

## License

ISC
