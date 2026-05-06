# Cinemoon: Movie Booking System with Oracle Concurrency Demo

## Project Overview

**Cinemoon** is a full-stack movie ticket booking web application designed to demonstrate:
- **3-tier architecture** (React frontend → Node.js/Express backend → Oracle database)
- **Database-driven business logic** using stored procedures and PL/SQL functions
- **Oracle concurrency handling** with lock management and deadlock scenarios
- **Enterprise API patterns** with proper connection pooling and error handling

The project serves as a capstone project for a DBMS course, emphasizing that **all write operations must flow through Oracle stored procedures**, never direct DML in the application layer.

---

## Architecture Overview

### 3-Tier Design

```
┌─────────────────────────────────────────────────┐
│  React.js + TypeScript + TailwindCSS            │
│  (Frontend - UI/UX Layer)                       │
│  - Movie browsing, seat selection, checkout    │
└─────────────┬───────────────────────────────────┘
              │ HTTP/JSON
┌─────────────▼───────────────────────────────────┐
│  Node.js + Express.js                           │
│  (Backend - API Layer)                          │
│  - Route handling, SP invocation, error mapping │
└─────────────┬───────────────────────────────────┘
              │ oracledb (Connection Pool)
┌─────────────▼───────────────────────────────────┐
│  Oracle Database (16 tables, SPs, Triggers)     │
│  (Data Layer - Business Logic)                  │
│  - Seat locking, concurrency control, payments │
└─────────────────────────────────────────────────┘
```

### Key Principles

1. **Stored Procedure First**: All write operations (INSERT, UPDATE, DELETE) must be executed via Oracle stored procedures with bind variables. Never use direct DML in Node.js.
2. **Connection Pooling**: The backend maintains an Oracle connection pool to handle concurrent requests efficiently.
3. **Concurrency Handling**: `SP_GIU_GHE_DAT_CHO` uses `SELECT ... FOR UPDATE NOWAIT` to detect seat conflicts and raises `ORA-00054`, which the API maps to HTTP 409 Conflict.
4. **Preserved Frontend**: The React UI layout and styling remain unchanged; API integration only replaces mock data with real backend calls.

---

## Repository Structure

```
Cinemoon/
├── README.md                          # Root documentation (you are here)
├── WEB_PROJECT_CONTEXT.md             # Detailed project rules, DB schema, SPs
├── .env.example                       # Environment variable template
│
├── frontend/                          # React.js + Vite + TypeScript
│   ├── README.md                      # Frontend setup and UI mockup notes
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/
│   │   │   ├── App.tsx                # Main app wrapper
│   │   │   ├── routes.tsx             # Router configuration (7 screens)
│   │   │   ├── context/
│   │   │   │   └── AppContext.tsx     # Shared state (movie, seats, showtime, etc.)
│   │   │   └── components/
│   │   │       ├── layout/
│   │   │       │   ├── AppLayout.tsx  # App shell with Navbar
│   │   │       │   └── Navbar.tsx     # Navigation bar
│   │   │       ├── screens/           # 7 route screens (Login, Home, Showtime, Seat, Checkout, Profile, Admin)
│   │   │       ├── figma/
│   │   │       │   └── ImageWithFallback.tsx
│   │   │       └── ui/                # Pre-built shadcn/ui components
│   │   └── styles/
│   │       ├── fonts.css
│   │       ├── index.css
│   │       ├── tailwind.css
│   │       └── theme.css
│   └── node_modules/ (installed after npm install)
│
└── backend/                           # Node.js + Express.js + oracledb
    ├── package.json
    ├── .env.example
    ├── server.js                      # Express app entry point
    ├── config/
    │   └── db.js                      # Oracle connection pool setup
    ├── routes/
    │   └── api.js                     # Endpoint definitions
    └── controllers/
        ├── authController.js          # Login & register (SP calls)
        ├── movieController.js         # Movie list, showtimes, seats (read queries)
        └── bookingController.js       # Booking flow: hold seat, voucher, checkout, cancel
```

---

## Getting Started

### Prerequisites

- **Node.js** 16+ (Frontend & Backend)
- **npm** or **yarn** (Package manager)
- **Oracle Database** 19c+ or **Oracle Express Edition (XE)**
- **oracledb** client libraries (for Node.js connection)

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:5173` by default.

4. **Build for production:**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173

   # Oracle Database credentials
   ORACLE_USER=your_db_user
   ORACLE_PASSWORD=your_db_password
   ORACLE_CONNECTION_STRING=localhost:1521/XE

   # Connection pool settings (optional)
   ORACLE_POOL_MIN=1
   ORACLE_POOL_MAX=10
   ORACLE_POOL_INCREMENT=1
   ```

4. **Start backend server:**
   ```bash
   npm start
   ```
   The API runs at `http://localhost:3000`.

---


