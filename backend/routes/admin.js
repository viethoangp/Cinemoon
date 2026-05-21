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

// ================== PHIM (THEM/SUA/XOA) ==================
router.post('/phim', adminCtrl.createPhim);
router.put('/phim', adminCtrl.updatePhim);
router.delete('/phim', adminCtrl.deletePhim);

// ================== SUAT_CHIEU (THEM/SUA/XOA) ==================
router.post('/suat-chieu', adminCtrl.createSuatChieu);
router.put('/suat-chieu', adminCtrl.updateSuatChieu);
router.delete('/suat-chieu', adminCtrl.deleteSuatChieu);

// ================== DASHBOARD STATS ==================
router.get('/stats/overview', adminCtrl.getDashboardStats);

// ================== PHASE 2: MOVIES MANAGEMENT ==================
router.get('/phim', adminCtrl.getMovies);                    // GET list with pagination + search
router.get('/phim/:maphim', adminCtrl.getMovieById);        // GET single movie details
router.post('/phim-create', adminCtrl.createMovieWithApi);   // POST create movie
router.put('/phim/:maphim', adminCtrl.updateMovieWithApi);   // PUT update movie
router.delete('/phim/:maphim', adminCtrl.deleteMovieWithApi); // DELETE movie
router.get('/dai', adminCtrl.getGenres);                     // GET genres for dropdown

// ================== PHASE 3: SCHEDULE MANAGEMENT ==================
router.get('/suat-chieu', adminCtrl.getShowtimes);           // GET list with pagination + search
router.get('/phong-chieu-list', adminCtrl.getRooms);         // GET rooms for dropdown
router.get('/phim-list', adminCtrl.getMoviesDropdown);       // GET movies for dropdown
router.post('/suat-chieu-create', adminCtrl.createShowtime); // POST create showtime
router.put('/suat-chieu/:masuat', adminCtrl.updateShowtime); // PUT update showtime
router.delete('/suat-chieu/:masuat', adminCtrl.deleteShowtime); // DELETE showtime

// ================== PHASE 4: VOUCHER MANAGEMENT ==================
router.get('/khuyen-mai', adminCtrl.getVouchers);            // GET list with pagination + search
router.post('/khuyen-mai-create', adminCtrl.createVoucher);  // POST create voucher
router.put('/khuyen-mai/:makhuyenmai', adminCtrl.updateVoucher); // PUT update voucher
router.delete('/khuyen-mai/:makhuyenmai', adminCtrl.deleteVoucher); // DELETE voucher

export default router;
