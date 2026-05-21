-- ========================================
-- PHASE 2: Quản lý Phim - Đã được Senior FIX 100% chuẩn Schema
-- ========================================

-- 1. LẤY DANH SÁCH PHIM (CÓ PHÂN TRANG & TÌM KIẾM)
CREATE OR REPLACE PROCEDURE SP_GET_PHIM_LIST(
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
  
  v_Offset := (p_Trang - 1) * p_TrongTrang;
  
  OPEN p_CurPhim FOR
    SELECT 
      p.MAPHIM,
      p.TENPHIM,
      p.THELOAI,
      p.THOILUONG,
      p.DAODIEN,
      p.DIENVIEN,
      p.NGAYPHATHANH,
      p.POSTER,
      p.TRAILER,
      p.MOTA,
      p.GIOIHANTUOI,
      p.TRANGTHAI,
      (SELECT COUNT(*) FROM SUAT_CHIEU sc WHERE sc.MAPHIM = p.MAPHIM) as SO_SUAT_CHIEU
    FROM PHIM p
    WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%')
       OR UPPER(p.DAODIEN) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%')
    ORDER BY p.MAPHIM DESC
    OFFSET v_Offset ROWS FETCH NEXT p_TrongTrang ROWS ONLY;
  
  p_KetQua := 1;
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_PHIM_LIST;
/

-- 2. LẤY CHI TIẾT 1 BỘ PHIM
CREATE OR REPLACE PROCEDURE SP_GET_PHIM_BY_ID(
  p_MaPhim VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_CurPhim OUT SYS_REFCURSOR
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  OPEN p_CurPhim FOR
    SELECT * FROM PHIM WHERE MAPHIM = p_MaPhim;
    
  p_KetQua := 1;
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_PHIM_BY_ID;
/

-- 3. THÊM PHIM MỚI
CREATE OR REPLACE PROCEDURE SP_CREATE_PHIM(
  p_TenPhim VARCHAR2,
  p_TheLoai VARCHAR2,
  p_ThoiLuong NUMBER,
  p_DaoDien VARCHAR2,
  p_DienVien VARCHAR2,
  p_NgayPhatHanh DATE,
  p_Poster VARCHAR2,
  p_Trailer VARCHAR2,
  p_MoTa CLOB,
  p_GioiHanTuoi NUMBER,
  p_TrangThai VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_MaPhimOut OUT VARCHAR2
) AS
  v_MaPhim VARCHAR2(20);
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  v_MaPhim := 'P' || LPAD(SEQ_PHIM.NEXTVAL, 5, '0');
  
  INSERT INTO PHIM (
    MAPHIM, TENPHIM, THELOAI, THOILUONG, DAODIEN, DIENVIEN,
    NGAYPHATHANH, POSTER, TRAILER, MOTA, GIOIHANTUOI, TRANGTHAI
  ) VALUES (
    v_MaPhim, p_TenPhim, p_TheLoai, p_ThoiLuong, p_DaoDien, p_DienVien,
    p_NgayPhatHanh, p_Poster, p_Trailer, p_MoTa, p_GioiHanTuoi, p_TrangThai
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

-- 4. CẬP NHẬT PHIM
CREATE OR REPLACE PROCEDURE SP_UPDATE_PHIM(
  p_MaPhim VARCHAR2,
  p_TenPhim VARCHAR2,
  p_TheLoai VARCHAR2,
  p_ThoiLuong NUMBER,
  p_DaoDien VARCHAR2,
  p_DienVien VARCHAR2,
  p_NgayPhatHanh DATE,
  p_Poster VARCHAR2,
  p_Trailer VARCHAR2,
  p_MoTa CLOB,
  p_GioiHanTuoi NUMBER,
  p_TrangThai VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  UPDATE PHIM SET 
    TENPHIM = p_TenPhim,
    THELOAI = p_TheLoai,
    THOILUONG = p_ThoiLuong,
    DAODIEN = p_DaoDien,
    DIENVIEN = p_DienVien,
    NGAYPHATHANH = p_NgayPhatHanh,
    POSTER = p_Poster,
    TRAILER = p_Trailer,
    MOTA = p_MoTa,
    GIOIHANTUOI = p_GioiHanTuoi,
    TRANGTHAI = p_TrangThai
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

-- 5. XÓA PHIM (XÓA MỀM)
CREATE OR REPLACE PROCEDURE SP_DELETE_PHIM(
  p_MaPhim VARCHAR2,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) AS
  v_Count NUMBER;
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  SELECT COUNT(*) INTO v_Count FROM SUAT_CHIEU WHERE MAPHIM = p_MaPhim;
  
  IF v_Count > 0 THEN
    UPDATE PHIM SET TRANGTHAI = 'Archived' WHERE MAPHIM = p_MaPhim;
    COMMIT;
    p_Loi := 'Phim đã có suất chiếu, chuyển sang trạng thái Lưu trữ (Archived).';
    p_KetQua := 1;
  ELSE
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

-- 6. LẤY DANH SÁCH THỂ LOẠI 
CREATE OR REPLACE PROCEDURE SP_GET_DAI_LIST(
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2,
  p_CurDai OUT SYS_REFCURSOR
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  OPEN p_CurDai FOR
    SELECT DISTINCT THELOAI as MADAI, THELOAI as TENDAI
    FROM PHIM
    WHERE THELOAI IS NOT NULL
    ORDER BY THELOAI ASC;
  
  p_KetQua := 1;
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_DAI_LIST;
/

-- 7. ĐẾM TỔNG SỐ PHIM (CHO PHÂN TRANG)
CREATE OR REPLACE PROCEDURE SP_GET_PHIM_COUNT(
  p_TimKiem VARCHAR2,
  p_TotalCount OUT NUMBER,
  p_KetQua OUT NUMBER,
  p_Loi OUT VARCHAR2
) AS
BEGIN
  p_KetQua := 0;
  p_Loi := NULL;
  
  SELECT COUNT(*) INTO p_TotalCount 
  FROM PHIM 
  WHERE UPPER(TENPHIM) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%')
     OR UPPER(DAODIEN) LIKE UPPER('%' || NVL(p_TimKiem, '') || '%');
     
  p_KetQua := 1;
EXCEPTION
  WHEN OTHERS THEN
    p_KetQua := 0;
    p_Loi := SQLERRM;
END SP_GET_PHIM_COUNT;
/