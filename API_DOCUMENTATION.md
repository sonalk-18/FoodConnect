# FoodConnect API Documentation

Complete list of all API endpoints in the FoodConnect application.

**Base URL:** `http://localhost:3000/api` (or your server URL)

**Authentication:** Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 👥 User Roles & Permissions

### **Receiver** (Default Role - General User)
Default role assigned to new users. Can:
- ✅ Browse foods (public catalog)
- ✅ Add items to cart
- ✅ Place orders
- ✅ Submit donations
- ✅ Apply as partner/NGO
- ✅ View & redeem rewards
- ✅ Play games and earn points
- ✅ View own orders, donations, and points

### **Donor** (Admin-Level Role)
Elevated role with system management permissions. Can do everything a Receiver can, plus:
- ✅ Manage foods (create, update, delete)
- ✅ View & manage all orders (not just own)
- ✅ View & manage all donations
- ✅ Approve/reject partner applications
- ✅ Manage rewards (create, update, delete)
- ✅ Manage games (create, update, delete)
- ✅ Manage users (view all users, change roles)
- ✅ Upload food images

**Note:** The `donor` role functions as the admin/manager role in the system.

---

## 🔐 Authentication APIs (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup` | ❌ No | Register a new user (donor or receiver) |
| POST | `/api/auth/login` | ❌ No | Login with email/password, receive JWT tokens |
| POST | `/api/auth/refresh` | ❌ No | Refresh access token using refresh token |
| GET | `/api/auth/me` | ✅ Yes | Get current user profile and points |

### Request Examples

**Signup:**
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "receiver"  // Default: "receiver" (general user). Use "donor" for admin-level access
}
```
**Note:** If `role` is not provided, defaults to `"receiver"` (general user role).

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 👥 User Management APIs (`/api/users`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| GET | `/api/users` | ✅ Yes | `donor` | Get list of all users |
| PUT | `/api/users/:id/role` | ✅ Yes | `donor` | Update user role (donor/receiver) |

### Request Example

**Update User Role:**
```json
PUT /api/users/123/role
{
  "role": "receiver"
}
```

---

## 🍕 Food Catalog APIs (`/api/foods`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| GET | `/api/foods` | ❌ No | - | Get all food items (public) |
| GET | `/api/foods/search?query=pizza` | ❌ No | - | Search foods by keyword |
| GET | `/api/foods/filter?category=Fast Food&price=100` | ❌ No | - | Filter foods by category/price |
| GET | `/api/foods/:id` | ❌ No | - | Get single food item by ID |
| POST | `/api/foods` | ✅ Yes | `donor` | Create new food item (with image upload) |
| PUT | `/api/foods/:id` | ✅ Yes | `donor` | Update food item (with optional image) |
| DELETE | `/api/foods/:id` | ✅ Yes | `donor` | Delete food item |

### Request Examples

**Create Food (form-data):**
```
POST /api/foods
Content-Type: multipart/form-data

name: "Pizza Margherita"
description: "Delicious Italian pizza"
price: 180
category: "Fast Food"
image: <file>
```

**Search Foods:**
```
GET /api/foods/search?query=pizza
```

**Filter Foods:**
```
GET /api/foods/filter?category=Fast Food&minPrice=100&maxPrice=500
```

---

## 🛒 Shopping Cart APIs (`/api/cart`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/cart/add` | ✅ Yes | Add or update item in cart |
| GET | `/api/cart` | ✅ Yes | Get current user's cart |
| DELETE | `/api/cart/remove/:foodId` | ✅ Yes | Remove item from cart |

### Request Example

**Add to Cart:**
```json
POST /api/cart/add
{
  "foodId": 10,
  "qty": 2
}
```

---

## 📦 Order APIs (`/api/orders`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/api/orders` | ✅ Yes | - | Create new order from cart |
| GET | `/api/orders/my` | ✅ Yes | - | Get current user's order history |
| GET | `/api/orders` | ✅ Yes | `donor` | Get all orders (donor only) |
| PUT | `/api/orders/:id/status` | ✅ Yes | `donor` | Update order status |

### Request Examples

**Create Order:**
```json
POST /api/orders
{
  "items": [
    { "foodId": 10, "qty": 2 },
    { "foodId": 5, "qty": 1 }
  ]
}
```

**Update Order Status:**
```json
PUT /api/orders/123/status
{
  "status": "processing"  // placed, processing, completed, cancelled
}
```

---

## 🎁 Donation APIs (`/api/donations`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/api/donations` | ✅ Yes | - | Submit a donation request |
| GET | `/api/donations/me` | ✅ Yes | - | Get current user's donations |
| GET | `/api/donations` | ✅ Yes | `donor` | Get all donations (donor only) |
| GET | `/api/donations/:id` | ✅ Yes | - | Get single donation (own only) |
| PATCH | `/api/donations/:id/status` | ✅ Yes | `donor` | Update donation status |

### Request Example

**Create Donation:**
```json
POST /api/donations
{
  "donorType": "individual",  // individual, restaurant, event, other
  "contactName": "John Doe",
  "contactPhone": "1234567890",
  "contactEmail": "john@example.com",
  "foodType": "Cooked meals",
  "quantity": "50 plates",
  "pickupAddress": "123 Main St, City",
  "pickupWindow": "2:00 PM - 4:00 PM",
  "notes": "Freshly prepared"
}
```

**Update Donation Status:**
```json
PATCH /api/donations/123/status
{
  "status": "scheduled",  // pending, scheduled, picked_up, completed, cancelled
  "assignedVolunteer": "Volunteer Name"
}
```

---

## 🤝 Partner/NGO APIs (`/api/partners`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/api/partners` | ✅ Yes | - | Submit partner/NGO application |
| GET | `/api/partners/me` | ✅ Yes | - | Get current user's partner applications |
| GET | `/api/partners` | ✅ Yes | `donor` | Get all partner applications (donor only) |
| GET | `/api/partners/:id` | ✅ Yes | - | Get single partner application (own only) |
| PATCH | `/api/partners/:id/status` | ✅ Yes | `donor` | Update partner application status |

### Request Example

**Create Partner Application:**
```json
POST /api/partners
{
  "organizationName": "Food Bank NGO",
  "organizationType": "ngo",  // ngo, restaurant, volunteer, sponsor
  "contactPerson": "Jane Smith",
  "email": "contact@foodbank.org",
  "phone": "1234567890",
  "location": "City, State",
  "website": "https://foodbank.org",
  "message": "We want to partner with FoodConnect"
}
```

**Update Partner Status:**
```json
PATCH /api/partners/123/status
{
  "status": "approved",  // pending, in_review, approved, rejected
  "notes": "Application approved"
}
```

---

## 🏆 Rewards APIs (`/api/rewards`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| GET | `/api/rewards` | ❌ No | - | Get all active rewards (public) |
| POST | `/api/rewards` | ✅ Yes | `donor` | Create new reward |
| PUT | `/api/rewards/:id` | ✅ Yes | `donor` | Update reward |
| DELETE | `/api/rewards/:id` | ✅ Yes | `donor` | Delete reward |
| POST | `/api/rewards/redeem` | ✅ Yes | - | Redeem reward with points |

### Request Examples

**Create Reward:**
```json
POST /api/rewards
{
  "title": "Free Meal Voucher",
  "description": "Get a free meal at partner restaurants",
  "pointsRequired": 100,
  "inventory": 50,
  "isActive": true
}
```

**Redeem Reward:**
```json
POST /api/rewards/redeem
{
  "rewardId": 5
}
```

---

## 🎮 Games APIs (`/api/games`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| GET | `/api/games` | ❌ No | - | Get all active games (public) |
| POST | `/api/games` | ✅ Yes | `donor` | Create new game |
| PUT | `/api/games/:id` | ✅ Yes | `donor` | Update game |
| DELETE | `/api/games/:id` | ✅ Yes | `donor` | Delete game |

### Request Example

**Create Game:**
```json
POST /api/games
{
  "title": "Food Quiz",
  "description": "Test your food knowledge",
  "url": "https://example.com/game",
  "iconUrl": "https://example.com/icon.png",
  "pointsPerPlay": 10,
  "tags": "quiz, education",
  "isActive": true
}
```

---

## 💰 Points APIs (`/api/points`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/points/add` | ✅ Yes | Add points after gameplay or manually |
| GET | `/api/points/me` | ✅ Yes | Get current user's points balance and history |

### Request Example

**Add Points:**
```json
POST /api/points/add
{
  "points": 50,
  "sourceType": "game",  // game, donation, manual
  "sourceId": 123,
  "note": "Completed Food Quiz"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Points added successfully",
  "balance": 150,
  "entry": { ... }
}
```

---

## 📤 Upload APIs (`/api/upload`)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/api/upload/food` | ✅ Yes | `donor` | Upload food image (standalone) |

### Request Example

**Upload Image (form-data):**
```
POST /api/upload/food
Content-Type: multipart/form-data

image: <file>
```

**Response:**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "path": "/uploads/1234567890-123456789.png"
}
```

---

## 🏥 Health Check

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | ❌ No | Health check endpoint |

**Response:**
```json
{
  "status": "ok",
  "time": "2025-01-27T10:30:00.000Z"
}
```

---

## 📝 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ]  // Validation errors if applicable
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## 🔑 Authentication Flow

1. **Signup/Login** → Receive `token` and `refreshToken`
2. **Store tokens** in localStorage or secure storage
3. **Include token** in Authorization header for protected routes
4. **Refresh token** when access token expires using `/api/auth/refresh`

### Token Format
```
Authorization: Bearer <access_token>
```

---

## 📋 Role-Based Access Summary

### **Public** (No authentication required)
- Browse foods (`GET /api/foods`)
- View rewards (`GET /api/rewards`)
- View games (`GET /api/games`)

### **Authenticated Users** (Any role: receiver or donor)
- Shopping cart operations
- Place and view own orders
- Submit and view own donations
- Submit and view own partner applications
- View and manage own points
- Play games and earn points
- Redeem rewards

### **Donor Only** (Admin-level permissions)
- User management (view all users, change roles)
- Food management (create, update, delete foods)
- Order management (view all orders, update status)
- Donation management (view all donations, update status)
- Partner management (view all applications, approve/reject)
- Reward management (create, update, delete rewards)
- Game management (create, update, delete games)
- Image uploads

---

## 🎯 Quick Reference

### Most Used Endpoints

**Public:**
- `GET /api/foods` - Browse food catalog
- `GET /api/rewards` - View rewards
- `GET /api/games` - View games

**User Actions:**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile
- `POST /api/cart/add` - Add to cart
- `POST /api/orders` - Place order
- `POST /api/donations` - Submit donation
- `GET /api/points/me` - Check points

**Donor Actions:**
- `POST /api/foods` - Add food item
- `GET /api/orders` - View all orders
- `GET /api/donations` - View all donations
- `PATCH /api/donations/:id/status` - Update donation status

---

*Last Updated: 2025-01-27*

