# FoodConnect Role-Based Access Control (RBAC)

## Overview

FoodConnect uses a **two-role system** for access control:
- **Receiver** - Default role for general users
- **Donor** - Admin-level role with elevated permissions

---

## 👤 Role Definitions

### 1. **Receiver** (Default Role)

**Description:** General user role assigned by default to all new signups.

**Default Assignment:** ✅ Yes - All new users are assigned this role unless specified otherwise.

**Permissions:**

#### ✅ Can Do:
- **Browse & Order:**
  - View food catalog (public)
  - Search and filter foods
  - Add items to shopping cart
  - Place orders
  - View own order history

- **Donations:**
  - Submit donation requests
  - View own donations
  - Track donation status

- **Partners:**
  - Submit partner/NGO applications
  - View own application status

- **Gamification:**
  - View available games
  - Play games
  - Earn points from games
  - View points balance and history

- **Rewards:**
  - View available rewards
  - Redeem rewards with points

- **Profile:**
  - View own profile
  - Update own information

#### ❌ Cannot Do:
- Manage foods (create, update, delete)
- View all orders (only own)
- View all donations (only own)
- Manage partner applications
- Manage rewards
- Manage games
- Manage users
- Upload food images

---

### 2. **Donor** (Admin-Level Role)

**Description:** Elevated role with system management permissions. Functions as the admin/manager role.

**Default Assignment:** ❌ No - Must be explicitly assigned during signup or by another donor.

**Permissions:**

#### ✅ Can Do (Everything Receiver can do, PLUS):

- **Food Management:**
  - Create new food items
  - Update existing foods
  - Delete foods
  - Upload food images
  - Manage food catalog

- **Order Management:**
  - View ALL orders (not just own)
  - Update order status
  - Manage order workflow

- **Donation Management:**
  - View ALL donations
  - Update donation status
  - Assign volunteers
  - Manage donation workflow

- **Partner Management:**
  - View ALL partner applications
  - Approve/reject applications
  - Update application status
  - Manage partner relationships

- **Reward Management:**
  - Create new rewards
  - Update existing rewards
  - Delete rewards
  - Manage reward inventory

- **Game Management:**
  - Create new games
  - Update existing games
  - Delete games
  - Configure points per play

- **User Management:**
  - View all users
  - Change user roles (promote/demote)
  - Manage user accounts

---

## 🔐 API Access Matrix

| Endpoint Category | Public | Receiver | Donor |
|------------------|--------|----------|-------|
| **Food Catalog** |
| `GET /api/foods` | ✅ | ✅ | ✅ |
| `GET /api/foods/search` | ✅ | ✅ | ✅ |
| `GET /api/foods/:id` | ✅ | ✅ | ✅ |
| `POST /api/foods` | ❌ | ❌ | ✅ |
| `PUT /api/foods/:id` | ❌ | ❌ | ✅ |
| `DELETE /api/foods/:id` | ❌ | ❌ | ✅ |
| **Cart** |
| `POST /api/cart/add` | ❌ | ✅ | ✅ |
| `GET /api/cart` | ❌ | ✅ | ✅ |
| `DELETE /api/cart/remove/:id` | ❌ | ✅ | ✅ |
| **Orders** |
| `POST /api/orders` | ❌ | ✅ | ✅ |
| `GET /api/orders/my` | ❌ | ✅ | ✅ |
| `GET /api/orders` | ❌ | ❌ | ✅ |
| `PUT /api/orders/:id/status` | ❌ | ❌ | ✅ |
| **Donations** |
| `POST /api/donations` | ❌ | ✅ | ✅ |
| `GET /api/donations/me` | ❌ | ✅ | ✅ |
| `GET /api/donations/:id` | ❌ | ✅* | ✅ |
| `GET /api/donations` | ❌ | ❌ | ✅ |
| `PATCH /api/donations/:id/status` | ❌ | ❌ | ✅ |
| **Partners** |
| `POST /api/partners` | ❌ | ✅ | ✅ |
| `GET /api/partners/me` | ❌ | ✅ | ✅ |
| `GET /api/partners/:id` | ❌ | ✅* | ✅ |
| `GET /api/partners` | ❌ | ❌ | ✅ |
| `PATCH /api/partners/:id/status` | ❌ | ❌ | ✅ |
| **Rewards** |
| `GET /api/rewards` | ✅ | ✅ | ✅ |
| `POST /api/rewards/redeem` | ❌ | ✅ | ✅ |
| `POST /api/rewards` | ❌ | ❌ | ✅ |
| `PUT /api/rewards/:id` | ❌ | ❌ | ✅ |
| `DELETE /api/rewards/:id` | ❌ | ❌ | ✅ |
| **Games** |
| `GET /api/games` | ✅ | ✅ | ✅ |
| `POST /api/games` | ❌ | ❌ | ✅ |
| `PUT /api/games/:id` | ❌ | ❌ | ✅ |
| `DELETE /api/games/:id` | ❌ | ❌ | ✅ |
| **Points** |
| `POST /api/points/add` | ❌ | ✅ | ✅ |
| `GET /api/points/me` | ❌ | ✅ | ✅ |
| **Users** |
| `GET /api/users` | ❌ | ❌ | ✅ |
| `PUT /api/users/:id/role` | ❌ | ❌ | ✅ |
| **Upload** |
| `POST /api/upload/food` | ❌ | ❌ | ✅ |

*Can only view own records

---

## 🔄 Role Assignment

### During Signup

1. **Default Behavior:**
   - If no role is specified → Assigned `"receiver"` automatically
   - User can explicitly select `"donor"` during signup

2. **Signup Form:**
   - Dropdown with two options:
     - `"receiver"` (default, pre-selected)
     - `"donor"` (admin-level)

3. **Backend Validation:**
   - Only `"donor"` and `"receiver"` are accepted
   - Invalid roles are rejected

### Role Promotion/Demotion

**Who can change roles:**
- Only users with `"donor"` role can change other users' roles
- Users cannot change their own role

**Endpoint:**
```
PUT /api/users/:id/role
Authorization: Bearer <donor_token>
{
  "role": "donor"  // or "receiver"
}
```

---

## 💻 Implementation Details

### Backend

**Model (`userModel.js`):**
```javascript
const ALLOWED_ROLES = ['donor', 'receiver'];
// 'receiver' = Default role for general users
// 'donor' = Admin-level role with elevated permissions
```

**Default Role in Database:**
```sql
role ENUM('donor','receiver') DEFAULT 'receiver'
```

**Signup Controller:**
- Defaults to `'receiver'` if no role provided
- Validates role against `ALLOWED_ROLES`

**Middleware (`roles.js`):**
- Checks if user's role is in the allowed roles array
- Used in routes: `roles(['donor'])` restricts to donor-only

### Frontend

**Signup Form:**
- Role dropdown with `"receiver"` as default
- Helper text explaining role differences
- Pre-selects role from URL parameter if provided

**Script:**
- Defaults to `'receiver'` if no role selected
- Handles role from form or URL parameter

---

## 📊 Role Comparison Table

| Feature | Receiver | Donor |
|---------|----------|-------|
| **Default Role** | ✅ Yes | ❌ No |
| **Browse Foods** | ✅ | ✅ |
| **Add to Cart** | ✅ | ✅ |
| **Place Orders** | ✅ | ✅ |
| **View Own Orders** | ✅ | ✅ |
| **View All Orders** | ❌ | ✅ |
| **Submit Donations** | ✅ | ✅ |
| **View Own Donations** | ✅ | ✅ |
| **View All Donations** | ❌ | ✅ |
| **Manage Donations** | ❌ | ✅ |
| **Submit Partner App** | ✅ | ✅ |
| **View Own Apps** | ✅ | ✅ |
| **View All Apps** | ❌ | ✅ |
| **Approve/Reject Apps** | ❌ | ✅ |
| **Play Games** | ✅ | ✅ |
| **Earn Points** | ✅ | ✅ |
| **Redeem Rewards** | ✅ | ✅ |
| **Create Foods** | ❌ | ✅ |
| **Manage Foods** | ❌ | ✅ |
| **Create Rewards** | ❌ | ✅ |
| **Manage Rewards** | ❌ | ✅ |
| **Create Games** | ❌ | ✅ |
| **Manage Games** | ❌ | ✅ |
| **View All Users** | ❌ | ✅ |
| **Change User Roles** | ❌ | ✅ |
| **Upload Images** | ❌ | ✅ |

---

## 🔒 Security Notes

1. **Role Validation:**
   - Backend validates all role assignments
   - Only `'donor'` and `'receiver'` are accepted
   - Invalid roles throw errors

2. **Access Control:**
   - Middleware checks roles before allowing access
   - Users can only view their own data (unless donor)
   - Donor role required for management operations

3. **Default Security:**
   - New users default to `'receiver'` (least privilege)
   - Donor role must be explicitly assigned
   - Role changes require donor permissions

4. **Data Isolation:**
   - Receivers see only their own orders, donations, applications
   - Donors can see all data across the system
   - API endpoints enforce these restrictions

---

## 📝 Quick Reference

**For Developers:**
- Use `roles(['donor'])` middleware for admin-only routes
- Default new users to `'receiver'` role
- Validate roles in controllers before processing

**For Users:**
- **Receiver:** Use the platform as a regular user
- **Donor:** Manage the platform and all users

**For Admins:**
- Assign `'donor'` role to trusted users who need management access
- Use `PUT /api/users/:id/role` to promote/demote users
- Monitor role assignments for security

---

*Last Updated: 2025-01-27*


