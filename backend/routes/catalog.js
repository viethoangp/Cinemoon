import { Router } from 'express';
import * as catalogController from '../controllers/catalogController.js';

const router = Router();

// LOAI_GHE
router.get('/loai-ghe', catalogController.getLoaiGhe);

// LOAI_KHACH
router.get('/loai-khach', catalogController.getLoaiKhach);

// RAP
router.get('/rap', catalogController.getRap);

// PHONG_CHIEU
router.get('/phong-chieu', catalogController.getPhongChieu);

// PHIM
router.get('/phim', catalogController.getPhim);
router.get('/phim/:id', catalogController.getPhimById);

// SUAT_CHIEU
router.get('/suat-chieu', catalogController.getSuatChieu);

// GHE_NGOI
router.get('/ghe-ngoi', catalogController.getGheNgoi);

// QUY_DINH_GIA
router.get('/quy-dinh-gia', catalogController.getQuyDinhGia);

// KHUYEN_MAI
router.get('/khuyen-mai', catalogController.getKhuyenMai);

// THAM_SO
router.get('/tham-so', catalogController.getThamSo);
router.get('/ghe-da-dat', catalogController.getBookedSeats);
export default router;
