# 🛍️ ShopHub – Full-Stack E-commerce Experience

ShopHub is a modern e-commerce prototype that blends a vanilla HTML/CSS/JS frontend with an Express + MongoDB backend. It includes authentication, product discovery, favorites, cart + checkout, order persistence, and analytics for each user.

---

## 🚀 Setup Steps

### 1. Clone & Install
```bash
git clone <repo-url>
cd ecommerce
```

#### Backend
```bash
cd backend
npm install
```

#### Frontend
Static files only. Recommended to serve via a simple HTTP server:
```bash
cd frontend
npx http-server -p 8000
```

### 2. Environment Variables (`backend/.env`)
```env
JWT_SECRET=your-secure-random-string
MONGO_URI=your-mongodb-connection-string
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:5500
PORT=3000
NODE_ENV=production
```

### 3. Run Backend
```bash
cd backend
npm run dev   # or npm start
```

### 4. Run Frontend
Open `http://localhost:8000/login.html` (or wherever you hosted the static files).

---

## 🧰 Tech Stack

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), vanilla JavaScript
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, dotenv
- **Tooling**: Render/Netlify-ready deploy, optional http-server for local dev

---

## 📸 Screenshots / Recording

| Flow | Preview |
| ---- | ------- |
| Login / Signup | _(insert image or GIF)_ |
| Products & Hover Cards | _(insert image or GIF)_ |
| Favorites Sidebar | _(insert image or GIF)_ |
| Cart & Checkout Modal | _(insert image or GIF)_ |
| Dashboard & Analytics | _(insert image or GIF)_ |

_Optional_: embed a Loom/MP4 link showing the full end-to-end experience.

---

## ✅ Features & Assumptions

### Core Flows
- Product cards with live search/filter/sort.
- Single-page feel with modals and quick navigation.
- Per-user favorites stored with user-specific keys.
- Cart with quantity controls and checkout modal capturing shipping + payment method.
- Orders stored in MongoDB and fetched per user at login; dashboard only shows that user’s history & analytics.

### Dashboard
- Purchase history with thumbnails and metadata.
- Analytics module: total orders, revenue, avg order value, top payment method, and category distribution chart.

### Assumptions
- Product catalog is static (`frontend/data.json`).
- Payment flow is simulated; no actual gateway integration.
- Orders/analytics rely on logging in; guest browsing works but cannot place orders.

---

## 🎯 Bonus Features Implemented

- **Authentication** with JWT + bcrypt.
- **Advanced UI**: dark mode, favorites FAB, hover animations, responsive layout.
- **Checkout workflow** with address/payment capture.
- **Data visualization**: Canvas-based analytics.
- **Multiple tracks**: frontend UX, backend auth, analytics.
- **Deployment-ready**: tested with Render (API) and Netlify-compatible front-end.

---

## 📦 Project Structure
```
ecommerce/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── styles.css
│   ├── script.js
│   └── data.json
└── backend/
    ├── index.js
    ├── package.json
    ├── package-lock.json
    ├── ENV_SETUP.md
    └── ...
```

---

## 🧪 Demo Flow
1. Signup or login at `/frontend/login.html`.
2. Browse products, add favorites, add to cart.
3. Open the cart → “Proceed to Checkout” → fill shipping + payment → place order.
4. Visit Dashboard to confirm purchase history & analytics update.
5. Log out, log in as a different user to see isolated favorites/orders.

---

## 🌐 Deployment Notes
- Backend tested on **Render** (`https://ecommerce-jknx.onrender.com`).
- Frontend is static-host friendly (Netlify/Vercel/GitHub Pages).
- Update `FRONTEND_URL` & `ALLOWED_ORIGINS` when deploying new environments.

---

