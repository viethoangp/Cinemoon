import { callStoredProcedure } from '../services/spService.js';
import { SP_CATALOG } from '../config/constants.js';
import { getOracle, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

// Helper: Build response from SP result
function buildResponse(spResult) {
  return {
    success: spResult.success === 1,
    message: spResult.message || 'Thao tác thành công.',
    data: spResult.outParams,
  };
}

// ================== LOAI_GHE ==================
export const createLoaiGhe = async (req, res) => {
  try {
    const { tenloai } = req.body;
    if (!tenloai) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số tenloai.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_LOAI_GHE, {
      p_TENLOAI: tenloai,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createLoaiGhe:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updateLoaiGhe = async (req, res) => {
  try {
    const { maloaighe, tenloai } = req.body;
    if (!maloaighe || !tenloai) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maloaighe hoặc tenloai.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_LOAI_GHE, {
      p_MALOAIGHE: maloaighe,
      p_TENLOAI: tenloai,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateLoaiGhe:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteLoaiGhe = async (req, res) => {
  try {
    const { maloaighe } = req.body;
    if (!maloaighe) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maloaighe.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_LOAI_GHE, {
      p_MALOAIGHE: maloaighe,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteLoaiGhe:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== LOAI_KHACH ==================
export const createLoaiKhach = async (req, res) => {
  try {
    const { tenloai } = req.body;
    if (!tenloai) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số tenloai.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_LOAI_KHACH, {
      p_TENLOAI: tenloai,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createLoaiKhach:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updateLoaiKhach = async (req, res) => {
  try {
    const { maloaikhach, tenloai } = req.body;
    if (!maloaikhach || !tenloai) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maloaikhach hoặc tenloai.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_LOAI_KHACH, {
      p_MALOAIKHACH: maloaikhach,
      p_TENLOAI: tenloai,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateLoaiKhach:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteLoaiKhach = async (req, res) => {
  try {
    const { maloaikhach } = req.body;
    if (!maloaikhach) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maloaikhach.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_LOAI_KHACH, {
      p_MALOAIKHACH: maloaikhach,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteLoaiKhach:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== PHONG_CHIEU ==================
export const createPhongChieu = async (req, res) => {
  try {
    const { marap, succhuaghe } = req.body;
    if (!marap || !succhuaghe) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số marap hoặc succhuaghe.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_PHONG_CHIEU, {
      p_MARAP: marap,
      p_SUCCHUAGHE: succhuaghe,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createPhongChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updatePhongChieu = async (req, res) => {
  try {
    const { maphong, succhuaghe } = req.body;
    if (!maphong || !succhuaghe) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphong hoặc succhuaghe.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_PHONG_CHIEU, {
      p_MAPHONG: maphong,
      p_SUCCHUAGHE: succhuaghe,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updatePhongChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deletePhongChieu = async (req, res) => {
  try {
    const { maphong } = req.body;
    if (!maphong) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphong.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_PHONG_CHIEU, {
      p_MAPHONG: maphong,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deletePhongChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== QUY_DINH_GIA ==================
export const createQuyDinhGia = async (req, res) => {
  try {
    const { maloaighe, maloaikhach, thu, apdungngayle, giobatdau, gioketthuc, dongia, hesonhan } = req.body;
    if (!maloaighe || !maloaikhach || thu == null || !giobatdau || !gioketthuc || !dongia) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số bắt buộc.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_QUY_DINH_GIA, {
      p_MALOAIGHE: maloaighe,
      p_MALOAIKHACH: maloaikhach,
      p_THU: thu,
      p_APDUNGNGAYLE: apdungngayle || 'N',
      p_GIOBATDAU: giobatdau,
      p_GIOKETTHUC: gioketthuc,
      p_DONGIA: dongia,
      p_HESONHAN: hesonhan || 1,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createQuyDinhGia:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updateQuyDinhGia = async (req, res) => {
  try {
    const { maquydinh, maloaighe, maloaikhach, thu, apdungngayle, giobatdau, gioketthuc, dongia, hesonhan } = req.body;
    if (!maquydinh || !maloaighe || !maloaikhach || thu == null || !giobatdau || !gioketthuc || !dongia) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số bắt buộc.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_QUY_DINH_GIA, {
      p_MAQUYDINH: maquydinh,
      p_MALOAIGHE: maloaighe,
      p_MALOAIKHACH: maloaikhach,
      p_THU: thu,
      p_APDUNGNGAYLE: apdungngayle || 'N',
      p_GIOBATDAU: giobatdau,
      p_GIOKETTHUC: gioketthuc,
      p_DONGIA: dongia,
      p_HESONHAN: hesonhan || 1,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateQuyDinhGia:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteQuyDinhGia = async (req, res) => {
  try {
    const { maquydinh } = req.body;
    if (!maquydinh) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maquydinh.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_QUY_DINH_GIA, {
      p_MAQUYDINH: maquydinh,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteQuyDinhGia:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== GHE_NGOI ==================
export const createGheNgoi = async (req, res) => {
  try {
    const { maphong, maloaighe, vitri } = req.body;
    if (!maphong || !maloaighe || !vitri) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphong, maloaighe hoặc vitri.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_GHE_NGOI, {
      p_MAPHONG: maphong,
      p_MALOAIGHE: maloaighe,
      p_VITRI: vitri,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createGheNgoi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updateGheNgoi = async (req, res) => {
  try {
    const { maghe, maloaighe, vitri } = req.body;
    if (!maghe || !maloaighe || !vitri) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maghe, maloaighe hoặc vitri.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_GHE_NGOI, {
      p_MAGHE: maghe,
      p_MALOAIGHE: maloaighe,
      p_VITRI: vitri,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateGheNgoi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteGheNgoi = async (req, res) => {
  try {
    const { maghe } = req.body;
    if (!maghe) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maghe.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_GHE_NGOI, {
      p_MAGHE: maghe,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteGheNgoi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== KHUYEN_MAI ==================
export const createKhuyenMai = async (req, res) => {
  try {
    const { tenchuongtrinh, giatrigiam, dieukienapdung, ngaybatdau, ngayketthuc } = req.body;
    if (!tenchuongtrinh || giatrigiam == null || !dieukienapdung || !ngaybatdau || !ngayketthuc) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số bắt buộc.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_KHUYEN_MAI, {
      p_TENCHUONGTRINH: tenchuongtrinh,
      p_GIATRIGIAM: giatrigiam,
      p_DIEUKIENAPDUNG: dieukienapdung,
      p_NGAYBATDAU: ngaybatdau,
      p_NGAYKETTHUC: ngayketthuc,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createKhuyenMai:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updateKhuyenMai = async (req, res) => {
  try {
    const { makhuyenmai, tenchuongtrinh, giatrigiam, dieukienapdung, ngaybatdau, ngayketthuc } = req.body;
    if (!makhuyenmai || !tenchuongtrinh || giatrigiam == null || !dieukienapdung || !ngaybatdau || !ngayketthuc) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số bắt buộc.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_KHUYEN_MAI, {
      p_MAKHUYENMAI: makhuyenmai,
      p_TENCHUONGTRINH: tenchuongtrinh,
      p_GIATRIGIAM: giatrigiam,
      p_DIEUKIENAPDUNG: dieukienapdung,
      p_NGAYBATDAU: ngaybatdau,
      p_NGAYKETTHUC: ngayketthuc,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateKhuyenMai:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteKhuyenMai = async (req, res) => {
  try {
    const { makhuyenmai } = req.body;
    if (!makhuyenmai) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số makhuyenmai.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_KHUYEN_MAI, {
      p_MAKHUYENMAI: makhuyenmai,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteKhuyenMai:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== THAM_SO ==================
export const createThamSo = async (req, res) => {
  try {
    const { tenthamso, giatri, mota } = req.body;
    if (!tenthamso || giatri == null) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số tenthamso hoặc giatri.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_THAM_SO, {
      p_TENTHAMSO: tenthamso,
      p_GIATRI: giatri,
      p_MOTA: mota || null,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 201 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi createThamSo:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const updateThamSo = async (req, res) => {
  try {
    const { mathamso, giatri, mota } = req.body;
    if (!mathamso || giatri == null) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số mathamso hoặc giatri.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_THAM_SO, {
      p_MATHAMSO: mathamso,
      p_GIATRI: giatri,
      p_MOTA: mota || null,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateThamSo:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteThamSo = async (req, res) => {
  try {
    const { mathamso } = req.body;
    if (!mathamso) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số mathamso.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_THAM_SO, {
      p_MATHAMSO: mathamso,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteThamSo:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== PHIM (SUA/XOA only) ==================
export const updatePhim = async (req, res) => {
  try {
    const { maphim, tenphim, theloai, thoiluong, daodien, dienvien, ngayphathanh, poster, trailer, mota, gioihantuoi, trangthai } = req.body;
    if (!maphim || !tenphim) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphim hoặc tenphim.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_PHIM, {
      p_MAPHIM: maphim,
      p_TENPHIM: tenphim,
      p_THELOAI: theloai || null,
      p_THOILUONG: thoiluong || null,
      p_DAODIEN: daodien || null,
      p_DIENVIEN: dienvien || null,
      p_NGAYPHATHANH: ngayphathanh || null,
      p_POSTER: poster || null,
      p_TRAILER: trailer || null,
      p_MOTA: mota || null,
      p_GIOIHANTUOI: gioihantuoi || null,
      p_TRANGTHAI: trangthai || null,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updatePhim:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deletePhim = async (req, res) => {
  try {
    const { maphim } = req.body;
    if (!maphim) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphim.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_PHIM, {
      p_MAPHIM: maphim,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deletePhim:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== SUAT_CHIEU (SUA/XOA only) ==================
export const updateSuatChieu = async (req, res) => {
  try {
    const { masuat, maphim, maphong, ngaychieu, giobatdau, gioketthuc, trangthaisuat } = req.body;
    if (!masuat || !maphim || !maphong) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số masuat, maphim hoặc maphong.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.SUA_SUAT_CHIEU, {
      p_MASUAT: masuat,
      p_MAPHIM: maphim,
      p_MAPHONG: maphong,
      p_NGAYCHIEU: ngaychieu || null,
      p_GIOBATDAU: giobatdau || null,
      p_GIOKETTHUC: gioketthuc || null,
      p_TRANGTHAISUAT: trangthaisuat || null,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi updateSuatChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

export const deleteSuatChieu = async (req, res) => {
  try {
    const { masuat } = req.body;
    if (!masuat) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số masuat.' });
    }

    const result = await callStoredProcedure(SP_CATALOG.XOA_SUAT_CHIEU, {
      p_MASUAT: masuat,
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
    });

    res.status(result.success ? 200 : 400).json(buildResponse(result));
  } catch (error) {
    console.error('Lỗi deleteSuatChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== PHIM (THEM) - AdminScreen Create Movie ==================
export const createPhim = async (req, res) => {
  try {
    const {
      tenphim,
      theloai,
      thoiluong,
      daodien,
      dienvien,
      ngayphathanh,
      poster,
      trailer,
      mota,
      gioihantuoi,
      trangthai,
    } = req.body;

    // Validate required fields
    if (!tenphim || !theloai || !thoiluong) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số bắt buộc: tenphim, theloai, thoiluong.',
      });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_PHIM, {
      p_TENPHIM: tenphim,
      p_THELOAI: theloai,
      p_THOILUONG: thoiluong,
      p_DAODIEN: daodien || null,
      p_DIENVIEN: dienvien || null,
      p_NGAYPHATHANH: ngayphathanh || null,
      p_POSTER: poster || null,
      p_TRAILER: trailer || null,
      p_MOTA: mota || null,
      p_GIOIHANTUOI: gioihantuoi || 0,
      p_TRANGTHAI: trangthai || 'Upcoming',
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
      p_MAPHIM: { dir: 1, type: getOracle().STRING, maxSize: 20 },
    });

    // If SP failed (p_KetQua = 0), return 400 with error message
    if (result.success === 0) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Lỗi tạo phim.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tạo phim thành công.',
      data: {
        maphim: result.outParams.p_MAPHIM,
        tenphim,
        theloai,
      },
    });
  } catch (error) {
    console.error('Lỗi createPhim:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== SUAT_CHIEU (THEM) - Create Showtime with Conflict Check ==================
export const createSuatChieu = async (req, res) => {
  try {
    const { maphim, maphong, ngaychieu, giobatdau, gioketthuc, trangthaisuat } = req.body;

    // Validate required fields
    if (!maphim || !maphong || !ngaychieu || !giobatdau || !gioketthuc) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số bắt buộc: maphim, maphong, ngaychieu, giobatdau, gioketthuc.',
      });
    }

    const result = await callStoredProcedure(SP_CATALOG.THEM_SUAT_CHIEU, {
      p_MAPHIM: maphim,
      p_MAPHONG: maphong,
      p_NGAYCHIEU: new Date(ngaychieu), // Convert to Date object
      p_GIOBATDAU: new Date(giobatdau), // Convert to timestamp
      p_GIOKETTHUC: new Date(gioketthuc), // Convert to timestamp
      p_TRANGTHAISUAT: trangthaisuat || 'Upcoming',
      p_KetQua: { dir: 1, type: getOracle().NUMBER },
      p_Loi: { dir: 1, type: getOracle().STRING, maxSize: 4000 },
      p_MASUAT: { dir: 1, type: getOracle().STRING, maxSize: 20 },
    });

    // If SP failed (p_KetQua = 0), return 400 with conflict error message
    if (result.success === 0) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Lỗi tạo suất chiếu.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tạo suất chiếu thành công.',
      data: {
        masuat: result.outParams.p_MASUAT,
        maphim,
        maphong,
        ngaychieu,
      },
    });
  } catch (error) {
    console.error('Lỗi createSuatChieu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== DASHBOARD STATS - Parallel Query Execution ==================
export const getDashboardStats = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();

    // Define all dashboard queries including annual and monthly
    const queries = {
      // PHASE 1: Annual KPIs for current year
      annualRevenue: `
        SELECT COALESCE(SUM(gd.TONGTIEN), 0) as TONGTIEN_NAM
        FROM GIAO_DICH gd
        WHERE gd.TRANGTHAIGD = 'Paid'
          AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)
      `,
      annualTickets: `
        SELECT COALESCE(COUNT(v.MAVE), 0) as TONG_VE_NAM
        FROM VE v
        JOIN GIAO_DICH gd ON v.MAGD = gd.MAGD
        WHERE gd.TRANGTHAIGD = 'Paid'
          AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)
      `,
      annualUsers: `
        SELECT COALESCE(COUNT(DISTINCT kh.MAKH), 0) as KH_MOI_NAM
        FROM KHACH_HANG kh
        JOIN TAI_KHOAN tk ON kh.MATK = tk.MATK
        WHERE EXTRACT(YEAR FROM tk.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)
      `,
      // Monthly revenue breakdown for line chart
      monthlyRevenue: `
        SELECT 
          EXTRACT(MONTH FROM gd.THOIGIANTAO) as thang,
          COALESCE(SUM(gd.TONGTIEN), 0) as doanhthu
        FROM GIAO_DICH gd
        WHERE gd.TRANGTHAIGD = 'Paid'
          AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)
        GROUP BY EXTRACT(MONTH FROM gd.THOIGIANTAO)
        ORDER BY thang ASC
        FETCH FIRST 12 ROWS ONLY
      `,
      topMovies: `
        -- Allocate each transaction total across its tickets to avoid double-counting
        WITH ticket_alloc AS (
          SELECT
            v.MAGD,
            sc.MAPHIM,
            gd.TONGTIEN,
            COUNT(*) OVER (PARTITION BY v.MAGD) AS TICKET_COUNT
          FROM VE v
          JOIN SUAT_CHIEU sc ON v.MASUAT = sc.MASUAT
          JOIN GIAO_DICH gd ON v.MAGD = gd.MAGD
          WHERE gd.TRANGTHAIGD = 'Paid'
            -- Optional time filter, e.g.: AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)
        )
        SELECT
          p.MAPHIM,
          p.TENPHIM,
          p.POSTER,
          ROUND(SUM(ta.TONGTIEN / ta.TICKET_COUNT), 2) AS DOANHTHU,
          COUNT(*) AS TONG_VE
        FROM ticket_alloc ta
        JOIN PHIM p ON ta.MAPHIM = p.MAPHIM
        GROUP BY p.MAPHIM, p.TENPHIM, p.POSTER
        ORDER BY DOANHTHU DESC NULLS LAST
        FETCH FIRST 5 ROWS ONLY
      `,
      topCustomers: `
        SELECT 
          kh.MAKH,
          kh.HOTEN,
          COALESCE(SUM(gd.TONGTIEN), 0) as TONGCHITIÊU,
          COALESCE(COUNT(gd.MAGD), 0) as SO_GIAODICH
        FROM KHACH_HANG kh
        LEFT JOIN GIAO_DICH gd ON kh.MAKH = gd.MAKH
        WHERE gd.TRANGTHAIGD IS NULL OR gd.TRANGTHAIGD = 'Paid'
        GROUP BY kh.MAKH, kh.HOTEN
        ORDER BY TONGCHITIÊU DESC
        FETCH FIRST 5 ROWS ONLY
      `,
      occupancyRate: `
        SELECT 
          sc.MASUAT,
          sc.NGAYCHIEU,
          TO_CHAR(sc.GIOBATDAU, 'HH24:MI') as GIOBATDAU,
          p.TENPHIM,
          ph.MAPHONG,
          ph.SUCCHUAGHE,
          COALESCE(COUNT(v.MAVE), 0) as SO_VE_BAN,
          ROUND((COALESCE(COUNT(v.MAVE), 0) / ph.SUCCHUAGHE) * 100, 2) as TY_LE_LAP_DAY
        FROM SUAT_CHIEU sc
        JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
        JOIN PHONG_CHIEU ph ON sc.MAPHONG = ph.MAPHONG
        LEFT JOIN VE v ON sc.MASUAT = v.MASUAT
        WHERE TRUNC(sc.NGAYCHIEU) = TRUNC(SYSDATE)
        GROUP BY sc.MASUAT, sc.NGAYCHIEU, sc.GIOBATDAU, p.TENPHIM, ph.MAPHONG, ph.SUCCHUAGHE
        ORDER BY sc.GIOBATDAU ASC
      `,
    };

    // Execute all queries in PARALLEL using Promise.all()
    const results = await Promise.all([
      connection.execute(queries.annualRevenue, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queries.annualTickets, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queries.annualUsers, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queries.monthlyRevenue, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queries.topMovies, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queries.topCustomers, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(queries.occupancyRate, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    ]);

    // Extract data from each query result
    const [annualRevRes, annualTicketsRes, annualUsersRes, monthlyRevenueRes, moviesRes, customersTopRes, occupancyRes] = results;

    // Ensure all 12 months are represented in monthly revenue (fill missing months with 0)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyRevenueRes.rows.find(row => row.THANG === i + 1);
      return {
        month: i + 1,
        revenue: found ? found.DOANHTHU : 0,
      };
    });

    // Format response data cleanly as JavaScript objects/arrays
    const statsData = {
      kpi: {
        revenue: annualRevRes.rows[0]?.TONGTIEN_NAM || 0,
        totalTickets: annualTicketsRes.rows[0]?.TONG_VE_NAM || 0,
        newCustomers: annualUsersRes.rows[0]?.KH_MOI_NAM || 0,
      },
      monthlyRevenue: monthlyData,
      topMovies: moviesRes.rows.map(row => ({
        maphim: row.MAPHIM,
        tenphim: row.TENPHIM,
        poster: row.POSTER,
        doanhthu: row.DOANHTHU,
        tongVe: row.TONG_VE,
      })),
      topCustomers: customersTopRes.rows.map(row => ({
        makh: row.MAKH,
        hoten: row.HOTEN,
        tongChiTieu: row.TONGCHITIÊU,
        soGiaoDich: row.SO_GIAODICH,
      })),
      occupancyRate: occupancyRes.rows.map(row => ({
        masuat: row.MASUAT,
        ngaychieu: row.NGAYCHIEU,
        giobatdau: row.GIOBATDAU,
        tenphim: row.TENPHIM,
        maphong: row.MAPHONG,
        succhuaghe: row.SUCCHUAGHE,
        soVeBan: row.SO_VE_BAN,
        tyLeLapDay: row.TY_LE_LAP_DAY,
      })),
    };

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê dashboard thành công.',
      data: statsData,
    });
  } catch (error) {
    console.error('Lỗi getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Lỗi khi đóng connection:', closeError);
      }
    }
  }
};

// ================== PHASE 2: MOVIES MANAGEMENT ==================

/**
 * GET /api/admin/phim
 * Fetch movies list with pagination + search
 * Query params: search, page, limit
 */
export const getMovies = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { search = '', page = 1, limit = 10 } = req.query;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as TOTAL
      FROM PHIM p
      WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || NVL(:search, '') || '%')
         OR UPPER(p.DAODIEN) LIKE UPPER('%' || NVL(:search, '') || '%')
    `;

    const countResult = await connection.execute(countQuery, { search }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const totalCount = countResult.rows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated movies
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        p.MAPHIM,
        p.TENPHIM,
        p.MOTA,
        p.THOILUONG,
        p.NGAYPHATHANH,
        p.POSTER,
        p.THELOAI,
        p.DAODIEN,
        p.GIOIHANTUOI,
        p.TRANGTHAI,
        (SELECT COUNT(*) FROM SUAT_CHIEU sc WHERE sc.MAPHIM = p.MAPHIM) as SO_SUAT_CHIEU,
        NVL((SELECT SUM(gd.TONGTIEN) FROM GIAO_DICH gd 
             JOIN VE v ON gd.MAGD = v.MAGD 
             JOIN SUAT_CHIEU sc ON v.MASUAT = sc.MASUAT 
             WHERE sc.MAPHIM = p.MAPHIM AND gd.TRANGTHAIGD = 'Paid' 
             AND EXTRACT(MONTH FROM gd.THOIGIANTAO) = EXTRACT(MONTH FROM SYSDATE)
             AND EXTRACT(YEAR FROM gd.THOIGIANTAO) = EXTRACT(YEAR FROM SYSDATE)), 0) as DOANHTHU_THANG
      FROM PHIM p
      WHERE UPPER(p.TENPHIM) LIKE UPPER('%' || NVL(:search, '') || '%')
         OR UPPER(p.DAODIEN) LIKE UPPER('%' || NVL(:search, '') || '%')
      ORDER BY p.MAPHIM DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const result = await connection.execute(query, 
      { search, offset, limit }, 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const movies = result.rows.map(row => ({
      maphim: row.MAPHIM,
      tenphim: row.TENPHIM,
      poster: row.POSTER,
      thoigianphim: row.THOILUONG,
      ngayPhatHanhThuyetMinh: row.NGAYPHATHANH,
      daiPhim: row.THELOAI,
      directorName: row.DAODIEN,
      soSuatChieu: row.SO_SUAT_CHIEU,
      doanhThuThang: row.DOANHTHU_THANG,
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách phim thành công.',
      data: {
        movies,
        totalCount,
        currentPage: parseInt(page),
        totalPages,
      },
    });
  } catch (error) {
    console.error('Lỗi getMovies:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Lỗi khi đóng connection:', closeError);
      }
    }
  }
};

/**
 * GET /api/admin/phim/:maphim
 * Fetch single movie details for edit form
 */
export const getMovieById = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { maphim } = req.params;

    if (!maphim) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphim.' });
    }

    const query = `
      SELECT 
        p.MAPHIM,
        p.TENPHIM,
        p.MOTA,
        p.THOILUONG,
        p.NGAYPHATHANH,
        p.POSTER,
        p.THELOAI,
        p.DAODIEN,
        p.GIOIHANTUOI,
        p.TRANGTHAI,
        (SELECT COUNT(*) FROM SUAT_CHIEU sc WHERE sc.MAPHIM = p.MAPHIM) as SO_SUAT_CHIEU
      FROM PHIM p
      WHERE p.MAPHIM = :maphim
    `;

    const result = await connection.execute(query, { maphim }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Phim không tìm thấy.' });
    }

    const row = result.rows[0];
    const movie = {
      maphim: row.MAPHIM,
      tenphim: row.TENPHIM,
      mota: row.MOTA,
      thoigianphim: row.THOILUONG,
      ngayPhatHanhThuyetMinh: row.NGAYPHATHANH,
      poster: row.POSTER,
      daiPhim: row.THELOAI,
      directorName: row.DAODIEN,
      gioihantuoi: row.GIOIHANTUOI,
      trangthai: row.TRANGTHAI,
      soSuatChieu: row.SO_SUAT_CHIEU,
    };

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết phim thành công.',
      data: movie,
    });
  } catch (error) {
    console.error('Lỗi getMovieById:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Lỗi khi đóng connection:', closeError);
      }
    }
  }
};

/**
 * POST /api/admin/phim-create
 * Create new movie using direct SQL INSERT
 */
export const createMovieWithApi = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { tenphim, mota, thoigianphim, ngayPhatHanhThuyetMinh, poster, daiPhim, directorName } = req.body;

    if (!tenphim || !thoigianphim) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số tenphim hoặc thoigianphim.' });
    }

    // Generate MAPHIM using sequence
    const seqResult = await connection.execute('SELECT \'P\' || LPAD(SEQ_PHIM.NEXTVAL, 5, \'0\') as MAPHIM FROM DUAL', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const maphim = seqResult.rows[0]?.MAPHIM;

    // Insert movie
    const query = `
      INSERT INTO PHIM (MAPHIM, TENPHIM, THELOAI, THOILUONG, DAODIEN, NGAYPHATHANH, POSTER, MOTA, TRANGTHAI)
      VALUES (:maphim, :tenphim, :theloai, :thoiluong, :daodien, :ngayphathanh, :poster, :mota, :trangthai)
    `;

    await connection.execute(query, {
      maphim,
      tenphim,
      theloai: daiPhim || null,
      thoiluong: thoigianphim,
      daodien: directorName || null,
      ngayphathanh: ngayPhatHanhThuyetMinh || null,
      poster: poster || null,
      mota: mota || null,
      trangthai: 'Upcoming',
    });

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Tạo phim mới thành công.',
      data: { maphim, tenphim },
    });
  } catch (error) {
    console.error('Lỗi createMovieWithApi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Lỗi khi đóng connection:', closeError);
      }
    }
  }
};

/**
 * PUT /api/admin/phim/:maphim
 * Update movie using direct SQL UPDATE
 */
export const updateMovieWithApi = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { maphim } = req.params;
    const { tenphim, mota, thoigianphim, ngayPhatHanhThuyetMinh, poster, daiPhim, directorName } = req.body;

    if (!maphim || !tenphim) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphim hoặc tenphim.' });
    }

    const query = `
      UPDATE PHIM
      SET TENPHIM = :tenphim,
          THELOAI = :theloai,
          THOILUONG = :thoiluong,
          DAODIEN = :daodien,
          NGAYPHATHANH = :ngayphathanh,
          POSTER = :poster,
          MOTA = :mota
      WHERE MAPHIM = :maphim
    `;

    await connection.execute(query, {
      maphim,
      tenphim,
      theloai: daiPhim || null,
      thoiluong: thoigianphim,
      daodien: directorName || null,
      ngayphathanh: ngayPhatHanhThuyetMinh || null,
      poster: poster || null,
      mota: mota || null,
    });

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Cập nhật phim thành công.',
      data: { maphim, tenphim },
    });
  } catch (error) {
    console.error('Lỗi updateMovieWithApi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Lỗi khi đóng connection:', closeError);
      }
    }
  }
};

/**
 * DELETE /api/admin/phim/:maphim
 * Delete movie using direct SQL DELETE
 */
export const deleteMovieWithApi = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { maphim } = req.params;

    if (!maphim) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số maphim.' });
    }

    // Check if movie has bookings
    const checkQuery = `
      SELECT COUNT(*) as COUNT
      FROM VE v
      JOIN SUAT_CHIEU sc ON v.MASUAT = sc.MASUAT
      WHERE sc.MAPHIM = :maphim
    `;

    const oracledb = getOracle();
    const checkResult = await connection.execute(checkQuery, { maphim }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const bookingCount = checkResult.rows[0]?.COUNT || 0;

    if (bookingCount > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa phim có vé đã bán.' });
    }

    // Delete the movie
    const deleteQuery = `DELETE FROM PHIM WHERE MAPHIM = :maphim`;
    await connection.execute(deleteQuery, { maphim });
    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Xóa phim thành công.',
      data: { maphim },
    });
  } catch (error) {
    console.error('Lỗi deleteMovieWithApi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Lỗi khi đóng connection:', closeError);
      }
    }
  }
};

/**
 * GET /api/admin/dai
 * Get all genres/categories (mock data since DAI table doesn't exist)
 */
export const getGenres = async (req, res) => {
  try {
    // Return mock genres since DAI table doesn't exist in schema
    const genres = [
      { madai: 'ACTION', tendai: 'Hành động' },
      { madai: 'COMEDY', tendai: 'Hài kịch' },
      { madai: 'DRAMA', tendai: 'Chính kịch' },
      { madai: 'HORROR', tendai: 'Kinh dị' },
      { madai: 'ANIMATION', tendai: 'Hoạt hình' },
      { madai: 'DOCUMENTARY', tendai: 'Phim tài liệu' },
      { madai: 'ROMANCE', tendai: 'Tình cảm' },
      { madai: 'SCIFI', tendai: 'Khoa học viễn tưởng' },
      { madai: 'THRILLER', tendai: 'Giật gân' },
      { madai: 'ADVENTURE', tendai: 'Phiêu lưu' },
    ];

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách thể loại thành công.',
      data: genres,
    });
  } catch (error) {
    console.error('Lỗi getGenres:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ================== PHASE 3: SCHEDULE MANAGEMENT ==================

export const getShowtimes = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { search = '', page = 1, limit = 10 } = req.query;

    const query = `
      BEGIN
        SP_GET_SUAT_CHIEU_LIST(
          :p_Search, :p_Page, :p_Limit,
          :p_TotalCount, :p_TotalPages, :p_ResultSet, :p_KetQua, :p_Loi
        );
      END;
    `;

    const binds = {
      p_Search: search,
      p_Page: parseInt(page),
      p_Limit: parseInt(limit),
      p_TotalCount: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_TotalPages: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_ResultSet: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (result.outBinds.p_KetQua === 1) {
      const resultSet = result.outBinds.p_ResultSet;
      const rows = await resultSet.getRows();
      await resultSet.close();

      const showtimes = rows.map(row => ({
        masuat: row.MASUAT,
        tenphim: row.TENPHIM,
        maphong: row.MAPHONG,
        ngaychieu: row.NGAYCHIEU,
        giobatdau: row.GIOBATDAU,
        gioketthuc: row.GIOKETTHUC,
        soVeDaBan: row.SO_VE_BAN,
        succhuaghe: row.SUCCHUAGHE,
        tyLeLapDay: row.TY_LE_LAP_DAY
      }));

      res.status(200).json({
        success: true,
        data: {
          showtimes,
          totalCount: result.outBinds.p_TotalCount,
          totalPages: result.outBinds.p_TotalPages,
          currentPage: parseInt(page)
        }
      });
    } else {
      res.status(400).json({ success: false, message: result.outBinds.p_Loi });
    }
  } catch (error) {
    console.error('Lỗi getShowtimes:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) await connection.close();
  }
};

export const getRooms = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();

    const query = `BEGIN SP_GET_PHONG_CHIEU_LIST(:p_ResultSet, :p_KetQua, :p_Loi); END;`;
    const binds = {
      p_ResultSet: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (result.outBinds.p_KetQua === 1) {
      const resultSet = result.outBinds.p_ResultSet;
      const rows = await resultSet.getRows();
      await resultSet.close();

      const rooms = rows.map(row => ({
        maphong: row.MAPHONG,
        tenrap: row.TENRAP,
        succhuaghe: row.SUCCHUAGHE
      }));

      res.status(200).json({ success: true, data: rooms });
    } else {
      res.status(400).json({ success: false, message: result.outBinds.p_Loi });
    }
  } catch (error) {
    console.error('Lỗi getRooms:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) await connection.close();
  }
};

export const getMoviesDropdown = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();

    const query = `BEGIN SP_GET_PHIM_DROPDOWN(:p_ResultSet, :p_KetQua, :p_Loi); END;`;
    const binds = {
      p_ResultSet: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (result.outBinds.p_KetQua === 1) {
      const resultSet = result.outBinds.p_ResultSet;
      const rows = await resultSet.getRows();
      await resultSet.close();

      const movies = rows.map(row => ({
        maphim: row.MAPHIM,
        tenphim: row.TENPHIM,
        thoiluong: row.THOILUONG
      }));

      res.status(200).json({ success: true, data: movies });
    } else {
      res.status(400).json({ success: false, message: result.outBinds.p_Loi });
    }
  } catch (error) {
    console.error('Lỗi getMoviesDropdown:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) await connection.close();
  }
};

export const createShowtime = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { maphim, maphong, ngaychieu, giobatdau, gioketthuc, trangthaisuat } = req.body;

    // Fix Bug sai trạng thái từ Frontend gửi lên
    const status = trangthaisuat === 'Active' ? 'Showing' : trangthaisuat;

    const query = `BEGIN SP_THEM_SUAT_CHIEU(:p_MAPHIM, :p_MAPHONG, :p_NGAYCHIEU, :p_GIOBATDAU, :p_GIOKETTHUC, :p_TRANGTHAISUAT, :p_KetQua, :p_Loi, :p_MASUAT); END;`;
    const binds = {
      p_MAPHIM: maphim,
      p_MAPHONG: maphong,
      p_NGAYCHIEU: new Date(ngaychieu),
      p_GIOBATDAU: new Date(`${ngaychieu}T${giobatdau}`),
      p_GIOKETTHUC: new Date(`${ngaychieu}T${gioketthuc}`),
      p_TRANGTHAISUAT: status,
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
      p_MASUAT: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 }
    };
    
    const result = await connection.execute(query, binds);
    if (result.outBinds.p_KetQua === 1) res.status(201).json({ success: true, message: 'Thêm suất chiếu thành công!' });
    else res.status(400).json({ success: false, message: result.outBinds.p_Loi });
  } catch (error) { 
    console.error('Lỗi createShowtime:', error); 
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' }); 
  } finally { 
    if (connection) await connection.close(); 
  }
};

export const updateShowtime = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { masuat } = req.params;
    const { maphim, maphong, ngaychieu, giobatdau, gioketthuc, trangthaisuat } = req.body;

    const status = trangthaisuat === 'Active' ? 'Showing' : trangthaisuat;

    const query = `BEGIN SP_SUA_SUAT_CHIEU(:p_MASUAT, :p_MAPHIM, :p_MAPHONG, :p_NGAYCHIEU, :p_GIOBATDAU, :p_GIOKETTHUC, :p_TRANGTHAISUAT, :p_KetQua, :p_Loi); END;`;
    const binds = {
      p_MASUAT: masuat,
      p_MAPHIM: maphim,
      p_MAPHONG: maphong,
      p_NGAYCHIEU: new Date(ngaychieu),
      p_GIOBATDAU: new Date(`${ngaychieu}T${giobatdau}`),
      p_GIOKETTHUC: new Date(`${ngaychieu}T${gioketthuc}`),
      p_TRANGTHAISUAT: status,
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };
    
    const result = await connection.execute(query, binds);
    if (result.outBinds.p_KetQua === 1) res.status(200).json({ success: true, message: 'Cập nhật thành công!' });
    else res.status(400).json({ success: false, message: result.outBinds.p_Loi });
  } catch (error) { 
    console.error('Lỗi updateShowtime:', error); 
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' }); 
  } finally { 
    if (connection) await connection.close(); 
  }
};

export const deleteShowtime = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { masuat } = req.params;

    const query = `BEGIN SP_XOA_SUAT_CHIEU(:p_MASUAT, :p_KetQua, :p_Loi); END;`;
    const binds = {
      p_MASUAT: masuat,
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };
    
    const result = await connection.execute(query, binds);
    if (result.outBinds.p_KetQua === 1) res.status(200).json({ success: true, message: 'Xóa thành công!' });
    else res.status(400).json({ success: false, message: result.outBinds.p_Loi });
  } catch (error) { 
    console.error('Lỗi deleteShowtime:', error); 
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' }); 
  } finally { 
    if (connection) await connection.close(); 
  }
};

// ================== PHASE 4: VOUCHER MANAGEMENT ==================

export const getVouchers = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { search = '', page = 1, limit = 10 } = req.query;

    const query = `
      BEGIN
        SP_GET_KHUYEN_MAI_LIST(
          :p_Search, :p_Page, :p_Limit,
          :p_TotalCount, :p_TotalPages, :p_ResultSet, :p_KetQua, :p_Loi
        );
      END;
    `;

    const binds = {
      p_Search: search,
      p_Page: parseInt(page),
      p_Limit: parseInt(limit),
      p_TotalCount: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_TotalPages: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_ResultSet: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (result.outBinds.p_KetQua === 1) {
      const resultSet = result.outBinds.p_ResultSet;
      const rows = await resultSet.getRows();
      await resultSet.close();

      const vouchers = rows.map(row => ({
        makhuyenmai: row.MAKHUYENMAI,
        tenchuongtrinh: row.TENCHUONGTRINH,
        giatrigiam: row.GIATRIGIAM,
        dieukienapdung: row.DIEUKIENAPDUNG,
        ngaybatdau: row.NGAYBATDAU,
        ngayketthuc: row.NGAYKETTHUC,
        soLanSuDung: row.SO_LAN_SU_DUNG,
        trangThai: row.TRANG_THAI
      }));

      res.status(200).json({
        success: true,
        data: {
          vouchers,
          totalCount: result.outBinds.p_TotalCount,
          totalPages: result.outBinds.p_TotalPages,
          currentPage: parseInt(page)
        }
      });
    } else {
      res.status(400).json({ success: false, message: result.outBinds.p_Loi });
    }
  } catch (error) {
    console.error('Lỗi getVouchers:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  } finally {
    if (connection) await connection.close();
  }
};

export const createVoucher = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { tenchuongtrinh, giatrigiam, dieukienapdung, ngaybatdau, ngayketthuc } = req.body;

    const query = `BEGIN SP_THEM_KHUYEN_MAI(:p_TENCHUONGTRINH, :p_GIATRIGIAM, :p_DIEUKIENAPDUNG, :p_NGAYBATDAU, :p_NGAYKETTHUC, :p_KetQua, :p_Loi, :p_MAKHUYENMAI); END;`;
    const binds = {
      p_TENCHUONGTRINH: tenchuongtrinh,
      p_GIATRIGIAM: Number(giatrigiam) || 0,        // FIX: Ép kiểu an toàn sang Số
      p_DIEUKIENAPDUNG: Number(dieukienapdung) || 0, // FIX: Ép kiểu an toàn sang Số
      p_NGAYBATDAU: new Date(ngaybatdau),
      p_NGAYKETTHUC: new Date(ngayketthuc),
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
      p_MAKHUYENMAI: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 }
    };
    
    const result = await connection.execute(query, binds);
    if (result.outBinds.p_KetQua === 1) res.status(201).json({ success: true, message: 'Thêm Voucher thành công!' });
    else res.status(400).json({ success: false, message: result.outBinds.p_Loi });
  } catch (error) { 
    console.error('Lỗi createVoucher:', error); 
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' }); 
  } finally { 
    if (connection) await connection.close(); 
  }
};

export const updateVoucher = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { makhuyenmai } = req.params;
    const { tenchuongtrinh, giatrigiam, dieukienapdung, ngaybatdau, ngayketthuc } = req.body;

    const query = `BEGIN SP_SUA_KHUYEN_MAI(:p_MAKHUYENMAI, :p_TENCHUONGTRINH, :p_GIATRIGIAM, :p_DIEUKIENAPDUNG, :p_NGAYBATDAU, :p_NGAYKETTHUC, :p_KetQua, :p_Loi); END;`;
    const binds = {
      p_MAKHUYENMAI: makhuyenmai,
      p_TENCHUONGTRINH: tenchuongtrinh,
      p_GIATRIGIAM: Number(giatrigiam) || 0,        // FIX: Ép kiểu an toàn sang Số
      p_DIEUKIENAPDUNG: Number(dieukienapdung) || 0, // FIX: Ép kiểu an toàn sang Số
      p_NGAYBATDAU: new Date(ngaybatdau),
      p_NGAYKETTHUC: new Date(ngayketthuc),
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };
    
    const result = await connection.execute(query, binds);
    if (result.outBinds.p_KetQua === 1) res.status(200).json({ success: true, message: 'Cập nhật thành công!' });
    else res.status(400).json({ success: false, message: result.outBinds.p_Loi });
  } catch (error) { 
    console.error('Lỗi updateVoucher:', error); 
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' }); 
  } finally { 
    if (connection) await connection.close(); 
  }
};

export const deleteVoucher = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();
    const { makhuyenmai } = req.params;

    const query = `BEGIN SP_XOA_KHUYEN_MAI(:p_MAKHUYENMAI, :p_KetQua, :p_Loi); END;`;
    const binds = {
      p_MAKHUYENMAI: makhuyenmai,
      p_KetQua: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_Loi: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };
    
    const result = await connection.execute(query, binds);
    if (result.outBinds.p_KetQua === 1) res.status(200).json({ success: true, message: 'Xóa thành công!' });
    else res.status(400).json({ success: false, message: result.outBinds.p_Loi });
  } catch (error) { 
    console.error('Lỗi deleteVoucher:', error); 
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' }); 
  } finally { 
    if (connection) await connection.close(); 
  }
};