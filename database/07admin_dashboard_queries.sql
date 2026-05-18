-- ============================================================================
-- ADMIN DASHBOARD QUERIES
-- File: 07admin_dashboard_queries.sql
-- Purpose: Dashboard statistics for AdminScreen
-- Database: Oracle
-- Author: Tech Lead
-- Date: 2026-05-18
-- ============================================================================

-- Query 1: Tổng doanh thu tháng này (This Month Revenue)
-- Returns: Sum of all paid transactions in current month
-- Used for: KPI Card "Tổng doanh thu tháng này"
SELECT 
  SUM(gd.TONGTIEN) as TONGTIEN_THANG
FROM GIAO_DICH gd
WHERE gd.TRANGTHAIGD = 'Paid'
  AND EXTRACT(MONTH FROM gd.THOIGIANTAO) = EXTRACT(MONTH FROM SYSDATE)
  AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE);

-- Query 2: Tổng vé bán ra tháng này (Total Tickets Sold This Month)
-- Returns: Count of tickets sold in current month
-- Used for: KPI Card "Tổng vé bán ra tháng này"
SELECT 
  COUNT(v.MAVE) as TONG_VE
FROM VE v
JOIN GIAO_DICH gd ON v.MAGD = gd.MAGD
WHERE gd.TRANGTHAIGD = 'Paid'
  AND EXTRACT(MONTH FROM gd.THOIGIANTAO) = EXTRACT(MONTH FROM SYSDATE)
  AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE);

-- Query 3: Số khách hàng mới tháng này (New Customers This Month)
-- Returns: Count of new customers registered in current month
-- Used for: KPI Card "Số khách hàng mới"
-- Note: This assumes KHACH_HANG has THOIGIANTAO. If not, use TAI_KHOAN.THOIGIANTAO
SELECT 
  COUNT(DISTINCT kh.MAKH) as KH_MOI
FROM KHACH_HANG kh
JOIN TAI_KHOAN tk ON kh.MATK = tk.MATK
WHERE EXTRACT(MONTH FROM tk.THOIGIANTAO) = EXTRACT(MONTH FROM SYSDATE)
  AND EXTRACT(YEAR FROM tk.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE);

-- Query 4: Top 5 Phim cao nhất (Top 5 Movies by Revenue)
-- Returns: List of top 5 movies by revenue with ticket count
-- Used for: Bar Chart "Doanh thu Top 5 Phim"
-- Oracle Syntax: FETCH FIRST 5 ROWS ONLY (NOT LIMIT)
SELECT 
  p.MAPHIM,
  p.TENPHIM,
  p.POSTER,
  SUM(gd.TONGTIEN) as DOANHTHU,
  COUNT(v.MAVE) as TONG_VE
FROM PHIM p
JOIN SUAT_CHIEU sc ON p.MAPHIM = sc.MAPHIM
JOIN VE v ON sc.MASUAT = v.MASUAT
JOIN GIAO_DICH gd ON v.MAGD = gd.MAGD
WHERE gd.TRANGTHAIGD = 'Paid'
GROUP BY p.MAPHIM, p.TENPHIM, p.POSTER
ORDER BY DOANHTHU DESC
FETCH FIRST 5 ROWS ONLY;

-- Query 5: Top 5 Khách Hàng chi tiêu nhiều (Top 5 Customers by Spending)
-- Returns: List of top 5 customers by total spending
-- Used for: Table "Top 5 Khách Hàng"
-- Oracle Syntax: FETCH FIRST 5 ROWS ONLY (NOT LIMIT)
SELECT 
  kh.MAKH,
  kh.HOTEN,
  SUM(gd.TONGTIEN) as TONGCHITIÊU,
  COUNT(gd.MAGD) as SO_GIAODICH
FROM KHACH_HANG kh
JOIN GIAO_DICH gd ON kh.MAKH = gd.MAKH
WHERE gd.TRANGTHAIGD = 'Paid'
GROUP BY kh.MAKH, kh.HOTEN
ORDER BY TONGCHITIÊU DESC
FETCH FIRST 5 ROWS ONLY;

-- Query 6: Tỷ lệ lấp đầy suất chiếu hôm nay (Today's Showtime Occupancy Rate)
-- Returns: List of showtimes today with occupancy percentage
-- Used for: Table "Tỷ lệ lấp đầy suất chiếu hôm nay"
-- Formula: (Số vé bán / Tổng số ghế) * 100%
SELECT 
  sc.MASUAT,
  sc.NGAYCHIEU,
  TO_CHAR(sc.GIOBATDAU, 'HH24:MI') as GIOBATDAU,
  p.TENPHIM,
  ph.MAPHONG,
  ph.SUCCHUAGHE,
  COUNT(v.MAVE) as SO_VE_BAN,
  ROUND((COUNT(v.MAVE) / ph.SUCCHUAGHE) * 100, 2) as TY_LE_LAP_DAY
FROM SUAT_CHIEU sc
JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
JOIN PHONG_CHIEU ph ON sc.MAPHONG = ph.MAPHONG
LEFT JOIN VE v ON sc.MASUAT = v.MASUAT
WHERE TRUNC(sc.NGAYCHIEU) = TRUNC(SYSDATE)
GROUP BY sc.MASUAT, sc.NGAYCHIEU, sc.GIOBATDAU, p.TENPHIM, ph.MAPHONG, ph.SUCCHUAGHE
ORDER BY sc.GIOBATDAU ASC;

-- ============================================================================
-- END OF DASHBOARD QUERIES
-- ============================================================================
