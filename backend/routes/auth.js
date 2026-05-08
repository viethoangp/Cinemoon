import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', authCtrl.login);
router.post('/register', authCtrl.register);

// Protected routes
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin tài khoản thành công.',
      data: {
        user: req.user,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});

export default router;
