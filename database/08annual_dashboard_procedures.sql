-- ============================================================================
-- ANNUAL DASHBOARD PROCEDURES & QUERIES
-- ============================================================================

-- ============================================================================
-- PROCEDURE: SP_GET_ANNUAL_STATS
-- Purpose: Get annual statistics (revenue, tickets, users) for current year
-- Returns: 
--   p_AnnualRevenue - Total revenue for current year (paid transactions)
--   p_AnnualTickets - Total tickets sold for current year (paid transactions)
--   p_NewUsers - Total new users registered in current year
--   p_KetQua - 1 for success, 0 for failure
--   p_Loi - Error message if failure
-- ============================================================================
CREATE OR REPLACE PROCEDURE SP_GET_ANNUAL_STATS (
  p_AnnualRevenue OUT NUMBER,
  p_AnnualTickets OUT NUMBER,
  p_NewUsers OUT NUMBER,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) IS
BEGIN
  EXECUTE IMMEDIATE 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE';
  -- Calculate annual revenue (sum of all paid transactions in current year)
  SELECT NVL(SUM(gd.TONGTIEN), 0) INTO p_AnnualRevenue
  FROM GIAO_DICH gd
  WHERE gd.TRANGTHAIGD = 'Paid'
    AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE);

  -- Calculate annual tickets sold (count of all tickets from paid transactions in current year)
  SELECT NVL(COUNT(v.MAVE), 0) INTO p_AnnualTickets
  FROM VE v
  JOIN GIAO_DICH gd ON v.MAGD = gd.MAGD
  WHERE gd.TRANGTHAIGD = 'Paid'
    AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE);

  -- Calculate new users registered in current year
  SELECT NVL(COUNT(DISTINCT kh.MAKH), 0) INTO p_NewUsers
  FROM KHACH_HANG kh
  JOIN TAI_KHOAN tk ON kh.MATK = tk.MATK
  WHERE EXTRACT(YEAR FROM tk.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE);

  p_KetQua := 1;
  p_Loi := NULL;

EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SUBSTR(SQLERRM, 1, 4000);
    p_AnnualRevenue := 0;
    p_AnnualTickets := 0;
    p_NewUsers := 0;
END SP_GET_ANNUAL_STATS;
/

-- PROCEDURE: SP_GET_MONTHLY_REVENUE
-- Purpose: Get monthly revenue breakdown for current year 
-- ============================================================================

CREATE OR REPLACE PROCEDURE SP_GET_MONTHLY_REVENUE (
  p_cursor OUT SYS_REFCURSOR,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) IS
BEGIN
  EXECUTE IMMEDIATE 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE';
  OPEN p_cursor FOR
    SELECT 
      EXTRACT(MONTH FROM gd.THOIGIANTAO) as thang,
      SUM(gd.TONGTIEN) as doanhthu
    FROM GIAO_DICH gd
    WHERE gd.TRANGTHAIGD = 'Paid'
      AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)
    GROUP BY EXTRACT(MONTH FROM gd.THOIGIANTAO)
    ORDER BY thang ASC
    FETCH FIRST 12 ROWS ONLY;
  
  p_KetQua := 1;
  p_Loi := NULL;

EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SUBSTR(SQLERRM, 1, 4000);
END SP_GET_MONTHLY_REVENUE;
/


