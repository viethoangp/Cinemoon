import { Router } from 'express';
import * as adminCtrl from '../controllers/adminController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Middleware: Protect all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// ================== LOAI_GHE ==================
router.post('/loai-ghe', adminCtrl.createLoaiGhe);
router.put('/loai-ghe', adminCtrl.updateLoaiGhe);
router.delete('/loai-ghe', adminCtrl.deleteLoaiGhe);

// ================== LOAI_KHACH ==================
router.post('/loai-khach', adminCtrl.createLoaiKhach);
router.put('/loai-khach', adminCtrl.updateLoaiKhach);
router.delete('/loai-khach', adminCtrl.deleteLoaiKhach);

// ================== PHONG_CHIEU ==================
router.post('/phong-chieu', adminCtrl.createPhongChieu);
router.put('/phong-chieu', adminCtrl.updatePhongChieu);
router.delete('/phong-chieu', adminCtrl.deletePhongChieu);

// ================== QUY_DINH_GIA ==================
router.post('/quy-dinh-gia', adminCtrl.createQuyDinhGia);
router.put('/quy-dinh-gia', adminCtrl.updateQuyDinhGia);
router.delete('/quy-dinh-gia', adminCtrl.deleteQuyDinhGia);

// ================== GHE_NGOI ==================
router.post('/ghe-ngoi', adminCtrl.createGheNgoi);
router.put('/ghe-ngoi', adminCtrl.updateGheNgoi);
router.delete('/ghe-ngoi', adminCtrl.deleteGheNgoi);

// ================== KHUYEN_MAI ==================
router.post('/khuyen-mai', adminCtrl.createKhuyenMai);
router.put('/khuyen-mai', adminCtrl.updateKhuyenMai);
router.delete('/khuyen-mai', adminCtrl.deleteKhuyenMai);

// ================== THAM_SO ==================
router.post('/tham-so', adminCtrl.createThamSo);
router.put('/tham-so', adminCtrl.updateThamSo);
router.delete('/tham-so', adminCtrl.deleteThamSo);

// ================== PHIM (SUA/XOA only) ==================
router.put('/phim', adminCtrl.updatePhim);
router.delete('/phim', adminCtrl.deletePhim);

// ================== SUAT_CHIEU (SUA/XOA only) ==================
router.put('/suat-chieu', adminCtrl.updateSuatChieu);
router.delete('/suat-chieu', adminCtrl.deleteSuatChieu);

export default router;
