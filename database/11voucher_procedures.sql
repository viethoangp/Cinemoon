-- ================== VOUCHER (KHUYEN_MAI) ==================

/**
 * SP_GET_KHUYEN_MAI_LIST
 * Get paginated list of promotions/vouchers
 */
CREATE OR REPLACE PROCEDURE SP_GET_KHUYEN_MAI_LIST (
    p_Search IN VARCHAR2 DEFAULT '',
    p_Page IN NUMBER DEFAULT 1,
    p_Limit IN NUMBER DEFAULT 10,
    p_TotalCount OUT NUMBER,
    p_TotalPages OUT NUMBER,
    p_ResultSet OUT SYS_REFCURSOR,
    p_KetQua OUT NUMBER,
    p_Loi OUT VARCHAR2
) AS
    v_Offset NUMBER;
    v_Search VARCHAR2(1000);
BEGIN
    p_KetQua := 1;
    p_Loi := NULL;
    v_Search := NVL(p_Search, '');
    v_Offset := (p_Page - 1) * p_Limit;

    -- Get total count
    SELECT COUNT(*)
    INTO p_TotalCount
    FROM KHUYEN_MAI km
    WHERE UPPER(km.TENCHUONGTRINH) LIKE UPPER('%' || v_Search || '%')
       OR UPPER(km.MAKHUYENMAI) LIKE UPPER('%' || v_Search || '%');

    p_TotalPages := CEIL(p_TotalCount / p_Limit);

    -- Get paginated list with usage count
    OPEN p_ResultSet FOR
        SELECT 
            km.MAKHUYENMAI,
            km.TENCHUONGTRINH,
            km.GIATRIGIAM,
            km.DIEUKIENAPDUNG,
            km.NGAYBATDAU,
            km.NGAYKETTHUC,
            NVL(COUNT(gd.MAGD), 0) as SO_LAN_SU_DUNG,
            CASE 
                WHEN TRUNC(SYSDATE) > TRUNC(km.NGAYKETTHUC) THEN 'Expired'
                WHEN TRUNC(SYSDATE) < TRUNC(km.NGAYBATDAU) THEN 'Upcoming'
                ELSE 'Active'
            END as TRANG_THAI
        FROM KHUYEN_MAI km
        LEFT JOIN GIAO_DICH gd ON km.MAKHUYENMAI = gd.MAKHUYENMAI
        WHERE UPPER(km.TENCHUONGTRINH) LIKE UPPER('%' || v_Search || '%')
           OR UPPER(km.MAKHUYENMAI) LIKE UPPER('%' || v_Search || '%')
        GROUP BY km.MAKHUYENMAI, km.TENCHUONGTRINH, km.GIATRIGIAM, km.DIEUKIENAPDUNG, 
                 km.NGAYBATDAU, km.NGAYKETTHUC
        ORDER BY km.NGAYKETTHUC DESC, km.MAKHUYENMAI DESC
        OFFSET v_Offset ROWS FETCH NEXT p_Limit ROWS ONLY;

EXCEPTION
    WHEN OTHERS THEN
        p_KetQua := 0;
        p_Loi := SQLERRM;
END SP_GET_KHUYEN_MAI_LIST;
/
