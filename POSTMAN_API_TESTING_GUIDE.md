# Postman API Testing Guide for FoodConnect

Complete guide to test all FoodConnect APIs using Postman.

**Base URL:** `http://localhost:3000/api`

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Authentication APIs](#authentication-apis)
3. [User Management APIs](#user-management-apis)
4. [Food Catalog APIs](#food-catalog-apis)
5. [Cart APIs](#cart-apis)
6. [Order/Food Request APIs](#orderfood-request-apis)
7. [Donation APIs](#donation-apis)
8. [Partner APIs](#partner-apis)
9. [Rewards APIs](#rewards-apis)
10. [Games APIs](#games-apis)
11. [Points APIs](#points-apis)
12. [Upload APIs](#upload-apis)
13. [Environment Variables](#environment-variables)

---

## 🔧 Setup

### 1. Create Postman Environment

1. Open Postman
2. Click **Environments** → **+** (Create new)
3. Name it: `FoodConnect Local`
4. Add variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: (leave empty, will be set automatically)
   - `refresh_token`: (leave empty, will be set automatically)
   - `user_id`: (leave empty, will be set automatically)
   - `food_id`: (leave empty, will be set manually)
   - `order_id`: (leave empty, will be set manually)

### 2. Create Collection

1. Click **Collections** → **+** (New Collection)
2. Name it: `FoodConnect APIs`
3. Set collection variable: `base_url` = `http://localhost:3000/api`

---

## 🔐 Authentication APIs

### 1. Signup (Receiver)

**Request:**
```
POST {{base_url}}/auth/signup
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Receiver",
  "email": "receiver@test.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "receiver"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Receiver",
    "email": "receiver@test.com",
    "role": "receiver",
    "points": 0
  }
}
```

**Postman Test Script (to save token):**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("refresh_token", jsonData.refreshToken);
    pm.environment.set("user_id", jsonData.user.id);
}
```

---

### 2. Signup (Donor)

**Request:**
```
POST {{base_url}}/auth/signup
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Admin Donor",
  "email": "donor@test.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "donor"
}
```

**Save token to environment (use same test script as above)**

---

### 3. Login

**Request:**
```
POST {{base_url}}/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "receiver@test.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("refresh_token", jsonData.refreshToken);
    pm.environment.set("user_id", jsonData.user.id);
}
```

---

### 4. Get Profile (Me)

**Request:**
```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "John Receiver",
    "email": "receiver@test.com",
    "role": "receiver",
    "points": 50
  }
}
```

---

### 5. Refresh Token

**Request:**
```
POST {{base_url}}/auth/refresh
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

---

## 👥 User Management APIs (Donor Only)

### 1. Get All Users

**Request:**
```
GET {{base_url}}/users
Authorization: Bearer {{token}}
```

**Note:** Requires `donor` role token

---

### 2. Update User Role

**Request:**
```
PUT {{base_url}}/users/{{user_id}}/role
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "role": "donor"
}
```

---

## 🍕 Food Catalog APIs

### 1. Get All Foods (Public)

**Request:**
```
GET {{base_url}}/foods
```

**No authentication required**

---

### 2. Search Foods

**Request:**
```
GET {{base_url}}/foods/search?query=pizza
```

---

### 3. Filter Foods

**Request:**
```
GET {{base_url}}/foods/filter?category=Fast Food&minPrice=100&maxPrice=500
```

---

### 4. Get Single Food

**Request:**
```
GET {{base_url}}/foods/1
```

**Save food_id:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("food_id", jsonData.food?.id || jsonData.id);
}
```

---

### 5. Create Food (Donor Only)

**Request:**
```
POST {{base_url}}/foods
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `name`: Pizza Margherita
- `description`: Delicious Italian pizza
- `price`: 180
- `category`: Fast Food
- `image`: (Select File) - Choose an image file

**Note:** Requires `donor` role

---

### 6. Update Food (Donor Only)

**Request:**
```
PUT {{base_url}}/foods/{{food_id}}
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `name`: Updated Pizza Name
- `description`: Updated description
- `price`: 200
- `category`: Fast Food
- `image`: (Optional - Select File)

---

### 7. Delete Food (Donor Only)

**Request:**
```
DELETE {{base_url}}/foods/{{food_id}}
Authorization: Bearer {{token}}
```

---

## 🛒 Cart APIs

### 1. Add to Cart

**Request:**
```
POST {{base_url}}/cart/add
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "foodId": 1,
  "qty": 2
}
```

---

### 2. Get Cart

**Request:**
```
GET {{base_url}}/cart
Authorization: Bearer {{token}}
```

---

### 3. Remove from Cart

**Request:**
```
DELETE {{base_url}}/cart/remove/1
Authorization: Bearer {{token}}
```

---

## 📦 Order/Food Request APIs

### 1. Place Order (Receiver - Creates Food Request)

**Request:**
```
POST {{base_url}}/orders
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    { "foodId": 1, "qty": 2 },
    { "foodId": 2, "qty": 1 }
  ]
}
```

**Save order_id:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("order_id", jsonData.orderId || jsonData.order?.id);
}
```

---

### 2. Get My Orders (Receiver)

**Request:**
```
GET {{base_url}}/orders/my
Authorization: Bearer {{token}}
```

---

### 3. Get All Orders (Donor - All Food Requests)

**Request:**
```
GET {{base_url}}/orders
Authorization: Bearer {{token}}
```

**Note:** Requires `donor` role

---

### 4. Update Order Status (Donor)

**Request:**
```
PUT {{base_url}}/orders/{{order_id}}/status
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (Approve):**
```json
{
  "status": "approved"
}
```

**Body (Reject):**
```json
{
  "status": "rejected"
}
```

**Body (Ready for Pickup):**
```json
{
  "status": "ready_for_pickup"
}
```

**Body (Complete):**
```json
{
  "status": "completed"
}
```

**Body (Cancel):**
```json
{
  "status": "cancelled"
}
```

**Valid Statuses:**
- `placed` (default)
- `approved`
- `rejected`
- `processing`
- `ready_for_pickup`
- `completed`
- `cancelled`

---

## 🎁 Donation APIs

### 1. Create Donation

**Request:**
```
POST {{base_url}}/donations
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "donorType": "individual",
  "contactName": "John Doe",
  "contactPhone": "1234567890",
  "contactEmail": "john@example.com",
  "foodType": "Cooked meals",
  "quantity": "50 plates",
  "pickupAddress": "123 Main St, City, State",
  "pickupWindow": "2:00 PM - 4:00 PM",
  "notes": "Freshly prepared meals"
}
```

**Donor Types:**
- `individual`
- `restaurant`
- `event`
- `other`

---

### 2. Get My Donations

**Request:**
```
GET {{base_url}}/donations/me
Authorization: Bearer {{token}}
```

---

### 3. Get All Donations (Donor)

**Request:**
```
GET {{base_url}}/donations
Authorization: Bearer {{token}}
```

**Note:** Requires `donor` role

---

### 4. Get Single Donation

**Request:**
```
GET {{base_url}}/donations/1
Authorization: Bearer {{token}}
```

**Note:** Can only view own donations (unless donor)

---

### 5. Update Donation Status (Donor)

**Request:**
```
PATCH {{base_url}}/donations/1/status
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "scheduled",
  "assignedVolunteer": "Volunteer Name"
}
```

**Valid Statuses:**
- `pending`
- `scheduled`
- `picked_up`
- `completed`
- `cancelled`

---

## 🤝 Partner APIs

### 1. Create Partner Application

**Request:**
```
POST {{base_url}}/partners
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "organizationName": "Food Bank NGO",
  "organizationType": "ngo",
  "contactPerson": "Jane Smith",
  "email": "contact@foodbank.org",
  "phone": "1234567890",
  "location": "City, State",
  "website": "https://foodbank.org",
  "message": "We want to partner with FoodConnect"
}
```

**Organization Types:**
- `ngo`
- `restaurant`
- `volunteer`
- `sponsor`

---

### 2. Get My Partner Applications

**Request:**
```
GET {{base_url}}/partners/me
Authorization: Bearer {{token}}
```

---

### 3. Get All Partners (Donor)

**Request:**
```
GET {{base_url}}/partners
Authorization: Bearer {{token}}
```

**Note:** Requires `donor` role

---

### 4. Get Single Partner Application

**Request:**
```
GET {{base_url}}/partners/1
Authorization: Bearer {{token}}
```

**Note:** Can only view own applications (unless donor)

---

### 5. Update Partner Status (Donor)

**Request:**
```
PATCH {{base_url}}/partners/1/status
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved",
  "notes": "Application approved"
}
```

**Valid Statuses:**
- `pending`
- `in_review`
- `approved`
- `rejected`

---

## 🏆 Rewards APIs

### 1. Get All Rewards (Public)

**Request:**
```
GET {{base_url}}/rewards
```

**No authentication required**

---

### 2. Create Reward (Donor)

**Request:**
```
POST {{base_url}}/rewards
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Free Meal Voucher",
  "description": "Get a free meal at partner restaurants",
  "pointsRequired": 100,
  "inventory": 50,
  "isActive": true
}
```

---

### 3. Update Reward (Donor)

**Request:**
```
PUT {{base_url}}/rewards/1
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Reward",
  "pointsRequired": 150,
  "inventory": 30
}
```

---

### 4. Delete Reward (Donor)

**Request:**
```
DELETE {{base_url}}/rewards/1
Authorization: Bearer {{token}}
```

---

### 5. Redeem Reward

**Request:**
```
POST {{base_url}}/rewards/redeem
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "rewardId": 1
}
```

---

## 🎮 Games APIs

### 1. Get All Games (Public)

**Request:**
```
GET {{base_url}}/games
```

**No authentication required**

---

### 2. Create Game (Donor)

**Request:**
```
POST {{base_url}}/games
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
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

### 3. Update Game (Donor)

**Request:**
```
PUT {{base_url}}/games/1
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Game",
  "pointsPerPlay": 15
}
```

---

### 4. Delete Game (Donor)

**Request:**
```
DELETE {{base_url}}/games/1
Authorization: Bearer {{token}}
```

---

## 💰 Points APIs

### 1. Add Points

**Request:**
```
POST {{base_url}}/points/add
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "points": 50,
  "sourceType": "game",
  "sourceId": 1,
  "note": "Completed Food Quiz"
}
```

**Source Types:**
- `game`
- `donation`
- `manual`

---

### 2. Get My Points

**Request:**
```
GET {{base_url}}/points/me
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "status": "success",
  "balance": 150,
  "history": [
    {
      "id": 1,
      "points": 50,
      "sourceType": "donation",
      "direction": "credit",
      "note": "Thanks for donating food!",
      "created_at": "2025-01-27T10:30:00.000Z"
    }
  ]
}
```

---

## 📤 Upload APIs

### 1. Upload Food Image (Donor)

**Request:**
```
POST {{base_url}}/upload/food
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `image`: (Select File) - Choose an image file (jpg, png, webp)

**Expected Response:**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "path": "/uploads/1234567890-123456789.png"
}
```

---

## 🏥 Health Check

### Health Status

**Request:**
```
GET http://localhost:3000/health
```

**No authentication required**

**Expected Response:**
```json
{
  "status": "ok",
  "time": "2025-01-27T10:30:00.000Z"
}
```

---

## 📝 Postman Collection Setup Tips

### 1. Pre-request Scripts

Add to collection level:

```javascript
// Auto-set base URL
pm.collectionVariables.set("base_url", "http://localhost:3000/api");
```

### 2. Test Scripts for Token Management

Add to login/signup requests:

```javascript
// Save tokens automatically
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
    }
    if (jsonData.refreshToken) {
        pm.environment.set("refresh_token", jsonData.refreshToken);
    }
    if (jsonData.user) {
        pm.environment.set("user_id", jsonData.user.id);
    }
}
```

### 3. Common Test Script

Add to all authenticated requests:

```javascript
// Check if request was successful
pm.test("Status code is success", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Check response structure
pm.test("Response has status field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
});
```

---

## 🔑 Testing Workflow

### Complete Test Flow:

1. **Setup:**
   - Signup as Receiver → Save token
   - Signup as Donor → Save token (different email)

2. **Receiver Flow:**
   - Login as Receiver
   - Browse foods (GET /foods)
   - Add to cart (POST /cart/add)
   - Place order (POST /orders) → Creates food request
   - View own orders (GET /orders/my)

3. **Donor Flow:**
   - Login as Donor
   - View all orders (GET /orders) → See receiver's request
   - Approve request (PUT /orders/:id/status)
   - Mark ready (PUT /orders/:id/status)
   - Mark completed (PUT /orders/:id/status)

4. **Food Management (Donor):**
   - Create food (POST /foods)
   - Update food (PUT /foods/:id)
   - Delete food (DELETE /foods/:id)

5. **Other Features:**
   - Submit donation (POST /donations)
   - Apply as partner (POST /partners)
   - Play game and add points (POST /points/add)
   - Redeem reward (POST /rewards/redeem)

---

## ⚠️ Common Issues & Solutions

### 1. 401 Unauthorized
- **Cause:** Missing or invalid token
- **Solution:** Login again and update token

### 2. 403 Forbidden
- **Cause:** Wrong role (e.g., receiver trying donor-only endpoint)
- **Solution:** Use donor token for admin endpoints

### 3. 422 Validation Error
- **Cause:** Invalid request body
- **Solution:** Check required fields and data types

### 4. 404 Not Found
- **Cause:** Invalid ID or endpoint
- **Solution:** Verify ID exists and endpoint is correct

### 5. CORS Error
- **Cause:** Backend CORS not configured
- **Solution:** Ensure backend is running and CORS allows your origin

---

## 📦 Postman Collection Export

To share your collection:
1. Click collection → **...** → **Export**
2. Choose **Collection v2.1**
3. Save as `FoodConnect.postman_collection.json`

---

*Last Updated: 2025-01-27*


