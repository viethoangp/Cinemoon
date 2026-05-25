-- ================== SCHEDULE (SUAT_CHIEU) ==================

/**
 * SP_GET_SUAT_CHIEU_LIST
 * Get paginated list of showtimes with movie, room, and occupancy info
 * JOIN với PHIM, PHONG_CHIEU, tính số lượng vé từ VE để tính tỷ lệ lấp đầy
 */
CREATE OR REPLACE PROCEDURE SP_GET_SUAT_CHIEU_LIST (
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
    FROM SUAT_CHIEU sc
    JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
    WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || v_Search || '%')
       OR UPPER(sc.MASUAT) LIKE UPPER('%' || v_Search || '%');

    p_TotalPages := CEIL(p_TotalCount / p_Limit);

    -- Get paginated list
    OPEN p_ResultSet FOR
        SELECT 
            sc.MASUAT,
            sc.MAPHIM,
            p.TENPHIM,
            sc.MAPHONG,
            ph.SUCCHUAGHE,
            sc.NGAYCHIEU,
            sc.GIOBATDAU,
            sc.GIOKETTHUC,
            sc.TRANGTHAISUAT,
            NVL(COUNT(v.MAVE), 0) as SO_VE_BAN,
            ROUND((NVL(COUNT(v.MAVE), 0) / ph.SUCCHUAGHE) * 100, 2) as TY_LE_LAP_DAY
        FROM SUAT_CHIEU sc
        JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
        JOIN PHONG_CHIEU ph ON sc.MAPHONG = ph.MAPHONG
        LEFT JOIN VE v ON sc.MASUAT = v.MASUAT
        WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || v_Search || '%')
           OR UPPER(sc.MASUAT) LIKE UPPER('%' || v_Search || '%')
        GROUP BY sc.MASUAT, sc.MAPHIM, p.TENPHIM, sc.MAPHONG, ph.SUCCHUAGHE, 
                 sc.NGAYCHIEU, sc.GIOBATDAU, sc.GIOKETTHUC, sc.TRANGTHAISUAT
        ORDER BY sc.NGAYCHIEU DESC, sc.GIOBATDAU DESC
        OFFSET v_Offset ROWS FETCH NEXT p_Limit ROWS ONLY;

EXCEPTION
    WHEN OTHERS THEN
        p_KetQua := 0;
        p_Loi := SQLERRM;
END SP_GET_SUAT_CHIEU_LIST;
/

/**
 * SP_GET_PHONG_CHIEU_LIST
 * Get list of cinema rooms for dropdown (MASUAT creation form)
 */
CREATE OR REPLACE PROCEDURE SP_GET_PHONG_CHIEU_LIST (
    p_ResultSet OUT SYS_REFCURSOR,
    p_KetQua OUT NUMBER,
    p_Loi OUT VARCHAR2
) AS
BEGIN
    p_KetQua := 1;
    p_Loi := NULL;

    OPEN p_ResultSet FOR
        SELECT 
            ph.MAPHONG,
            r.TENRAP,
            ph.SUCCHUAGHE
        FROM PHONG_CHIEU ph
        JOIN RAP r ON ph.MARAP = r.MARAP
        ORDER BY r.TENRAP ASC, ph.MAPHONG ASC;

EXCEPTION
    WHEN OTHERS THEN
        p_KetQua := 0;
        p_Loi := SQLERRM;
END SP_GET_PHONG_CHIEU_LIST;
/


/**
 * SP_GET_PHIM_DROPDOWN  
 * Get list of active movies for dropdown (SUAT creation form)
 */
CREATE OR REPLACE PROCEDURE SP_GET_PHIM_DROPDOWN (
    p_ResultSet OUT SYS_REFCURSOR,
    p_KetQua OUT NUMBER,
    p_Loi OUT VARCHAR2
) AS
BEGIN
    p_KetQua := 1;
    p_Loi := NULL;

    OPEN p_ResultSet FOR
        SELECT 
            p.MAPHIM,
            p.TENPHIM,
            p.THOILUONG
        FROM PHIM p
        WHERE p.TRANGTHAI IN ('Showing', 'Upcoming')
        ORDER BY p.TENPHIM ASC;

EXCEPTION
    WHEN OTHERS THEN
        p_KetQua := 0;
        p_Loi := SQLERRM;
END SP_GET_PHIM_DROPDOWN;
/