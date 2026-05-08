import express from 'express';
import {
  holdSeat,
  applyVoucher,
  calculateTicketPrice,
  checkout,
  cancelBooking,
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Booking Routes
 * All routes are protected with JWT authentication
 */

/**
 * POST /api/booking/hold
 * Hold seat(s) for a user
 * Body: { masuat, seatIds: [MAGHE1, MAGHE2], matk? }
 * Response: { success, message, data: { masuat, heldSeats, totalHeld } }
 */
router.post('/hold', verifyToken, holdSeat);

/**
 * POST /api/booking/calculate-price
 * Calculate ticket price based on seat type, customer type, date & time
 * Body: { maloaighe, maloaikhach, ngaychieu, giobatdau }
 * Response: { success, message, data: { price } }
 */
router.post('/calculate-price', verifyToken, calculateTicketPrice);

/**
 * POST /api/booking/apply-voucher
 * Validate and apply promotion code
 * Body: { makhuyenmai, totalAmount }
 * Response: { success, message, data: { valid, discount, message } }
 */
router.post('/apply-voucher', verifyToken, applyVoucher);

/**
 * POST /api/booking/checkout
 * Complete booking and create transaction
 * Body: { masuat, seatIds, makhuyenmai?, paymentMethod, totalAmount }
 * Response: { success, message, data: { transactionId, ticketIds, totalAmount, finalAmount } }
 */
router.post('/checkout', verifyToken, checkout);

/**
 * POST /api/booking/cancel
 * Cancel booking and release held seats
 * Body: { datIds: [MADAT1, MADAT2] }
 * Response: { success, message, data: { released } }
 */
router.post('/cancel', verifyToken, cancelBooking);

export default router;
