-- ========================================
-- PHASE 2: Movie Management Stored Procedures
-- ========================================

-- Generate unique movie ID (P + sequential number)
CREATE SEQUENCE SEQ_PHIM START WITH 1 INCREMENT BY 1 NOCYCLE;

-- ========================================
-- SP_GET_PHIM_LIST
-- Purpose: Get all movies with pagination + search
-- ========================================
CREATE PROCEDURE SP_GET_PHIM_LIST(
  p_TimKiem VARCHAR2,
  p_Trang NUMBER,
  p_TrongTrang NUMBER,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_CurPhim OUT SYS_REFCURSOR
) AS
  v_Offset NUMBER;
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  -- Calculate offset for pagination
  v_Offset := (p_Trang - 1) * p_TrongTrang;
  
  OPEN p_CurPhim FOR
    SELECT 
      p.MAPHIM,
      p.TENPHIM,
      p.MOTA,
      p.DACDIEM,
      p.THOIGIANPHIM,
      p.NGAYPHATHANHTHUYETMINH,
      p.POSTER,
      p.DAIPHIM,
      p.DIRECTOR_NAME,
      (SELECT COUNT(*) FROM SUAT_CHIEU sc WHERE sc.MAPHIM = p.MAPHIM) as SO_SUAT_CHIEU,
      NVL((SELECT SUM(gd.TONGTIEN) FROM GIAO_DICH gd 
           JOIN VE v ON gd.MAGD = v.MAGD 
           JOIN SUAT_CHIEU sc ON v.MASUAT = sc.MASUAT 
           WHERE sc.MAPHIM = p.MAPHIM AND gd.TRANGTHAIGD = 'Paid' 
           AND EXTRACT(MONTH FROM gd.THOIGIANTAO) = EXTRACT(MONTH FROM SYSDATE)
           AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)), 0) as DOANHTHU_THANG
    FROM PHIM p
    WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%')
       OR UPPER(p.DIRECTOR_NAME) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%')
    ORDER BY p.THOIGIANTAO DESC
    OFFSET v_Offset ROWS FETCH NEXT p_TrongTrang ROWS ONLY;
  
  p_KetQua := 1;
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_PHIM_LIST;
/

-- ========================================
-- SP_GET_PHIM_BY_ID
-- Purpose: Get single movie details for edit form
-- ========================================
CREATE PROCEDURE SP_GET_PHIM_BY_ID(
  p_MaPhim VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_CurPhim OUT SYS_REFCURSOR
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  OPEN p_CurPhim FOR
    SELECT 
      p.MAPHIM,
      p.TENPHIM,
      p.MOTA,
      p.DACDIEM,
      p.THOIGIANPHIM,
      p.NGAYPHATHANHTHUYETMINH,
      p.POSTER,
      p.DAIPHIM,
      p.DIRECTOR_NAME,
      (SELECT COUNT(*) FROM SUAT_CHIEU sc WHERE sc.MAPHIM = p.MAPHIM) as SO_SUAT_CHIEU
    FROM PHIM p
    WHERE p.MAPHIM = p_MaPhim;
  
  p_KetQua := 1;
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_PHIM_BY_ID;
/

-- ========================================
-- SP_CREATE_PHIM
-- Purpose: Create new movie with generated ID
-- ========================================
CREATE PROCEDURE SP_CREATE_PHIM(
  p_TenPhim VARCHAR2,
  p_MoTa CLOB,
  p_DacDiem VARCHAR2,
  p_ThoiGianPhim NUMBER,
  p_NgayPhatHanhThuyetMinh DATE,
  p_Poster VARCHAR2,
  p_DaiPhim VARCHAR2,
  p_DirectorName VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_MaPhimOut OUT VARCHAR2
) AS
  v_MaPhim VARCHAR2(20);
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  -- Generate movie ID: P + LPAD(sequence, 5, '0')
  v_MaPhim := 'P' || LPAD(SEQ_PHIM.NEXTVAL, 5, '0');
  
  -- Insert new movie
  INSERT INTO PHIM (
    MAPHIM, TENPHIM, MOTA, DACDIEM, THOIGIANPHIM,
    NGAYPHATHANHTHUYETMINH, POSTER, DAIPHIM, DIRECTOR_NAME, THOIGIANTAO
  ) VALUES (
    v_MaPhim, p_TenPhim, p_MoTa, p_DacDiem, p_ThoiGianPhim,
    p_NgayPhatHanhThuyetMinh, p_Poster, p_DaiPhim, p_DirectorName, CURRENT_TIMESTAMP
  );
  
  COMMIT;
  p_KetQua := 1;
  p_MaPhimOut := v_MaPhim;
  
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_CREATE_PHIM;
/

-- ========================================
-- SP_UPDATE_PHIM
-- Purpose: Update existing movie
-- ========================================
CREATE PROCEDURE SP_UPDATE_PHIM(
  p_MaPhim VARCHAR2,
  p_TenPhim VARCHAR2,
  p_MoTa CLOB,
  p_DacDiem VARCHAR2,
  p_ThoiGianPhim NUMBER,
  p_NgayPhatHanhThuyetMinh DATE,
  p_Poster VARCHAR2,
  p_DaiPhim VARCHAR2,
  p_DirectorName VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  UPDATE PHIM SET
    TENPHIM = p_TenPhim,
    MOTA = p_MoTa,
    DACDIEM = p_DacDiem,
    THOIGIANPHIM = p_ThoiGianPhim,
    NGAYPHATHANHTHUYETMINH = p_NgayPhatHanhThuyetMinh,
    POSTER = p_Poster,
    DAIPHIM = p_DaiPhim,
    DIRECTOR_NAME = p_DirectorName
  WHERE MAPHIM = p_MaPhim;
  
  COMMIT;
  p_KetQua := 1;
  
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_UPDATE_PHIM;
/

-- ========================================
-- SP_DELETE_PHIM
-- Purpose: Delete movie (soft or hard based on bookings)
-- ========================================
CREATE PROCEDURE SP_DELETE_PHIM(
  p_MaPhim VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) AS
  v_CountBookings NUMBER;
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  -- Check if movie has bookings
  SELECT COUNT(*) INTO v_CountBookings
  FROM VE v
  JOIN SUAT_CHIEU sc ON v.MASUAT = sc.MASUAT
  WHERE sc.MAPHIM = p_MaPhim;
  
  IF v_CountBookings > 0 THEN
    -- Soft delete: mark as inactive or set status flag
    -- Note: Depends on your PHIM table structure - add TRANGTHAI column if needed
    p_Loi := 'Phim đã có đặt vé. Không thể xóa hoàn toàn. Hãy vô hiệu hóa thay vào đó.';
    p_KetQua := 0;
  ELSE
    -- Hard delete: remove from database
    DELETE FROM PHIM WHERE MAPHIM = p_MaPhim;
    COMMIT;
    p_KetQua := 1;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_DELETE_PHIM;
/

-- ========================================
-- SP_GET_DAI_LIST
-- Purpose: Get all genres (for dropdown)
-- ========================================
CREATE PROCEDURE SP_GET_DAI_LIST(
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_CurDai OUT SYS_REFCURSOR
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  OPEN p_CurDai FOR
    SELECT MADAI, TENDAI
    FROM DAI
    ORDER BY TENDAI ASC;
  
  p_KetQua := 1;
  
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_DAI_LIST;
/

-- ========================================
-- SP_GET_PHIM_COUNT
-- Purpose: Get total count for pagination
-- ========================================
CREATE PROCEDURE SP_GET_PHIM_COUNT(
  p_TimKiem VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_TotalCount OUT NUMBER
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  SELECT COUNT(*) INTO p_TotalCount
  FROM PHIM p
  WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%')
     OR UPPER(p.DIRECTOR_NAME) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%');
  
  p_KetQua := 1;
  
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
    p_TotalCount := 0;
END SP_GET_PHIM_COUNT;
/

COMMIT;
