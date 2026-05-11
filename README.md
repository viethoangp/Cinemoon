# 🎬 CINEMOON - Hệ thống Đặt Vé Xem Phim

Cinemoon là một ứng dụng web đặt vé xem phim được xây dựng với:
- **Frontend**: React.js + TypeScript + TailwindCSS
- **Backend**: Node.js + Express.js + Oracle Database
- **Database**: Oracle 16 với 16 bảng, Stored Procedures, Triggers

---

## 📁 CẤU TRÚC THƯ MỤC

```
Cinemoon/
│
├── 📄 README_VI.md                    ← Hướng dẫn này
├── 📄 README.md                       ← Tài liệu tiếng Anh
│
├── 📂 frontend/                       ✨ Giao diện người dùng (React + Vite)
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts              ← Cấu hình Vite dev server
│   ├── 📄 tsconfig.json               ← Cấu hình TypeScript
│   ├── 📄 postcss.config.mjs          ← Cấu hình TailwindCSS
│   ├── 📄 index.html                  ← HTML entry point
│   │
│   └── 📂 src/
│       ├── 📄 main.tsx                ← React app entry point
│       │
│       ├── 📂 app/
│       │   ├── 📄 App.tsx             ← Wrapper chính
│       │   ├── 📄 routes.tsx          ← Định nghĩa 7 tuyến đường
│       │   │
│       │   ├── 📂 context/
│       │   │   └── 📄 AppContext.tsx  ← Quản lý state toàn cục (phim, ghế, showtime)
│       │   │
│       │   ├── 📂 components/
│       │   │   ├── 📂 layout/
│       │   │   │   ├── AppLayout.tsx  ← Layout chính (Navbar + Content)
│       │   │   │   └── Navbar.tsx     ← Thanh điều hướng
│       │   │   │
│       │   │   ├── 📂 screens/        ← 7 màn hình chính
│       │   │   │   ├── LoginScreen.tsx        ← Đăng nhập
│       │   │   │   ├── HomeScreen.tsx         ← Trang chủ (duyệt phim)
│       │   │   │   ├── ShowtimeScreen.tsx     ← Chọn ngày & suất chiếu
│       │   │   │   ├── SeatMapScreen.tsx      ← Sơ đồ ghế & giữ ghế
│       │   │   │   ├── CheckoutScreen.tsx     ← Thanh toán & xác nhận
│       │   │   │   ├── ProfileScreen.tsx      ← Tài khoản & lịch sử đặt vé
│       │   │   │   └── AdminScreen.tsx        ← Quản lý (dành cho Admin)
│       │   │   │
│       │   │   ├── 📂 ui/              ← UI Components từ shadcn/ui
│       │   │   │   ├── button.tsx, card.tsx, dialog.tsx, form.tsx
│       │   │   │   ├── input.tsx, select.tsx, table.tsx, tabs.tsx
│       │   │   │   └── ... (20+ components)
│       │   │   │
│       │   │   └── 📂 figma/
│       │   │       └── ImageWithFallback.tsx ← Component hình ảnh
│       │   │
│       │   └── 📂 services/
│       │       ├── 📄 api.ts          ← Layer gọi API (fetch wrapper)
│       │       ├── 📄 mockData.ts     ← Dữ liệu giả lập cho phát triển
│       │       └── 📄 authService.ts  ← Xử lý JWT & localStorage
│       │
│       └── 📂 styles/
│           ├── fonts.css              ← Font chữ (Google Fonts)
│           ├── index.css              ← CSS chính
│           ├── tailwind.css           ← TailwindCSS directives
│           └── theme.css              ← Màu sắc & theme
│
│
├── 📂 backend/                        ⚙️ API Backend (Node.js + Express)
│   ├── 📄 package.json
│   ├── 📄 server.js                   ← Express app entry point
│   ├── 📄 .env.example                ← Mẫu biến môi trường
│   │
│   ├── 📂 config/
│   │   └── 📄 db.js                   ← Oracle connection pool setup
│   │
│   ├── 📂 middleware/
│   │   ├── 📄 auth.js                 ← JWT authentication
│   │   └── 📄 errorHandler.js         ← Xử lý lỗi toàn cục
│   │
│   ├── 📂 routes/
│   │   └── 📄 api.js                  ← Định tuyến API chính
│   │
│   ├── 📂 controllers/
│   │   ├── 📄 authController.js       ← Đăng nhập/Đăng ký
│   │   ├── 📄 movieController.js      ← Danh sách phim, suất chiếu, ghế
│   │   └── 📄 bookingController.js    ← Giữ ghế, voucher, thanh toán
│   │
│   ├── 📂 services/
│   │   ├── 📄 bookingService.js       ← Logic giữ ghế & thanh toán
│   │   ├── 📄 movieService.js         ← Logic lấy dữ liệu phim
│   │   └── 📄 spService.js            ← Gọi Stored Procedures
│   │
│   └── 📂 utils/
│       ├── 📄 validators.js           ← Kiểm tra dữ liệu
│       └── 📄 responseBuilder.js      ← Format response JSON
│
│
├── 📂 database/                       🗄️ Oracle Database Scripts
│   ├── 📄 01_create_tables.sql        ← Tạo 16 bảng (PHIM, SUAT_CHIEU, GHE_NGOI, ...)
│   ├── 📄 02_insert_data.sql          ← Insert dữ liệu mẫu
│   ├── 📄 03_create_procedures.sql    ← Stored Procedures (SP_GIU_GHE_DAT_CHO, v.v.)
│   ├── 📄 04_create_functions.sql     ← Functions (Tính giá, kiểm tra khuyến mãi)
│   ├── 📄 05_create_indexes.sql       ← Indexes tối ưu hóa
│   ├── 📄 06_update_statistics.sql    ← Thống kê bảng
│   ├── 📄 07_triggers.sql             ← Triggers tự động
│   └── 📄 08_test_queries.sql         ← Test queries ví dụ
│
│
└── 📂 .git/                           ← Git repository


```

## 🚀 CÁCH CHẠY CHƯƠNG TRÌNH

### ⚙️ YÊU CẦU TRƯỚC TIÊN

1. **Node.js & npm**
   ```bash
   node --version  # Phiên bản 18+
   npm --version
   ```

2. **Oracle Database**
   - Oracle Database 16, 19c, hoặc Oracle Express Edition (XE)
   - Đã khởi tạo schema và chạy database setup scripts

3. **Git** (tùy chọn, để clone repo)

---

### 📝 BƯỚC 1: SETUP DATABASE

1. **Kết nối đến Oracle**
   ```bash
   sqlplus username/password@hostname:port/dbname
   ```

2. **Chạy tất cả các SQL scripts theo thứ tự**
   ```bash
   @database/01_create_tables.sql
   @database/02_insert_data.sql
   @database/03_create_procedures.sql
   @database/04_create_functions.sql
   @database/05_create_indexes.sql
   @database/06_update_statistics.sql
   @database/07_triggers.sql
   ```

3. **Xác nhận dữ liệu**
   ```sql
   SELECT COUNT(*) FROM PHIM;           -- Phải > 0
   SELECT COUNT(*) FROM SUAT_CHIEU;     -- Phải > 0
   SELECT COUNT(*) FROM GHE_NGOI;       -- Phải > 0
   ```

---

### 🔧 BƯỚC 2: SETUP BACKEND

1. **Vào thư mục backend**
   ```bash
   cd backend
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Tạo file `.env`** (sao chép từ `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Chỉnh sửa `.env` với thông tin Oracle của bạn**
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174

   # Oracle Database
   ORACLE_USER=your_username
   ORACLE_PASSWORD=your_password
   ORACLE_CONNECTION_STRING=localhost:1521/XE

   # Connection Pool
   ORACLE_POOL_MIN=1
   ORACLE_POOL_MAX=10
   ORACLE_POOL_INCREMENT=1

   # JWT
   JWT_SECRET=cinemoon-secret-key-2026
   JWT_EXPIRY=7d
   ```

5. **Chạy backend development server**
   ```bash
   npm run dev
   ```
   ✅ Backend chạy tại: **http://localhost:3000**

   Console logs sẽ hiển thị:
   ```
   [DB] Oracle pool initialized successfully
   Cinemoon backend listening on port 3000
   ```

---

### 🎨 BƯỚC 3: SETUP FRONTEND

1. **Mở terminal mới, vào thư mục frontend**
   ```bash
   cd frontend
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Chạy frontend development server**
   ```bash
   npm run dev
   ```
   ✅ Frontend chạy tại: **http://localhost:5173** (hoặc 5174 nếu 5173 đã dùng)

   Màn hình console sẽ hiển thị:
   ```
   ➜ Local:   http://localhost:5173/
   ➜ Network: ...
   ```



