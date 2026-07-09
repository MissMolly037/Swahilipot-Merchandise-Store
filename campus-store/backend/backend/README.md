# Campus Merchandise Store — Full Stack App

A full-stack e-commerce platform for **Swahilipot Hub** merchandise, built with Django REST Framework + React (Vite).

---

## 📁 Project Structure

```
Campus-Merchandise-Store/
└── campus-store/
    ├── backend/                    # Django REST API
    │   ├── core/                   # Settings, root URLs, WSGI/ASGI
    │   ├── users/                  # Custom user model, JWT auth, profile
    │   ├── products/               # Products & categories CRUD + filters
    │   │   └── management/
    │   │       └── commands/
    │   │           └── seed_data.py
    │   ├── orders/                 # Order creation & history
    │   ├── manage.py
    │   ├── .env.example
    │   ├── db.sqlite3
    │   └── requirements.txt
    │
    └── frontend/                   # React + Vite SPA
        ├── node_modules/
        ├── public/
        └── src/
            ├── assets/
            ├── components/
            │   ├── ui/             # flip-card, animated-loading-skeleton
            │   ├── CartItem.css / CartItem.jsx
            │   ├── CategoryCard.css / CategoryCard.jsx
            │   ├── EmptyState.css / EmptyState.jsx
            │   ├── Footer.css / Footer.jsx
            │   ├── HeroBanner.css / HeroBanner.jsx
            │   ├── LoadingSpinner.css / LoadingSpinner.jsx
            │   ├── LogoSplash.css / LogoSplash.jsx
            │   ├── Navbar.css / Navbar.jsx
            │   ├── OrderSummary.css / OrderSummary.jsx
            │   ├── Pagination.css / Pagination.jsx
            │   ├── ProductCard.css / ProductCard.jsx
            │   ├── QuantitySelector.css / QuantitySelector.jsx
            │   ├── SearchBar.css / SearchBar.jsx
            │   └── SphLogo.jsx
            ├── context/
            │   ├── AuthContext.jsx
            │   ├── CartContext.jsx
            │   └── WishlistContext.jsx
            ├── layouts/
            │   └── MainLayout.jsx
            ├── pages/
            │   ├── Cart.css / Cart.jsx
            │   ├── Checkout.css / Checkout.jsx
            │   ├── Home.css / Home.jsx
            │   ├── Login.jsx
            │   ├── LoginFlipCard.jsx
            │   ├── NotFound.css / NotFound.jsx
            │   ├── ProductDetail.css / ProductDetail.jsx
            │   ├── Products.css / Products.jsx
            │   ├── Profile.css / Profile.jsx
            │   ├── Register.jsx
            │   └── Wishlist.css / Wishlist.jsx
            ├── routes/
            │   └── ProtectedRoute.jsx
            ├── services/
            │   └── api.js
            ├── App.css
            ├── App.jsx
            ├── index.css
            └── main.jsx
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd campus-store/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment file
cp .env.example .env

# Run migrations
python manage.py migrate

# Seed sample data (6 categories + 18 products + admin user)
python manage.py seed_data

# Start the dev server
python manage.py runserver
```

> API runs at: **http://localhost:8000**
> Admin panel: **http://localhost:8000/admin** — `admin / admin1234`

---

### 2. Frontend Setup

```bash
cd campus-store/frontend

# Install dependencies
npm install

# Start the dev server (proxies /api → localhost:8000 automatically)
npm run dev
```

> App runs at: **http://localhost:5173**

---

## 🔑 API Endpoints

### Auth
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/register/` | No | Create account |
| POST | `/api/login/` | No | Get JWT tokens |
| POST | `/api/token/refresh/` | No | Refresh access token |
| GET/PATCH | `/api/profile/` | ✅ | Get or update profile |

### Products
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/products/` | No | List products (paginated, filterable) |
| GET | `/api/products/:id/` | No | Product detail |
| POST | `/api/products/` | Admin | Create product |
| PATCH | `/api/products/:id/` | Admin | Update product |
| DELETE | `/api/products/:id/` | Admin | Delete product |
| GET | `/api/categories/` | No | List all categories |

**Product query filters:**
```
?search=hoodie
?category=t-shirts
?is_featured=true
?is_new_arrival=true
?min_price=500&max_price=2000
?ordering=-price          # options: -price, price, name, -name, -created_at
?page=2
```

### Orders
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/orders/` | ✅ | My orders (admin sees all) |
| POST | `/api/orders/` | ✅ | Place an order |
| GET | `/api/orders/:id/` | ✅ | Order detail |

**POST `/api/orders/` payload:**
```json
{
  "full_name": "Jane Kamau",
  "email": "jane@example.com",
  "phone_number": "+254712345678",
  "delivery_location": "Nyali, Mombasa",
  "student_id": "SPH-2024-001",
  "items": [
    { "product": 1, "quantity": 2 },
    { "product": 5, "quantity": 1 }
  ]
}
```

---

## 🎨 Frontend Pages

| Route | Page | Protected |
|-------|------|-----------|
| `/` | Home | No |
| `/products` | Product listing + filters | No |
| `/products/:id` | Product detail | No |
| `/cart` | Shopping cart | No |
| `/wishlist` | Saved items | No |
| `/login` | Login | No |
| `/login-flip` | Login (3D flip card) | No |
| `/register` | Register | No |
| `/checkout` | Checkout | ✅ |
| `/profile` | Profile + order history | ✅ |

---

## 🧩 Key Features

### Frontend
- **Animated logo splash** — SPH logo animates in on first page load each session
- **JWT auth** with auto-refresh on 401 — no manual token management needed
- **Persistent cart** via localStorage — survives page refreshes
- **Wishlist** — save/remove products, move all to cart, persisted in localStorage
- **Debounced search** with URL params — shareable filtered URLs
- **Animated loading skeletons** — framer-motion powered card shimmer
- **3D flip card login** — alternative `/login-flip` route with framer-motion
- **Protected routes** — redirect to login with return URL preserved
- **Responsive** — mobile-first, slide-out filter drawer on mobile

### Backend
- **Stock management** — atomic DB transactions prevent overselling
- **JWT token rotation** — refresh tokens rotate on every use
- **Admin panel** — full CRUD for products, categories, orders with inline editing
- **Filtering** — price range, category, featured, new arrivals, full-text search, ordering
- **Seed command** — `python manage.py seed_data` populates 6 categories and 18 products

---

## ⚙️ Environment Variables

### Backend (`campus-store/backend/.env`)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`campus-store/frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, React Router 6 |
| Animations | Framer Motion |
| Styling | CSS custom properties — no framework |
| State | React Context (Auth, Cart, Wishlist) |
| HTTP | Axios with JWT interceptors + auto-refresh |
| Backend | Django 4.2, Django REST Framework |
| Auth | SimpleJWT (access + rotating refresh tokens) |
| Database | SQLite (dev) — swap for PostgreSQL in prod |
| Media | Django media files + Pillow |

---

## 🚢 Production Checklist

- [ ] Set `DEBUG=False` in `core/settings.py`
- [ ] Replace `SECRET_KEY` with a strong random value
- [ ] Set `ALLOWED_HOSTS` to your domain(s)
- [ ] Switch from SQLite to PostgreSQL
- [ ] Replace `CORS_ALLOW_ALL_ORIGINS=True` with `CORS_ALLOWED_ORIGINS=[...]`
- [ ] Configure media file serving (AWS S3, Cloudinary, etc.)
- [ ] Set `VITE_API_URL` to your production API URL in frontend `.env`
- [ ] Run `npm run build` and serve the `dist/` folder via Nginx
- [ ] Deploy Django with Gunicorn behind Nginx
- [ ] Enable token blacklisting: add `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS` and set `BLACKLIST_AFTER_ROTATION=True`
- [ ] Run `python manage.py collectstatic` before deploying