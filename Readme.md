<div align="center">

# 🛒 SuperMart POS

### A full-stack Point of Sale system built for multi-business retail management

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Screenshots](#-screenshots) · [API](#-api-overview)

</div>

---

## 📌 What is SuperMart POS?

SuperMart POS is a **multi-tenant Point of Sale web application** that lets a single Super Admin manage multiple independent retail businesses — each with their own admin, cashiers, products, orders, and reports — all from one platform.

Built with the **MERN stack** (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS v4**.

---

## ✨ Features

### 🔴 Super Admin
- Manage all admin accounts and cashiers across every business
- Create new admin = new isolated business (separate products, orders, reports)
- Assign cashiers to specific admin businesses
- Toggle user active/inactive, set granular permissions
- View cross-business system overview

### 🟢 Admin Panel
- **Dashboard** — today's revenue, bills, outstanding payments, stock alerts
- **Products** — full CRUD with image, brand, category, subcategory, offer, gift logic
- **Stock Manager** — cargo inward, damage/expiry write-offs, audit corrections, stock logs
- **Orders** — paginated order history, payment status updates (paid/partial/unpaid)
- **Reports** — daily & monthly revenue, top products, cashier-wise breakdown
- **Cashiers** — add/edit/toggle/delete cashiers linked to your business
- Permission-based navigation (admin sees only what they're allowed to)

### 🔵 Cashier POS Terminal
- Live product discovery with **4-layer filter system**:
  - Category → Subcategory → Brand → Special (Offers / Discounts / Free Gifts)
- Smart quantity popup with unit-aware presets (kg, ml, pcs etc.)
- Real-time cart with line totals, savings, GST calculation
- Gift unlock system (e.g. "Free bag with 3+ kg Avocado")
- Checkout with cash / UPI / card, partial payment support
- Printable receipt overlay

### 🔐 Auth & Security
- JWT-based authentication (7-day tokens)
- Role-based route guards: `superadmin` / `admin` / `cashier`
- Data isolation enforced at DB query level via `adminId` scoping
- Bcrypt password hashing, inactive account blocking

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Axios, Lucide React |
| Backend | Node.js 18+, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken), Bcryptjs |
| File Upload | Multer |
| Dev Tools | Vite 8, Nodemon, Morgan |

---

## 📁 Project Structure

```
super-mart/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login, getMe, changePassword
│   │   ├── cashierController.js  # Cashier CRUD
│   │   ├── orderController.js    # Order create/read/update
│   │   ├── productController.js  # Product CRUD + stock logs
│   │   ├── reportController.js   # Dashboard, daily, monthly reports
│   │   └── userController.js     # SuperAdmin user management
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect, adminOnly, resolveAdminId
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js               # roles: superadmin / admin / cashier
│   │   ├── Product.js            # adminId scoped
│   │   ├── Order.js              # adminId scoped
│   │   └── StockLog.js           # adminId scoped
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js               # Seeds demo data
│   ├── utils/
│   ├── .env                      # Environment variables (not committed)
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Login.jsx
        │   ├── AdminLayout.jsx
        │   ├── SuperAdminLayout.jsx
        │   ├── ProductDiscovery.jsx  # Cashier POS with filters
        │   ├── CheckoutSummary.jsx
        │   └── ReceiptOverlay.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Products.jsx
        │   ├── Stockmanage.jsx
        │   ├── Orders.jsx
        │   ├── Reports.jsx
        │   ├── Cashiers.jsx
        │   ├── CashierPOS.jsx
        │   ├── SuperAdminDashboard.jsx
        │   └── SuperAdminControlPanel.jsx
        └── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A MongoDB Atlas account (free tier works perfectly)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/super-mart.git
cd super-mart
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file inside `backend/`:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/supermart
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> ⚠️ Never commit your real `.env` file. It is already listed in `.gitignore`.

---

### 3. Seed the Database

This creates demo users and products so you can log in immediately:

```bash
npm run seed
```

This will create:

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@supermart.com | super123 |
| Admin A | admin@supermart.com | admin123 |
| Admin B | admin2@supermart.com | admin123 |
| Cashier (→ Admin A) | ravi@supermart.com | cashier123 |
| Cashier (→ Admin A) | priya@supermart.com | cashier123 |
| Cashier (→ Admin B) | meera@supermart.com | cashier123 |

---

### 4. Start the Backend

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 6. Open in Browser

Visit **http://localhost:5173/login** and sign in with any of the seed credentials above.

---

## 🔑 Role Guide

| Role | Where they land | What they can do |
|---|---|---|
| **Super Admin** | `/superadmin/control-panel` | Manage all users, assign permissions, view system overview |
| **Admin** | `/admin/dashboard` | Full business management based on granted permissions |
| **Cashier** | `/cashier/products` | POS terminal only — billing, no admin access |

---

## 🌐 API Overview

All API routes are prefixed with `/api`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Any | Get current user |
| PUT | `/api/auth/change-password` | Any | Change password |
| GET | `/api/products` | Any | Get products (scoped by adminId) |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete product |
| POST | `/api/products/inventory-workspace` | Admin | Bulk stock adjustment |
| GET | `/api/products/stock-logs` | Admin | Get stock history |
| POST | `/api/orders` | Any | Create order |
| GET | `/api/orders` | Any | Get orders (scoped) |
| PATCH | `/api/orders/:id/payment` | Admin | Update payment status |
| GET | `/api/cashiers` | Admin | Get cashiers (scoped) |
| POST | `/api/cashiers` | Admin | Add cashier |
| DELETE | `/api/cashiers/:id` | Admin | Remove cashier |
| GET | `/api/reports/dashboard` | Admin | Dashboard stats |
| GET | `/api/reports/daily` | Admin | Daily report |
| GET | `/api/reports/monthly` | Admin | Monthly report |
| GET | `/api/users/control-panel` | SuperAdmin | All users |
| POST | `/api/users/create` | SuperAdmin | Create admin/cashier |
| PATCH | `/api/users/modify-access` | SuperAdmin | Edit role/permissions |
| DELETE | `/api/users/:id` | SuperAdmin | Delete user |

---

## 🗃️ Data Isolation Architecture

Every piece of business data is stamped with an `adminId`:

```
SuperAdmin
    ├── Admin A  (adminId = A._id)
    │     ├── Products  { adminId: A._id }
    │     ├── Orders    { adminId: A._id }
    │     ├── StockLogs { adminId: A._id }
    │     └── Cashiers  { adminId: A._id }
    │
    └── Admin B  (adminId = B._id)
          ├── Products  { adminId: B._id }
          ├── Orders    { adminId: B._id }
          └── ...
```

Every controller query includes `{ adminId: req.adminId }` — data never leaks between businesses.

---

## 🔒 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | ✅ | Token expiry e.g. `7d` |
| `PORT` | ✅ | Backend server port (default 5000) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS (e.g. `http://localhost:5173`) |

---

## 🛠️ Available Scripts

### Backend
```bash
npm run dev      # Start with nodemon (hot reload)
npm run start    # Start production server
npm run seed     # Seed demo data into MongoDB
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ for modern Indian retail management.

---

<div align="center">
  <sub>⭐ Star this repo if you found it useful!</sub>
</div>