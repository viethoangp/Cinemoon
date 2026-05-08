// ============================================
// Tên Stored Procedure - CRUD Catalog
// ============================================

export const SP_CATALOG = {
  // LOAI_GHE
  THEM_LOAI_GHE: 'SP_THEM_LOAI_GHE',
  SUA_LOAI_GHE: 'SP_SUA_LOAI_GHE',
  XOA_LOAI_GHE: 'SP_XOA_LOAI_GHE',

  // LOAI_KHACH
  THEM_LOAI_KHACH: 'SP_THEM_LOAI_KHACH',
  SUA_LOAI_KHACH: 'SP_SUA_LOAI_KHACH',
  XOA_LOAI_KHACH: 'SP_XOA_LOAI_KHACH',

  // PHONG_CHIEU
  THEM_PHONG_CHIEU: 'SP_THEM_PHONG_CHIEU',
  SUA_PHONG_CHIEU: 'SP_SUA_PHONG_CHIEU',
  XOA_PHONG_CHIEU: 'SP_XOA_PHONG_CHIEU',

  // QUY_DINH_GIA
  THEM_QUY_DINH_GIA: 'SP_THEM_QUY_DINH_GIA',
  SUA_QUY_DINH_GIA: 'SP_SUA_QUY_DINH_GIA',
  XOA_QUY_DINH_GIA: 'SP_XOA_QUY_DINH_GIA',

  // GHE_NGOI
  THEM_GHE_NGOI: 'SP_THEM_GHE_NGOI',
  SUA_GHE_NGOI: 'SP_SUA_GHE_NGOI',
  XOA_GHE_NGOI: 'SP_XOA_GHE_NGOI',

  // KHUYEN_MAI
  THEM_KHUYEN_MAI: 'SP_THEM_KHUYEN_MAI',
  SUA_KHUYEN_MAI: 'SP_SUA_KHUYEN_MAI',
  XOA_KHUYEN_MAI: 'SP_XOA_KHUYEN_MAI',

  // THAM_SO
  THEM_THAM_SO: 'SP_THEM_THAM_SO',
  SUA_THAM_SO: 'SP_SUA_THAM_SO',
  XOA_THAM_SO: 'SP_XOA_THAM_SO',

  // PHIM (chỉ SUA & XOA)
  SUA_PHIM: 'SP_SUA_PHIM',
  XOA_PHIM: 'SP_XOA_PHIM',

  // SUAT_CHIEU (chỉ SUA & XOA)
  SUA_SUAT_CHIEU: 'SP_SUA_SUAT_CHIEU',
  XOA_SUAT_CHIEU: 'SP_XOA_SUAT_CHIEU',
};

// ============================================
// Oracle Error Codes
// ============================================
export const ORA_ERROR_CODES = {
  CONSTRAINT_VIOLATION: -2292,      // ORA-02292: integrity constraint violated
  LOCK_TIMEOUT: -54,                // ORA-00054: resource busy
  DEADLOCK_DETECTED: -60,           // ORA-00060: deadlock detected
};

// ============================================
// Enum Values
// ============================================
export const ENUM_VALUES = {
  TRANGTHAI_SUAT: ['Upcoming', 'Showing', 'Closed', 'Cancelled'],
  TRANGTHAI_TAIKHOAN: ['Active', 'Locked'],
  QUYENTRUYCAP: ['Admin', 'Staff', 'Customer'],
  GIOITINH: ['Male', 'Female', 'Other'],
  TRANGTHAI_GIAO_DICH: ['Pending', 'Paid', 'Cancelled'],
  TRANGTHAICHO: ['Held', 'Paid', 'Expired', 'Cancelled'],
  TRANGTHAIVE: ['Issued', 'Refunded'],
  PHUONGTHUC_THANH_TOAN: ['Momo', 'VNPay', 'Cash'],
  TRANGTHAI_TT: ['Success', 'Failed'],
  TRANGTHAI_PHIM: ['Showing', 'Upcoming', 'Closed'],
};
