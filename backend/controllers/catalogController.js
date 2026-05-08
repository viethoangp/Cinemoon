import { executeQuery } from '../services/spService.js';

// ================== LOAI_GHE ==================
export const getLoaiGhe = async (req, res) => {
  try {
    const query = 'SELECT MALOAIGHE, TENLOAI FROM LOAI_GHE ORDER BY MALOAIGHE';
    const data = await executeQuery(query);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách loại ghế thành công.'
    });
  } catch (error) {
    console.error('Lỗi getLoaiGhe:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== LOAI_KHACH ==================
export const getLoaiKhach = async (req, res) => {
  try {
    const query = 'SELECT MALOAIKHACH, TENLOAI FROM LOAI_KHACH ORDER BY MALOAIKHACH';
    const data = await executeQuery(query);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách loại khách hàng thành công.'
    });
  } catch (error) {
    console.error('Lỗi getLoaiKhach:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== RAP ==================
export const getRap = async (req, res) => {
  try {
    const query = 'SELECT MARAP, TENRAP, DIACHI FROM RAP ORDER BY MARAP';
    const data = await executeQuery(query);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách rạp phim thành công.'
    });
  } catch (error) {
    console.error('Lỗi getRap:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== PHONG_CHIEU ==================
export const getPhongChieu = async (req, res) => {
  try {
    const { marap } = req.query;
    let query = `
      SELECT pc.MAPHONG, pc.MARAP, pc.SUCCHUAGHE, r.TENRAP
      FROM PHONG_CHIEU pc
      JOIN RAP r ON pc.MARAP = r.MARAP
    `;
    const params = [];

    if (marap) {
      query += ' WHERE pc.MARAP = :marap';
      params.push(marap);
    }

    query += ' ORDER BY pc.MAPHONG';
    const data = await executeQuery(query, params);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách phòng chiếu thành công.'
    });
  } catch (error) {
    console.error('Lỗi getPhongChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== PHIM ==================
export const getPhim = async (req, res) => {
  try {
    const { trangthai } = req.query;
    let query = `
      SELECT MAPHIM, TENPHIM, THELOAI, THOILUONG, DAODIEN, DIENVIEN,
             TO_CHAR(NGAYPHATHANH, 'YYYY-MM-DD') AS NGAYPHATHANH,
             POSTER, TRAILER, MOTA, GIOIHANTUOI, TRANGTHAI
      FROM PHIM
    `;
    const params = [];

    if (trangthai) {
      query += ' WHERE TRANGTHAI = :trangthai';
      params.push(trangthai);
    } else {
      query += ' WHERE TRANGTHAI IN (\'Showing\', \'Upcoming\')';
    }

    query += ' ORDER BY NGAYPHATHANH DESC';
    const data = await executeQuery(query, params);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách phim thành công.'
    });
  } catch (error) {
    console.error('Lỗi getPhim:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const getPhimById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT MAPHIM, TENPHIM, THELOAI, THOILUONG, DAODIEN, DIENVIEN,
             TO_CHAR(NGAYPHATHANH, 'YYYY-MM-DD') AS NGAYPHATHANH,
             POSTER, TRAILER, MOTA, GIOIHANTUOI, TRANGTHAI
      FROM PHIM
      WHERE MAPHIM = :id
    `;
    const data = await executeQuery(query, [id]);
    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Phim không tìm thấy.' });
    }
    res.status(200).json({
      success: true,
      data: data[0],
      message: 'Lấy chi tiết phim thành công.'
    });
  } catch (error) {
    console.error('Lỗi getPhimById:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== SUAT_CHIEU ==================
export const getSuatChieu = async (req, res) => {
  try {

    const { maphim, maphong, ngaychieu, marap } = req.query; 

    let query = `
      SELECT sc.MASUAT, sc.MAPHIM, sc.MAPHONG, 
             TO_CHAR(sc.NGAYCHIEU, 'YYYY-MM-DD') AS NGAYCHIEU,
             TO_CHAR(sc.GIOBATDAU, 'HH24:MI:SS') AS GIOBATDAU,
             TO_CHAR(sc.GIOKETTHUC, 'HH24:MI:SS') AS GIOKETTHUC,
             sc.TRANGTHAISUAT, p.TENPHIM, pc.MARAP
      FROM SUAT_CHIEU sc
      JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
      JOIN PHONG_CHIEU pc ON sc.MAPHONG = pc.MAPHONG 
      WHERE 1=1
    `;
    const params = [];

    if (maphim) { query += ' AND sc.MAPHIM = :maphim'; params.push(maphim); }
    if (maphong) { query += ' AND sc.MAPHONG = :maphong'; params.push(maphong); }
    
    if (marap) { 
      query += ' AND pc.MARAP = :marap'; 
      params.push(marap); 
    }
    
    if (ngaychieu) {
      query += ' AND TRUNC(sc.NGAYCHIEU) = TO_DATE(:ngaychieu, \'YYYY-MM-DD\')';
      params.push(ngaychieu);
    }

    query += ' ORDER BY sc.NGAYCHIEU, sc.GIOBATDAU';
    const data = await executeQuery(query, params);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách suất chiếu thành công.'
    });
  } catch (error) {
    console.error('Lỗi getSuatChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== GHE_NGOI ==================
export const getGheNgoi = async (req, res) => {
  try {
    const { maphong } = req.query;
    if (!maphong) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphong.' });
    }

    const query = `
      SELECT gn.MAGHE, gn.MAPHONG, gn.MALOAIGHE, gn.VITRI, lg.TENLOAI
      FROM GHE_NGOI gn
      JOIN LOAI_GHE lg ON gn.MALOAIGHE = lg.MALOAIGHE
      WHERE gn.MAPHONG = :maphong
      ORDER BY gn.VITRI
    `;
    const data = await executeQuery(query, [maphong]);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách ghế thành công.'
    });
  } catch (error) {
    console.error('Lỗi getGheNgoi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== QUY_DINH_GIA ==================
export const getQuyDinhGia = async (req, res) => {
  try {
    const { maloaighe, maloaikhach } = req.query;
    let query = `
      SELECT qdg.MAQUYDINH, qdg.MALOAIGHE, qdg.MALOAIKHACH, qdg.THU,
             qdg.APDUNGNGAYLE, qdg.GIOBATDAU, qdg.GIOKETTHUC,
             qdg.DONGIA, qdg.HESONHAN,
             lg.TENLOAI AS TENLOAI_GHE, lk.TENLOAI AS TENLOAI_KHACH
      FROM QUY_DINH_GIA qdg
      JOIN LOAI_GHE lg ON qdg.MALOAIGHE = lg.MALOAIGHE
      JOIN LOAI_KHACH lk ON qdg.MALOAIKHACH = lk.MALOAIKHACH
      WHERE 1=1
    `;
    const params = [];

    if (maloaighe) {
      query += ' AND qdg.MALOAIGHE = :maloaighe';
      params.push(maloaighe);
    }
    if (maloaikhach) {
      query += ' AND qdg.MALOAIKHACH = :maloaikhach';
      params.push(maloaikhach);
    }

    query += ' ORDER BY qdg.MALOAIGHE, qdg.THU';
    const data = await executeQuery(query, params);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy bảng giá thành công.'
    });
  } catch (error) {
    console.error('Lỗi getQuyDinhGia:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== KHUYEN_MAI ==================
export const getKhuyenMai = async (req, res) => {
  try {
    const query = `
      SELECT MAKHUYENMAI, TENCHUONGTRINH, GIATRIGIAM, DIEUKIENAPDUNG,
             TO_CHAR(NGAYBATDAU, 'YYYY-MM-DD HH24:MI:SS') AS NGAYBATDAU,
             TO_CHAR(NGAYKETTHUC, 'YYYY-MM-DD HH24:MI:SS') AS NGAYKETTHUC
      FROM KHUYEN_MAI
      WHERE NGAYKETTHUC >= SYSDATE
      ORDER BY NGAYBATDAU DESC
    `;
    const data = await executeQuery(query);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách khuyến mãi thành công.'
    });
  } catch (error) {
    console.error('Lỗi getKhuyenMai:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== THAM_SO ==================
export const getThamSo = async (req, res) => {
  try {
    const query = 'SELECT MATHAMSO, TENTHAMSO, GIATRI, MOTA FROM THAM_SO ORDER BY MATHAMSO';
    const data = await executeQuery(query);
    res.status(200).json({
      success: true,
      data,
      message: 'Lấy danh sách tham số thành công.'
    });
  } catch (error) {
    console.error('Lỗi getThamSo:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};
