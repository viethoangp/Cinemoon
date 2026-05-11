
SET DEFINE OFF;



--------------------------------------------------------------------------------
-- 1. TRG_KIEM_TRA_TRUNG_PHONG_SUAT
--    INSERT, UPDATE ON SUAT_CHIEU
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_KIEM_TRA_TRUNG_PHONG_SUAT
FOR INSERT OR UPDATE OF MASUAT, MAPHONG, NGAYCHIEU, GIOBATDAU, GIOKETTHUC, TRANGTHAISUAT
ON SUAT_CHIEU
COMPOUND TRIGGER
    TYPE t_suat_rec IS RECORD (
        masuat       SUAT_CHIEU.MASUAT%TYPE,
        maphong      SUAT_CHIEU.MAPHONG%TYPE,
        ngaychieu    SUAT_CHIEU.NGAYCHIEU%TYPE,
        giobatdau    SUAT_CHIEU.GIOBATDAU%TYPE,
        gioketthuc   SUAT_CHIEU.GIOKETTHUC%TYPE,
        trangthai    SUAT_CHIEU.TRANGTHAISUAT%TYPE
    );

    TYPE t_suat_tab IS TABLE OF t_suat_rec INDEX BY PLS_INTEGER;
    g_rows t_suat_tab;

    BEFORE EACH ROW IS
        v_idx PLS_INTEGER;
    BEGIN
        IF :NEW.GIOKETTHUC <= :NEW.GIOBATDAU THEN
            RAISE_APPLICATION_ERROR(
                -20010,
                'TRG_KIEM_TRA_TRUNG_PHONG_SUAT: GIOKETTHUC phai lon hon GIOBATDAU.'
            );
        END IF;

        v_idx := g_rows.COUNT + 1;
        g_rows(v_idx).masuat     := :NEW.MASUAT;
        g_rows(v_idx).maphong    := :NEW.MAPHONG;
        g_rows(v_idx).ngaychieu  := :NEW.NGAYCHIEU;
        g_rows(v_idx).giobatdau  := :NEW.GIOBATDAU;
        g_rows(v_idx).gioketthuc := :NEW.GIOKETTHUC;
        g_rows(v_idx).trangthai  := :NEW.TRANGTHAISUAT;
    END BEFORE EACH ROW;

    AFTER STATEMENT IS
        v_count NUMBER;
    BEGIN
        FOR i IN 1 .. g_rows.COUNT LOOP
            IF NVL(g_rows(i).trangthai, 'Upcoming') <> 'Cancelled' THEN
                SELECT COUNT(*)
                INTO v_count
                FROM SUAT_CHIEU sc
                WHERE sc.MAPHONG = g_rows(i).maphong
                  AND TRUNC(sc.NGAYCHIEU) = TRUNC(g_rows(i).ngaychieu)
                  AND sc.MASUAT <> g_rows(i).masuat
                  AND NVL(sc.TRANGTHAISUAT, 'Upcoming') <> 'Cancelled'
                  AND g_rows(i).giobatdau < sc.GIOKETTHUC
                  AND sc.GIOBATDAU < g_rows(i).gioketthuc;

                IF v_count > 0 THEN
                    RAISE_APPLICATION_ERROR(
                        -20011,
                        'TRG_KIEM_TRA_TRUNG_PHONG_SUAT: Suat chieu bi trung gio trong cung phong.'
                    );
                END IF;
            END IF;
        END LOOP;
    END AFTER STATEMENT;
END TRG_KIEM_TRA_TRUNG_PHONG_SUAT;
/

--------------------------------------------------------------------------------
-- 2. TRG_KIEM_TRA_TUOI_KH_VE
--    INSERT, UPDATE ON VE
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_KIEM_TRA_TUOI_KH_VE
BEFORE INSERT OR UPDATE OF MAGD, MASUAT, TRANGTHAIVE
ON VE
FOR EACH ROW
DECLARE
    v_makh          GIAO_DICH.MAKH%TYPE;
    v_trangthaigd   GIAO_DICH.TRANGTHAIGD%TYPE;
    v_ngaysinh      KHACH_HANG.NGAYSINH%TYPE;
    v_gioihantuoi   PHIM.GIOIHANTUOI%TYPE;
    v_tuoikh        NUMBER;
BEGIN
    SELECT gd.MAKH,
           gd.TRANGTHAIGD,
           kh.NGAYSINH,
           NVL(p.GIOIHANTUOI, 0)
    INTO   v_makh,
           v_trangthaigd,
           v_ngaysinh,
           v_gioihantuoi
    FROM GIAO_DICH gd
         JOIN KHACH_HANG kh ON kh.MAKH = gd.MAKH
         JOIN SUAT_CHIEU sc ON sc.MASUAT = :NEW.MASUAT
         JOIN PHIM p ON p.MAPHIM = sc.MAPHIM
    WHERE gd.MAGD = :NEW.MAGD;

    IF v_gioihantuoi > 0 THEN
        IF v_ngaysinh IS NULL THEN
            RAISE_APPLICATION_ERROR(
                -20020,
                'TRG_KIEM_TRA_TUOI_KH_VE: Khach hang chua co ngay sinh de kiem tra do tuoi.'
            );
        END IF;

        v_tuoikh := FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), TRUNC(v_ngaysinh)) / 12);

        IF v_tuoikh < v_gioihantuoi THEN
            RAISE_APPLICATION_ERROR(
                -20021,
                'TRG_KIEM_TRA_TUOI_KH_VE: Khach hang chua du tuoi xem phim nay.'
            );
        END IF;
    END IF;

    IF :NEW.TRANGTHAIVE IS NULL AND v_trangthaigd = 'Paid' THEN
        :NEW.TRANGTHAIVE := 'Issued';
    END IF;

    IF :NEW.TRANGTHAIVE = 'Issued' AND NVL(v_trangthaigd, 'Pending') <> 'Paid' THEN
        RAISE_APPLICATION_ERROR(
            -20022,
            'TRG_KIEM_TRA_TUOI_KH_VE: Ve chi duoc Issued khi giao dich da Paid.'
        );
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(
            -20023,
            'TRG_KIEM_TRA_TUOI_KH_VE: Khong tim thay giao dich, khach hang, suat chieu hoac phim hop le.'
        );
END TRG_KIEM_TRA_TUOI_KH_VE;
/
--------------------------------------------------------------------------------
-- 3. TRG_KIEM_TRA_VOUCHER_GIAODICH
--    INSERT, UPDATE ON GIAO_DICH
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_KIEM_TRA_VOUCHER_GIAODICH
BEFORE INSERT OR UPDATE OF MAKHUYENMAI, THOIGIANTAO
ON GIAO_DICH
FOR EACH ROW
DECLARE
    v_ngaybd      KHUYEN_MAI.NGAYBATDAU%TYPE;
    v_ngaykt      KHUYEN_MAI.NGAYKETTHUC%TYPE;
BEGIN
    IF :NEW.THOIGIANTAO IS NULL THEN
        :NEW.THOIGIANTAO := LOCALTIMESTAMP;
    END IF;

    IF :NEW.MAKHUYENMAI IS NULL THEN
        RETURN;
    END IF;

    SELECT NGAYBATDAU, NGAYKETTHUC
    INTO v_ngaybd, v_ngaykt
    FROM KHUYEN_MAI
    WHERE MAKHUYENMAI = :NEW.MAKHUYENMAI;

    -- CHỈ KIỂM TRA ĐIỀU KIỆN THỜI GIAN
    IF v_ngaybd IS NOT NULL AND :NEW.THOIGIANTAO < v_ngaybd THEN
        RAISE_APPLICATION_ERROR(-20031, 'Voucher chưa đến thời gian áp dụng.');
    END IF;

    IF v_ngaykt IS NOT NULL AND :NEW.THOIGIANTAO > v_ngaykt THEN
        RAISE_APPLICATION_ERROR(-20032, 'Voucher đã hết hiệu lực.');
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20033, 'Mã khuyến mãi không tồn tại.');
END TRG_KIEM_TRA_VOUCHER_GIAODICH;
/
--------------------------------------------------------------------------------
-- 4. TRG_CAP_NHAT_TRANGTHAI_VE
--    UPDATE ON GIAO_DICH
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_CAP_NHAT_TRANGTHAI_VE
FOR UPDATE OF TRANGTHAIGD
ON GIAO_DICH
COMPOUND TRIGGER
    TYPE t_item IS RECORD (
        magd       GIAO_DICH.MAGD%TYPE,
        trangthai  GIAO_DICH.TRANGTHAIGD%TYPE
    );
    TYPE t_items IS TABLE OF t_item INDEX BY PLS_INTEGER;
    g_items t_items;

    BEFORE EACH ROW IS
    BEGIN
        IF NVL(:OLD.TRANGTHAIGD, '#') <> NVL(:NEW.TRANGTHAIGD, '#')
           AND :NEW.TRANGTHAIGD = 'Cancelled' THEN
            g_items(g_items.COUNT + 1).magd := :NEW.MAGD;
            g_items(g_items.COUNT).trangthai := :NEW.TRANGTHAIGD;
        END IF;
    END BEFORE EACH ROW;

    AFTER STATEMENT IS
    BEGIN
        FOR i IN 1 .. g_items.COUNT LOOP
            -- CHỈ XỬ LÝ KHI GIAO DỊCH BỊ HỦY (Phần Paid đã có SP lo)
            IF g_items(i).trangthai = 'Cancelled' THEN
                UPDATE DAT_CHO
                SET TRANGTHAICHO = 'Cancelled'
                WHERE MAGD = g_items(i).magd AND TRANGTHAICHO = 'Held';

                UPDATE VE
                SET TRANGTHAIVE = 'Refunded'
                WHERE MAGD = g_items(i).magd AND TRANGTHAIVE = 'Issued';
            END IF;
        END LOOP;
    END AFTER STATEMENT;
END TRG_CAP_NHAT_TRANGTHAI_VE;
/
--------------------------------------------------------------------------------
-- 5. TRG_KIEM_TRA_SOLUONG_VE_SUAT
--    INSERT, UPDATE ON VE
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_KIEM_TRA_SOLUONG_VE_SUAT
FOR INSERT OR UPDATE OF MASUAT, MAGHE, TRANGTHAIVE
ON VE
COMPOUND TRIGGER
    TYPE t_masuat_set IS TABLE OF BOOLEAN INDEX BY VARCHAR2(20);
    g_masuats t_masuat_set;

    BEFORE EACH ROW IS
        v_match_room NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO v_match_room
        FROM SUAT_CHIEU sc
             JOIN GHE_NGOI g ON g.MAGHE = :NEW.MAGHE
        WHERE sc.MASUAT = :NEW.MASUAT
          AND sc.MAPHONG = g.MAPHONG;

        IF v_match_room = 0 THEN
            RAISE_APPLICATION_ERROR(
                -20050,
                'TRG_KIEM_TRA_SOLUONG_VE_SUAT: Ghe khong thuoc phong chieu cua suat nay.'
            );
        END IF;

        g_masuats(:NEW.MASUAT) := TRUE;
    END BEFORE EACH ROW;

    AFTER STATEMENT IS
        v_masuat   VE.MASUAT%TYPE;
        v_sove     NUMBER;
        v_succhua  PHONG_CHIEU.SUCCHUAGHE%TYPE;
    BEGIN
        v_masuat := g_masuats.FIRST;

        WHILE v_masuat IS NOT NULL LOOP
            SELECT pc.SUCCHUAGHE
            INTO v_succhua
            FROM SUAT_CHIEU sc
                 JOIN PHONG_CHIEU pc ON pc.MAPHONG = sc.MAPHONG
            WHERE sc.MASUAT = v_masuat;

            SELECT COUNT(*)
            INTO v_sove
            FROM VE
            WHERE MASUAT = v_masuat
              AND NVL(TRANGTHAIVE, 'Issued') <> 'Refunded';

            IF v_sove > v_succhua THEN
                RAISE_APPLICATION_ERROR(
                    -20051,
                    'TRG_KIEM_TRA_SOLUONG_VE_SUAT: So luong ve vuot qua suc chua phong chieu.'
                );
            END IF;

            v_masuat := g_masuats.NEXT(v_masuat);
        END LOOP;
    END AFTER STATEMENT;
END TRG_KIEM_TRA_SOLUONG_VE_SUAT;
/


--------------------------------------------------------------------------------
-- 7. TRG_SET_GIUDEN_DATCHO
--    INSERT, UPDATE ON DAT_CHO
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_SET_GIUDEN_DATCHO
BEFORE INSERT OR UPDATE OF THOIGIANGIU, GIUDEN
ON DAT_CHO
FOR EACH ROW
BEGIN
    IF :NEW.THOIGIANGIU IS NULL THEN
        :NEW.THOIGIANGIU := LOCALTIMESTAMP;
    END IF;

    :NEW.GIUDEN := :NEW.THOIGIANGIU + INTERVAL '10' MINUTE;

    IF :NEW.TRANGTHAICHO IS NULL THEN
        :NEW.TRANGTHAICHO := 'Held';
    END IF;
END TRG_SET_GIUDEN_DATCHO;
/

