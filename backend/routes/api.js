import { Router } from 'express';
import catalogRouter from './catalog.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';
import bookingRouter from './booking.js';
import demoRouter from './demo.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Cinemoon backend is running.' });
});

// Route groups
router.use('/auth', authRouter);
router.use('/catalog', catalogRouter);
router.use('/admin', adminRouter);
router.use('/booking', bookingRouter);
router.use('/demo', demoRouter);

// Legacy movie endpoints (to be deprecated in favor of /catalog/*)
import { getMovies, getShowtimes, getSeats } from '../controllers/movieController.js';

router.get('/movies', getMovies);
router.get('/showtimes', getShowtimes);
router.get('/seats', getSeats);

export default router;