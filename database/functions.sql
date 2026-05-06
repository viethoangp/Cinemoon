--1 Tính giá vé tự động
CREATE OR REPLACE FUNCTION FN_TINH_GIA_VE (
    p_MaSuat IN VARCHAR2,
    p_MaGhe IN VARCHAR2,
    p_MaKH IN VARCHAR2
) RETURN NUMBER 
AS
    v_GiaVe NUMBER := 0;
BEGIN
    -- Truy vấn tính giá vé dựa trên loại ghế và loại khách từ bảng QUY_DINH_GIA
    SELECT D.DONGIA * D.HESONHAN INTO v_GiaVe
    FROM QUY_DINH_GIA D
    JOIN GHE_NGOI G ON D.MALOAIGHE = G.MALOAIGHE
    JOIN KHACH_HANG K ON D.MALOAIKHACH = K.MALOAIKHACH
    WHERE G.MAGHE = p_MaGhe 
      AND K.MAKH = p_MaKH
      -- Nếu hệ thống có nhiều khung giờ giá, bạn có thể bổ sung điều kiện giờ ở đây
      AND ROWNUM = 1; -- Đảm bảo chỉ trả về 1 kết quả duy nhất

    RETURN v_GiaVe;
EXCEPTION
    WHEN NO_DATA_FOUND THEN 
        RETURN 0;
    WHEN OTHERS THEN 
        RETURN -1;
END;
/
--2. Kiểm tra độ tuổi
CREATE OR REPLACE FUNCTION FN_KIEM_TRA_DO_TUOI (
    p_MaKH IN VARCHAR2,
    p_MaPhim IN VARCHAR2
) RETURN NUMBER
AS
    v_TuoiKH NUMBER;
    v_GioiHanTuoi NUMBER;
BEGIN
    -- Lấy tuổi khách hàng (Tính theo năm hiện tại)
    SELECT FLOOR(MONTHS_BETWEEN(SYSDATE, NGAYSINH) / 12) INTO v_TuoiKH
    FROM KHACH_HANG 
    WHERE MAKH = p_MaKH;

    -- Lấy giới hạn tuổi của phim
    SELECT GIOIHANTUOI INTO v_GioiHanTuoi
    FROM PHIM 
    WHERE MAPHIM = p_MaPhim;

    -- Kiểm tra điều kiện
    IF v_TuoiKH >= NVL(v_GioiHanTuoi, 0) THEN
        RETURN 1; -- Đủ điều kiện
    ELSE
        RETURN 0; -- Không đủ tuổi
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN 
        RETURN 0;
    WHEN OTHERS THEN
        RETURN 0;
END;
/