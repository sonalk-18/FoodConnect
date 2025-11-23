# Food Request System Implementation

## Overview

The food request system allows **Receivers** to request food from the catalog, and **Donors** to view, approve, reject, and manage all food requests.

---

## ✅ Implementation Complete

### **Receiver Features**

1. **Request Food from Dashboard**
   - Browse food items from the live menu
   - Add items to cart
   - Place order (which becomes a food request)
   - View own food request history
   - Track request status

2. **Receiver Dashboard Shows:**
   - Shopping cart
   - "Place Order (Request Food)" button
   - "My Food Requests" section with status tracking

### **Donor Features**

1. **View All Food Requests**
   - See all orders placed by receivers
   - View receiver name and email
   - See requested items and quantities
   - View total amount
   - See request date and status

2. **Manage Food Requests**
   - **Approve** requests (status: `placed` → `approved`)
   - **Reject** requests (status: `placed` → `rejected`)
   - **Mark Ready for Pickup** (status: `approved` → `ready_for_pickup`)
   - **Mark Completed** (status: `ready_for_pickup` → `completed`)
   - **Cancel** requests (status: `approved`/`ready_for_pickup` → `cancelled`)

3. **Donor Dashboard Shows:**
   - "All Food Requests from Receivers" section
   - Total request count
   - Detailed request cards with management buttons
   - Status badges for quick identification

---

## 🔄 Order Status Workflow

```
placed (default)
  ↓
  ├─→ approved (Donor approves)
  │     ↓
  │     ├─→ ready_for_pickup (Donor marks ready)
  │     │     ↓
  │     │     └─→ completed (Donor marks completed)
  │     │
  │     └─→ cancelled (Donor cancels)
  │
  └─→ rejected (Donor rejects)
```

**Status Values:**
- `placed` - Initial status when receiver submits request
- `approved` - Donor approved the request
- `rejected` - Donor rejected the request
- `processing` - (Optional) Request being processed
- `ready_for_pickup` - Food is ready for receiver to pick up
- `completed` - Request fulfilled
- `cancelled` - Request cancelled

---

## 📡 API Endpoints Used

### **Receiver Endpoints:**

1. **Place Food Request:**
   ```
   POST /api/orders
   Authorization: Bearer <token>
   {
     "items": [
       { "foodId": 10, "qty": 2 },
       { "foodId": 5, "qty": 1 }
     ]
   }
   ```

2. **View Own Requests:**
   ```
   GET /api/orders/my
   Authorization: Bearer <token>
   ```

### **Donor Endpoints:**

1. **View All Requests:**
   ```
   GET /api/orders
   Authorization: Bearer <donor_token>
   ```

2. **Update Request Status:**
   ```
   PUT /api/orders/:id/status
   Authorization: Bearer <donor_token>
   {
     "status": "approved"  // or "rejected", "ready_for_pickup", "completed", "cancelled"
   }
   ```

---

## 🎨 UI Components

### **Receiver Dashboard:**

- **Cart Section:**
  - List of items in cart
  - "Place Order (Request Food)" button
  - Status messages

- **My Food Requests Section:**
  - List of own orders
  - Status badges
  - Item details
  - Order date and total

### **Donor Dashboard:**

- **All Food Requests Section:**
  - Grid of request cards
  - Each card shows:
    - Request ID
    - Receiver name and email
    - Requested items with quantities
    - Total amount
    - Request date
    - Current status badge
    - Action buttons (based on status)

- **Status Management Buttons:**
  - **Approve** (green) - For `placed` status
  - **Reject** (red) - For `placed` status
  - **Ready for Pickup** (blue) - For `approved` status
  - **Mark Completed** (green) - For `ready_for_pickup` status
  - **Cancel** (gray) - For `approved`/`ready_for_pickup` status

---

## 🔧 Technical Implementation

### **Backend Changes:**

1. **Updated Validators** (`backend/src/utils/validators.js`):
   - Added new status values: `approved`, `rejected`, `ready_for_pickup`

2. **Updated Order Model** (`backend/src/models/orderModel.js`):
   - `updateOrderStatus()` now returns full order with user info
   - Includes customer name and email for donor view

3. **Updated Order Controller** (`backend/src/controllers/orderController.js`):
   - Enhanced `getOrders()` with user info join
   - Improved `updateOrderStatus()` response

### **Frontend Changes:**

1. **Dashboard HTML** (`frontend/public/dashboard.html`):
   - Added separate sections for receiver and donor views
   - Receiver section: Cart + Own Orders
   - Donor section: All Food Requests Management

2. **JavaScript** (`frontend/public/script.js`):
   - Added `loadAllOrders()` - Loads all orders for donors
   - Added `renderAllOrders()` - Renders order cards with management UI
   - Added `updateOrderStatus()` - Updates order status
   - Updated `initializeDashboard()` - Shows correct view based on role
   - Role-based dashboard initialization

3. **CSS** (`frontend/public/style.css`):
   - Added `.order-card` styles
   - Added `.order-header`, `.order-customer`, `.order-items` styles
   - Added `.order-actions` with button styles
   - Added status badge colors
   - Responsive design for mobile

---

## 🎯 User Flow

### **Receiver Flow:**

1. Login to dashboard
2. Browse food items (from homepage or dashboard)
3. Add items to cart
4. Click "Place Order (Request Food)"
5. Request is submitted with status `placed`
6. View request in "My Food Requests" section
7. Track status updates (approved → ready_for_pickup → completed)

### **Donor Flow:**

1. Login to dashboard
2. View "All Food Requests from Receivers" section
3. See all requests with receiver details
4. Click action buttons to update status:
   - **Approve** → Request moves to `approved`
   - **Reject** → Request moves to `rejected`
   - **Ready for Pickup** → Request moves to `ready_for_pickup`
   - **Mark Completed** → Request moves to `completed`
   - **Cancel** → Request moves to `cancelled`
5. Status updates are reflected immediately

---

## 📊 Database Schema

The existing `orders` table is used:

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(40) DEFAULT 'placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Status Values:**
- `placed` (default)
- `approved`
- `rejected`
- `processing`
- `ready_for_pickup`
- `completed`
- `cancelled`

---

## ✨ Features

✅ **Receiver can request food** from dashboard
✅ **Donor can see all requests** in one place
✅ **Status management** with intuitive buttons
✅ **Real-time updates** when status changes
✅ **Role-based dashboard** views
✅ **Responsive design** for mobile and desktop
✅ **User-friendly UI** with clear status indicators
✅ **Customer information** displayed for donors

---

## 🚀 Future Enhancements (Optional)

- [ ] Email notifications when request status changes
- [ ] Filter requests by status
- [ ] Search requests by receiver name
- [ ] Bulk approve/reject actions
- [ ] Request history and analytics
- [ ] Pickup location management
- [ ] Estimated ready time
- [ ] Request comments/notes

---

*Implementation Date: 2025-01-27*


