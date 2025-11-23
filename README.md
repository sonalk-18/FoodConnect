## FoodConnect 2.0

FoodConnect is a full-stack platform that connects surplus food donors, NGOs, volunteers, and gamers who unlock rewards for community impact. This update introduces a richer frontend flow plus a modular backend that mirrors the project summary you provided.

### Project Structure

```
frontend/           # static site (HTML/CSS/JS)
  public/
backend/            # Express API + MySQL models
  server.js
  src/
  uploads/
```

### What's Included

- **Static frontend** (`frontend/public`) with responsive pages, multi-theme support, in-browser forms, and a token-aware dashboard.
- **Express backend** (`backend/src`) with authentication, food catalog, donation workflow, partner onboarding, reward store, game catalog, and point ledger.
- **MySQL data layer** with dedicated models per domain and reusable validators/middleware.
- **Multer uploads**, JWT auth, role-based authorization, and production-ready middleware (Helmet, CORS, morgan, cookie-parser).

### Quick Start

```bash
cd backend
npm install
echo "PORT=3000" > .env   # populate the rest of the variables shown below
npm run dev               # runs Express on http://localhost:3000
```

The backend serves the frontend statically from `frontend/public`, so you can visit `http://localhost:3000` immediately. Set `FRONTEND_DIR` if you deploy the frontend separately and only want the API.

### Environment Variables

| Key | Description |
| --- | ----------- |
| `PORT` | API port (defaults to `3000`) |
| `CLIENT_URL` | Allowed CORS origin (defaults to `http://localhost:5173`) |
| `FRONTEND_DIR` | Absolute path to static files (`../frontend/public` by default) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL credentials |
| `DB_POOL_LIMIT` | Optional connection pool override |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | JWT secrets |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Token TTLs (`15m`, `7d` etc.) |
| `DONATION_POINTS` | Points awarded per donation (defaults to `50`) |

### Database Schema (MySQL)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  phone VARCHAR(32),
  password VARCHAR(255) NOT NULL,
  role ENUM('donor','receiver') DEFAULT 'receiver',
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE foods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(60),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY cart_user_food (user_id, food_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  donor_type ENUM('individual','restaurant','event','other') NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(32) NOT NULL,
  contact_email VARCHAR(160),
  food_type VARCHAR(160) NOT NULL,
  quantity VARCHAR(120) NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_window VARCHAR(120) NOT NULL,
  notes TEXT,
  assigned_volunteer VARCHAR(120),
  status ENUM('pending','scheduled','picked_up','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  organization_name VARCHAR(160) NOT NULL,
  organization_type ENUM('ngo','restaurant','volunteer','sponsor') NOT NULL,
  contact_person VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  location VARCHAR(160) NOT NULL,
  website VARCHAR(255),
  message TEXT,
  document_url VARCHAR(255),
  notes TEXT,
  status ENUM('pending','in_review','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  points_required INT NOT NULL,
  inventory INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  url VARCHAR(255) NOT NULL,
  icon_url VARCHAR(255),
  points_per_play INT DEFAULT 0,
  tags VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points INT NOT NULL,
  source_type ENUM('game','donation','manual','reward') NOT NULL,
  source_id INT,
  note VARCHAR(255),
  direction ENUM('credit','debit') DEFAULT 'credit',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

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

> Tip: run these statements in the order shown to satisfy foreign-key dependencies.

### API Surface

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/signup` | Register users (name, email, phone, password) |
| POST | `/api/auth/login` | Login with email/password, receive JWTs |
| GET | `/api/auth/me` | Fetch profile + current points |
| GET | `/api/users` | Admin-only list of all users |
| PUT | `/api/users/:id/role` | Admin-only role promotions/demotions |
| GET | `/api/foods` | Public surplus food catalog |
| GET | `/api/foods/:id` | Fetch single food item |
| GET | `/api/foods/search` | Keyword search (`?query=pizza`) |
| GET | `/api/foods/filter` | Filter by category/price |
| POST | `/api/foods` | Admin food creation with image upload |
| PUT | `/api/foods/:id` | Admin food update (JSON or form-data) |
| DELETE | `/api/foods/:id` | Admin removal |
| POST | `/api/cart/add` | Add/update cart line item |
| GET | `/api/cart` | Fetch logged-in user cart |
| DELETE | `/api/cart/remove/:foodId` | Remove a specific food from cart |
| POST | `/api/orders` | Create food orders |
| GET | `/api/orders/my` | Logged-in user order history |
| GET | `/api/orders` | Admin order dashboard |
| PUT | `/api/orders/:id/status` | Admin order workflow updates |
| POST | `/api/upload/food` | Admin-only standalone image upload |
| POST | `/api/donations` | Submit a donation request (auth) |
| GET | `/api/donations/me` | Logged-in donor’s donations |
| GET | `/api/donations` | Admin view of all donations |
| POST | `/api/partners` | Submit partner/NGO application |
| GET | `/api/partners/me` | Check your application statuses |
| POST | `/api/rewards/redeem` | Redeem reward points |
| GET | `/api/rewards` | List active reward items |
| GET | `/api/games` | Fetch curated games list |
| POST | `/api/points/add` | Add points after gameplay (auth) |
| GET | `/api/points/me` | Get balance + recent history |

All create/update endpoints are validated via `express-validator`, and admin-only routes use the `roles(['admin'])` middleware.

### Postman Samples

#### Signup

```json
POST /api/auth/signup
{
  "name": "Sonal Kumrawat",
  "email": "sonal@gmail.com",
  "password": "123456"
}
```

#### Login

```json
POST /api/auth/login
{
  "email": "sonal@gmail.com",
  "password": "123456"
}
```

#### Add Cart Item

```json
POST /api/cart/add
Authorization: Bearer <token>
{
  "foodId": 10,
  "qty": 2
}
```

#### Place Order

```json
POST /api/orders
Authorization: Bearer <token>
{
  "items": [
    { "foodId": 10, "qty": 2 },
    { "foodId": 5, "qty": 1 }
  ]
}
```

### Frontend Linking

- `signup.html` + `login.html` call the auth endpoints and persist tokens in `localStorage`.
- `donate.html` and `partners.html` include full forms with inline validation that post to the API and display histories.
- `games.html` fetches `/api/games`, lets users log game points, and streams reward data from `/api/rewards`.
- `dashboard.html` is a token-gated view that merges profile info, donations, partner applications, points, and redeemable rewards.

### Next Steps

- Style the admin experience or build a dedicated admin SPA.
- Hook up a production-ready mail/SMS service to notify donors and partners.
- Deploy to services like Render / Railway / Vercel with a managed MySQL instance.

Enjoy building with FoodConnect! Contributions are welcome—open issues or PRs for new flows, bug fixes, or enhancements.

