

-- 1. SP_TAO_KHACH_HANG
CREATE OR REPLACE PROCEDURE SP_TAO_KHACH_HANG (
    p_TenDangNhap IN VARCHAR2,
    p_MatKhau IN VARCHAR2,     
    p_HoTen IN NVARCHAR2,
    p_NgaySinh IN DATE,
    p_GioiTinh IN NVARCHAR2,
    p_SDT IN VARCHAR2,
    p_Email IN VARCHAR2,
    p_MaKH OUT VARCHAR2,       
    p_KetQua OUT NUMBER,
    p_Loi OUT NVARCHAR2
)
AS
    v_Count NUMBER;
    v_MaTK VARCHAR2(20);
    v_MaKH VARCHAR2(20);
    v_MaLoaiKhach VARCHAR2(10) := 'LK001'; 
BEGIN
    -- 1. Kiểm tra Tên đăng nhập
    SELECT COUNT(*) INTO v_Count FROM TAI_KHOAN WHERE TENDANGNHAP = p_TenDangNhap;
    IF v_Count > 0 THEN
        p_KetQua := 0; p_Loi := 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.'; RETURN;
    END IF;

    -- 2. Kiểm tra Số điện thoại
    SELECT COUNT(*) INTO v_Count FROM KHACH_HANG WHERE SDT = p_SDT;
    IF v_Count > 0 THEN
        p_KetQua := 0; p_Loi := 'Số điện thoại này đã được đăng ký.'; RETURN;
    END IF;

    -- 3. Sinh mã tự động
    v_MaTK := 'TK' || LPAD(SEQ_TK.NEXTVAL, 3, '0');
    v_MaKH := 'KH' || LPAD(SEQ_KH.NEXTVAL, 6, '0');

    -- 4. Insert vào TAI_KHOAN (Sửa 'HoatDong' thành 'Active')
    INSERT INTO TAI_KHOAN (MATK, TENDANGNHAP, MATKHAU, QUYENTRUYCAP, TRANGTHAITAIKHOAN, THOIGIANTAO)
    VALUES (v_MaTK, p_TenDangNhap, p_MatKhau, 'Customer', 'Active', SYSTIMESTAMP);

    -- 5. Insert vào KHACH_HANG
    INSERT INTO KHACH_HANG (MAKH, MATK, MALOAIKHACH, HOTEN, NGAYSINH, GIOITINH, SDT, EMAIL, DIEMTICHLUY)
    VALUES (v_MaKH, v_MaTK, v_MaLoaiKhach, p_HoTen, p_NgaySinh, p_GioiTinh, p_SDT, p_Email, 0);

    p_MaKH := v_MaKH; p_KetQua := 1; p_Loi := 'Tạo tài khoản khách hàng thành công.';
    COMMIT; 

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK; 
        p_KetQua := 0; p_Loi := 'Lỗi dữ liệu: Thông tin (Email/SĐT) bị trùng lặp.';
    WHEN OTHERS THEN
        ROLLBACK; 
        p_KetQua := 0; p_Loi := 'Lỗi hệ thống trong quá trình tạo tài khoản: ' || SQLERRM;
END;
/
-- 2. SP_THEM_PHIM_MOI
CREATE OR REPLACE PROCEDURE SP_THEM_PHIM_MOI (
    p_TenPhim       IN NVARCHAR2,
    p_ThoiLuong     IN NUMBER,
    p_DaoDien       IN NVARCHAR2,
    p_GioiHanTuoi   IN NUMBER,
    p_MaPhim        OUT VARCHAR2,
    p_KetQua        OUT NUMBER,
    p_Loi           OUT NVARCHAR2
)
IS
    v_MaPhim VARCHAR2(20);
BEGIN
    IF p_ThoiLuong <= 0 THEN
        p_KetQua := 0;
        p_Loi := 'Thời lượng phim không hợp lệ.';
        RETURN;
    END IF;

    v_MaPhim := 'PH' || LPAD(SEQ_PHIM.NEXTVAL, 4, '0');

    INSERT INTO PHIM (MAPHIM, TENPHIM, THOILUONG, DAODIEN, GIOIHANTUOI, TRANGTHAI)
    VALUES (v_MaPhim, p_TenPhim, p_ThoiLuong, p_DaoDien, p_GioiHanTuoi, 'Upcoming');

    COMMIT;
    p_MaPhim := v_MaPhim;
    p_KetQua := 1;
    p_Loi := 'Thêm phim thành công.';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống: ' || SQLERRM;
END;
/

-- 3. SP_TAO_SUAT_CHIEU
CREATE OR REPLACE PROCEDURE SP_TAO_SUAT_CHIEU (
    p_MaPhim     IN VARCHAR2,
    p_MaPhong    IN VARCHAR2,
    p_NgayChieu  IN DATE,
    p_GioBatDau  IN TIMESTAMP,
    p_MaSuat     OUT VARCHAR2,
    p_KetQua     OUT NUMBER,
    p_Loi        OUT NVARCHAR2
)
IS
    v_ThoiLuong NUMBER;
    v_GioKetThuc TIMESTAMP;
    v_Count NUMBER;
    v_MaSuat VARCHAR2(20);
BEGIN
    -- Lấy thời lượng phim
    BEGIN
        SELECT THOILUONG INTO v_ThoiLuong FROM PHIM WHERE MAPHIM = p_MaPhim;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_KetQua := 0;
            p_Loi := 'Phim không tồn tại.';
            RETURN;
    END;

    -- Tính giờ kết thúc
    v_GioKetThuc := p_GioBatDau + NUMTODSINTERVAL(v_ThoiLuong, 'MINUTE');

    -- Kiểm tra trùng lịch (Logic của bạn em làm rất chuẩn)
    SELECT COUNT(*) INTO v_Count
    FROM SUAT_CHIEU
    WHERE MAPHONG = p_MaPhong
    AND (p_GioBatDau < GIOKETTHUC AND v_GioKetThuc > GIOBATDAU);

    IF v_Count > 0 THEN
        p_KetQua := 0;
        p_Loi := 'Phòng chiếu bị trùng lịch ở khung giờ này.';
        RETURN;
    END IF;

    v_MaSuat := 'SC' || LPAD(SEQ_SC.NEXTVAL, 6, '0');

    INSERT INTO SUAT_CHIEU (MASUAT, MAPHIM, MAPHONG, NGAYCHIEU, GIOBATDAU, GIOKETTHUC, TRANGTHAISUAT)
    VALUES (v_MaSuat, p_MaPhim, p_MaPhong, p_NgayChieu, p_GioBatDau, v_GioKetThuc, 'Upcoming');

    COMMIT;
    p_MaSuat := v_MaSuat;
    p_KetQua := 1;
    p_Loi := 'Tạo suất chiếu thành công.';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống: ' || SQLERRM;
END;
/

--4 SP_CAPNHAT_KHUYENMAI
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_KHUYENMAI (
    p_MaKM     IN VARCHAR2,
    p_GiaTri   IN NUMBER,
    p_DieuKien IN NUMBER,
    p_NgayKT   IN TIMESTAMP,
    p_KetQua   OUT NUMBER,
    p_Loi      OUT NVARCHAR2
)
IS
    v_NgayBD TIMESTAMP;
BEGIN
    BEGIN
        SELECT NGAYBATDAU INTO v_NgayBD FROM KHUYEN_MAI WHERE MAKHUYENMAI = p_MaKM;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_KetQua := 0;
            p_Loi := 'Chương trình khuyến mãi không tồn tại.';
            RETURN;
    END;

    IF p_NgayKT < v_NgayBD THEN
        p_KetQua := 0;
        p_Loi := 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu.';
        RETURN;
    END IF;

    UPDATE KHUYEN_MAI
    SET GIATRIGIAM = p_GiaTri,
        DIEUKIENAPDUNG = p_DieuKien,
        NGAYKETTHUC = p_NgayKT
    WHERE MAKHUYENMAI = p_MaKM;

    IF p_NgayKT < CURRENT_TIMESTAMP THEN
        UPDATE GIAO_DICH
        SET TRANGTHAIGD = 'Cancelled'
        WHERE MAKHUYENMAI = p_MaKM
        AND TRANGTHAIGD = 'Pending';
    END IF;

    COMMIT;
    p_KetQua := 1;
    p_Loi := 'Cập nhật khuyến mãi thành công.';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống: ' || SQLERRM;
END;
/

-- 5.SP_KHOA_TAI_KHOAN
CREATE OR REPLACE PROCEDURE SP_KHOA_TAI_KHOAN (
    p_MaTK   IN VARCHAR2,
    p_LyDo   IN VARCHAR2,
    p_KetQua OUT NUMBER,
    p_Loi    OUT NVARCHAR2
)
IS
BEGIN
    UPDATE TAI_KHOAN
    SET TRANGTHAITAIKHOAN = 'Locked',
        THOIGIANHETHAN = CURRENT_TIMESTAMP
    WHERE MATK = p_MaTK;

    IF SQL%ROWCOUNT = 0 THEN
        p_KetQua := 0;
        p_Loi := 'Tài khoản không tồn tại.';
        RETURN;
    END IF;

    COMMIT;
    p_KetQua := 1;
    p_Loi := 'Đã khóa tài khoản thành công.';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống: ' || SQLERRM;
END;
/

-- 6. SP_KHOI_TAO_GIAO_DICH
CREATE OR REPLACE PROCEDURE SP_KHOI_TAO_GIAO_DICH (
    p_MaKH   IN VARCHAR2,
    p_MaGD   OUT VARCHAR2,
    p_KetQua OUT NUMBER,
    p_Loi    OUT NVARCHAR2
)
IS
    v_Count NUMBER;
    v_MaGD VARCHAR2(20);
BEGIN
    SELECT COUNT(*) INTO v_Count FROM KHACH_HANG WHERE MAKH = p_MaKH;

    IF v_Count = 0 THEN
        p_KetQua := 0;
        p_Loi := 'Khách hàng không tồn tại trong hệ thống.';
        RETURN;
    END IF;

    v_MaGD := 'GD' || LPAD(SEQ_GD.NEXTVAL, 8, '0');

    INSERT INTO GIAO_DICH (MAGD, MAKH, MAKHUYENMAI, THOIGIANTAO, TONGTIEN, TRANGTHAIGD)
    VALUES (v_MaGD, p_MaKH, NULL, CURRENT_TIMESTAMP, 0, 'Pending');

    COMMIT;
    p_MaGD := v_MaGD;
    p_KetQua := 1;
    p_Loi := 'Khởi tạo giao dịch thành công.';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống: ' || SQLERRM;
END;
/

--7. SP_GIU_GHE_DAT_CHO
CREATE OR REPLACE PROCEDURE SP_GIU_GHE_DAT_CHO (
    p_MaGD IN VARCHAR2,
    p_MaSuat IN VARCHAR2,
    p_MaGhe IN VARCHAR2,
    p_KetQua OUT NUMBER,
    p_Loi OUT NVARCHAR2
)
AS
    v_Dummy NUMBER;
    v_Count NUMBER;
    v_TrangThai NVARCHAR2(20);
    v_GiuDen TIMESTAMP;
BEGIN
    -- 1. BẪY TRANH CHẤP ĐỒNG THỜI (CONCURRENCY)
    -- Khóa cứng cái ghế vật lý này lại. Nếu người khác đang chạy SP này cho cùng 1 ghế, 
    -- lệnh này sẽ văng lỗi ORA-00054 ngay lập tức và nhảy xuống EXCEPTION!
    SELECT 1 INTO v_Dummy FROM GHE_NGOI 
    WHERE MAGHE = p_MaGhe 
    FOR UPDATE NOWAIT;

    -- 2. THUỐC NGỦ DEMO (Giữ khóa trong 5 giây để demo cho giáo viên xem)
    DBMS_SESSION.SLEEP(5);

    -- 3. XỬ LÝ LOGIC ĐẶT CHỖ
    SELECT COUNT(*) INTO v_Count FROM DAT_CHO WHERE MASUAT = p_MaSuat AND MAGHE = p_MaGhe;

    IF v_Count > 0 THEN
        SELECT TRANGTHAICHO, GIUDEN INTO v_TrangThai, v_GiuDen
        FROM DAT_CHO
        WHERE MASUAT = p_MaSuat AND MAGHE = p_MaGhe;

        IF (v_TrangThai = 'Held' AND v_GiuDen >= SYSDATE) OR v_TrangThai = 'Paid' THEN
            p_KetQua := 0;
            p_Loi := 'Thất bại: Ghế này đã có người đặt hoặc đang được giữ hợp lệ.';
            ROLLBACK; -- Nhả khóa
            RETURN; 
        ELSE
            UPDATE DAT_CHO
            SET MAGD = p_MaGD,
                THOIGIANGIU = SYSDATE,
                GIUDEN = SYSDATE + INTERVAL '10' MINUTE,
                TRANGTHAICHO = 'Held'
            WHERE MASUAT = p_MaSuat AND MAGHE = p_MaGhe;
        END IF;
    ELSE
        INSERT INTO DAT_CHO (MASUAT, MAGHE, MAGD, THOIGIANGIU, GIUDEN, TRANGTHAICHO)
        VALUES (p_MaSuat, p_MaGhe, p_MaGD, SYSDATE, SYSDATE + INTERVAL '10' MINUTE, 'Held');
    END IF;
    -- 4. THÀNH CÔNG VÀ NHẢ KHÓA
    p_KetQua := 1;
    p_Loi := 'Giữ ghế thành công.';
    COMMIT;

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi xung đột: Ghế vừa được người khác chọn. Vui lòng thử lại.';
    WHEN OTHERS THEN
        ROLLBACK;
        -- Nếu là lỗi đụng khóa (ORA-00054), quăng thẳng lên Node.js
        IF SQLCODE = -54 THEN 
            RAISE; 
        ELSE
            p_KetQua := 0;
            p_Loi := 'Lỗi hệ thống không xác định: ' || SQLERRM;
        END IF;
END;
/

-- 8. SP_AP_DUNG_VOUCHER
CREATE OR REPLACE PROCEDURE SP_AP_DUNG_VOUCHER (
    p_MaGD IN VARCHAR2,
    p_MaKhuyenMai IN VARCHAR2,
    p_TienGiam OUT NUMBER,
    p_KetQua OUT NUMBER,
    p_Loi OUT NVARCHAR2
)
AS
    v_TrangThaiGD NVARCHAR2(50);
    v_TongTienGoc NUMBER(15,0) := 0;
    v_DieuKien NUMBER(15,0);
    v_GiaTriGiam NUMBER(15,0);
    v_NgayBD TIMESTAMP;
    v_NgayKT TIMESTAMP;
BEGIN
    BEGIN
        SELECT TRANGTHAIGD INTO v_TrangThaiGD FROM GIAO_DICH WHERE MAGD = p_MaGD;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_KetQua := 0; p_Loi := 'Không tìm thấy giao dịch.'; RETURN;
    END;

    IF v_TrangThaiGD != 'Pending' THEN
        p_KetQua := 0; p_Loi := 'Chỉ có thể áp dụng Voucher cho giao dịch đang chờ thanh toán.'; RETURN;
    END IF;

    BEGIN
        SELECT GIATRIGIAM, DIEUKIENAPDUNG, NGAYBATDAU, NGAYKETTHUC 
        INTO v_GiaTriGiam, v_DieuKien, v_NgayBD, v_NgayKT
        FROM KHUYEN_MAI WHERE MAKHUYENMAI = p_MaKhuyenMai;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_KetQua := 0; p_Loi := 'Mã khuyến mãi không tồn tại.'; RETURN;
    END;

    IF CURRENT_TIMESTAMP NOT BETWEEN v_NgayBD AND v_NgayKT THEN
        p_KetQua := 0; p_Loi := 'Mã khuyến mãi chưa có hiệu lực hoặc đã hết hạn.'; RETURN;
    END IF;
    -- Gọi Function thay vì JOIN để tránh nhân bản tiền
    SELECT NVL(SUM(FN_TINH_GIA_VE(d.MASUAT, d.MAGHE, g.MAKH)), 0) INTO v_TongTienGoc
    FROM DAT_CHO d
    JOIN GIAO_DICH g ON d.MAGD = g.MAGD
    WHERE d.MAGD = p_MaGD AND d.TRANGTHAICHO = 'Held';

    IF v_TongTienGoc = 0 THEN
        p_KetQua := 0; p_Loi := 'Giao dịch chưa có ghế nào được giữ hợp lệ.'; RETURN;
    END IF;

    IF v_TongTienGoc < v_DieuKien THEN
        p_KetQua := 0; p_Loi := 'Tổng tiền chưa đủ điều kiện áp dụng mã khuyến mãi này.'; RETURN;
    END IF;

    p_TienGiam := v_GiaTriGiam;
    IF v_TongTienGoc < p_TienGiam THEN
        v_TongTienGoc := 0; 
    ELSE
        v_TongTienGoc := v_TongTienGoc - p_TienGiam;
    END IF;

    UPDATE GIAO_DICH
    SET MAKHUYENMAI = p_MaKhuyenMai,
        TONGTIEN = v_TongTienGoc
    WHERE MAGD = p_MaGD;

    p_KetQua := 1;
    p_Loi := 'Áp dụng mã khuyến mãi thành công.';
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0; p_TienGiam := 0;
        p_Loi := 'Lỗi hệ thống: ' || SQLERRM;
END;
/

-- 10. SP_PHAT_HANH_VE
CREATE OR REPLACE PROCEDURE SP_PHAT_HANH_VE (
    p_MaGD IN VARCHAR2,
    p_SoVeDaIn OUT NUMBER
)
AS
    v_MaVe VARCHAR2(20);
    v_Count NUMBER := 0;
BEGIN
    FOR rec IN (
        SELECT d.MASUAT, d.MAGHE, 
               (SELECT MAQUYDINH FROM QUY_DINH_GIA WHERE MALOAIGHE = gh.MALOAIGHE AND MALOAIKHACH = kh.MALOAIKHACH AND ROWNUM = 1) AS MAQUYDINH,
               FN_TINH_GIA_VE(d.MASUAT, d.MAGHE, g.MAKH) AS GIAVETHUCTE
        FROM DAT_CHO d
        JOIN GIAO_DICH g ON d.MAGD = g.MAGD
        JOIN GHE_NGOI gh ON d.MAGHE = gh.MAGHE
        JOIN KHACH_HANG kh ON g.MAKH = kh.MAKH
        WHERE d.MAGD = p_MaGD AND d.TRANGTHAICHO = 'Held'
    ) 
    LOOP
        v_Count := v_Count + 1;
        v_MaVe := 'VE' || LPAD(SEQ_VE.NEXTVAL, 8, '0');

        INSERT INTO VE (MAVE, MAGD, MASUAT, MAGHE, MAQUYDINH, GIAVETHUCTE, TRANGTHAIVE)
        VALUES (v_MaVe, p_MaGD, rec.MASUAT, rec.MAGHE, rec.MAQUYDINH, rec.GIAVETHUCTE, 'Issued');

        UPDATE DAT_CHO
        SET TRANGTHAICHO = 'Paid'
        WHERE MASUAT = rec.MASUAT AND MAGHE = rec.MAGHE;
    END LOOP;

    p_SoVeDaIn := v_Count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Lỗi tạo vé vật lý: ' || SQLERRM);
END;
/
-- 9. SP_XU_LY_THANH_TOAN
CREATE OR REPLACE PROCEDURE SP_XU_LY_THANH_TOAN (
    p_MaGD IN VARCHAR2,
    p_PhuongThuc IN NVARCHAR2,
    p_SoTien IN NUMBER,
    p_KetQua OUT NUMBER,
    p_Loi OUT NVARCHAR2
)
AS
    v_TongTienCanThanhToan NUMBER(15,0);
    v_TrangThaiGD NVARCHAR2(50);
    v_MaThanhToan VARCHAR2(20);
BEGIN
    -- [Bước 2] Kiểm tra tồn tại và trạng thái giao dịch
    BEGIN
        SELECT TONGTIEN, TRANGTHAIGD INTO v_TongTienCanThanhToan, v_TrangThaiGD
        FROM GIAO_DICH
        WHERE MAGD = p_MaGD;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_KetQua := 0;
            p_Loi := 'Lỗi: Không tìm thấy mã giao dịch này.';
            RETURN;
    END;

    IF v_TrangThaiGD != 'Pending' THEN
        p_KetQua := 0;
        p_Loi := 'Lỗi: Giao dịch này đã được xử lý hoặc đã bị hủy.';
        RETURN;
    END IF;

    -- [Bước 3] Kiểm tra số tiền khớp với hóa đơn (RBTV 2.2.6)
    IF p_SoTien != v_TongTienCanThanhToan THEN
        p_KetQua := 0;
        p_Loi := 'Lỗi: Số tiền thanh toán không khớp với tổng tiền hóa đơn.';
        RETURN;
    END IF;

    -- [Bước 4] Ghi nhận thanh toán và cập nhật trạng thái
    v_MaThanhToan := 'TT' || LPAD(SEQ_TT.NEXTVAL, 8, '0');
    
    INSERT INTO THANH_TOAN (MATHANHTOAN, MAGD, PHUONGTHUC, SOTIEN, TRANGTHAITT)
    VALUES (v_MaThanhToan, p_MaGD, p_PhuongThuc, p_SoTien, 'Success');

    UPDATE GIAO_DICH
    SET TRANGTHAIGD = 'Paid'
    WHERE MAGD = p_MaGD;

    -- [Bước 5] Gọi SP con phát hành vé
    DECLARE
        v_SoVe NUMBER;
    BEGIN
        SP_PHAT_HANH_VE(p_MaGD, v_SoVe);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Lỗi khi phát hành vé: ' || SQLERRM);
    END;

    -- [Bước 6] Chốt giao dịch
    p_KetQua := 1;
    p_Loi := 'Thanh toán và phát hành vé thành công.';
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK; -- Đảm bảo tính ACID
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống trong quá trình thanh toán: ' || SQLERRM;
END;
/



-- 11. SP_HUY_GIAO_DICH
CREATE OR REPLACE PROCEDURE SP_HUY_GIAO_DICH (
    p_MaGD IN VARCHAR2,
    p_NguoiHuy IN VARCHAR2,
    p_KetQua OUT NUMBER,
    p_Loi OUT NVARCHAR2
)
AS
BEGIN
    -- 1. Đổi trạng thái giao dịch
    UPDATE GIAO_DICH
    SET TRANGTHAIGD = 'Cancelled'
    WHERE MAGD = p_MaGD AND TRANGTHAIGD = 'Pending';

    IF SQL%ROWCOUNT = 0 THEN
        p_KetQua := 0;
        p_Loi := 'Giao dịch không tồn tại hoặc đã được xử lý xong, không thể hủy.';
        RETURN;
    END IF;

    -- 2. Nhả toàn bộ ghế đang giữ của giao dịch này
    UPDATE DAT_CHO
    SET TRANGTHAICHO = 'Cancelled'
    WHERE MAGD = p_MaGD AND TRANGTHAICHO = 'Held';

    p_KetQua := 1;
    p_Loi := 'Đã hủy giao dịch và nhả ghế thành công.';
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_Loi := 'Lỗi hệ thống khi hủy giao dịch: ' || SQLERRM;
END;
/

-- 12. SP_QUET_TIMEOUT_GHE
CREATE OR REPLACE PROCEDURE SP_QUET_TIMEOUT_GHE (
    p_SoGheHuy OUT NUMBER,
    p_KetQua OUT NUMBER,
    p_Loi OUT NVARCHAR2
)
AS
BEGIN
    -- 1. Tìm và đổi các ghế đã hết hạn sang Expired
    UPDATE DAT_CHO
    SET TRANGTHAICHO = 'Expired'
    WHERE GIUDEN < CURRENT_TIMESTAMP AND TRANGTHAICHO = 'Held';

    p_SoGheHuy := SQL%ROWCOUNT;
    -- (Tùy chọn) 2. Có thể update luôn các Giao dịch có chứa ghế bị Timeout thành Cancelled
    -- Để đơn giản hóa cho sinh viên, tạm thời chỉ quản lý Timeout ở mức độ Ghế (DAT_CHO).
    p_KetQua := 1;
    p_Loi := 'Quét timeout thành công. Đã hủy ' || p_SoGheHuy || ' ghế.';
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_KetQua := 0;
        p_SoGheHuy := 0;
        p_Loi := 'Lỗi hệ thống khi quét timeout: ' || SQLERRM;
END;
/


