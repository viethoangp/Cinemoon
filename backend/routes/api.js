import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { getMovies, getShowtimes, getSeats } from '../controllers/movieController.js';
import { applyVoucher, cancelBooking, checkout, holdSeat } from '../controllers/bookingController.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Cinemoon backend is running.' });
});

apiRouter.post('/auth/login', login);
apiRouter.post('/auth/register', register);

apiRouter.get('/movies', getMovies);
apiRouter.get('/showtimes', getShowtimes);
apiRouter.get('/seats', getSeats);

apiRouter.post('/booking/hold-seat', holdSeat);
apiRouter.post('/booking/apply-voucher', applyVoucher);
apiRouter.post('/booking/checkout', checkout);
apiRouter.post('/booking/cancel', cancelBooking);