import { callStoredProcedure } from '../services/spService.js';
import { SP_CATALOG } from '../config/constants.js';
import { getOracle } from '../config/db.js';

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
