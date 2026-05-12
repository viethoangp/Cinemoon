import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', authCtrl.login);
router.post('/register', authCtrl.register);

// Protected routes
router.get('/me', verifyToken, authCtrl.getUserProfile);

export default router;
