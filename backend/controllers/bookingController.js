import {
  holdSeats,
  releaseHeldSeats,
  validateAndApplyVoucher,
  calculatePrice,
  createTransaction,
} from '../services/bookingService.js';
import { buildResponse } from '../utils/responseBuilder.js';

/**
 * Hold seat(s) for a user
 * Handles ORA-00054 (resource busy) for concurrent access
 * POST /api/booking/hold
 * Body: { masuat, seatIds: [MAGHE1, MAGHE2], matk }
 */
export async function holdSeat(req, res) {
  try {
    const { masuat, seatIds, matk } = req.body;

    // Validate required fields
    if (!masuat || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json(
        buildResponse(false, 'Thiếu thông tin: masuat, seatIds (array)')
      );
    }

    // Use authenticated user ID if not provided
    const userId = matk || req.user?.MATK;
    if (!userId) {
      return res.status(401).json(buildResponse(false, 'Chưa xác thực.'));
    }

    const result = await holdSeats(masuat, seatIds, userId);

    if (!result.success) {
      // Handle ORA-00054 specifically
      if (result.errorCode === 'ORA-00054') {
        return res.status(409).json(buildResponse(false, result.message, result));
      }
      return res.status(400).json(buildResponse(false, result.message, result));
    }

    res.status(200).json(buildResponse(true, result.message, result.data));
  } catch (error) {
    console.error('Lỗi holdSeat:', error);
    res.status(500).json(buildResponse(false, error.message, {}));
  }
}

/**
 * Apply voucher/promotion code
 * POST /api/booking/apply-voucher
 * Body: { makhuyenmai, totalAmount }
 */
export async function applyVoucher(req, res) {
  try {
    const { makhuyenmai, totalAmount } = req.body;

    if (!makhuyenmai || !totalAmount) {
      return res.status(400).json(
        buildResponse(false, 'Thiếu thông tin: makhuyenmai, totalAmount')
      );
    }

    const result = await validateAndApplyVoucher(makhuyenmai, totalAmount);

    if (!result.valid) {
      return res.status(400).json(buildResponse(false, result.message, result));
    }

    res.status(200).json(buildResponse(true, result.message, result));
  } catch (error) {
    console.error('Lỗi applyVoucher:', error);
    res.status(500).json(buildResponse(false, error.message, {}));
  }
}

/**
 * Calculate ticket price
 * POST /api/booking/calculate-price
 * Body: { maloaighe, maloaikhach, ngaychieu, giobatdau }
 */
export async function calculateTicketPrice(req, res) {
  try {
    const { maloaighe, maloaikhach, ngaychieu, giobatdau } = req.body;

    if (!maloaighe || !maloaikhach || !ngaychieu || !giobatdau) {
      return res.status(400).json(
        buildResponse(
          false,
          'Thiếu thông tin: maloaighe, maloaikhach, ngaychieu, giobatdau'
        )
      );
    }

    const price = await calculatePrice(maloaighe, maloaikhach, ngaychieu, giobatdau);

    res.status(200).json(
      buildResponse(true, 'Tính giá thành công.', { price })
    );
  } catch (error) {
    console.error('Lỗi calculateTicketPrice:', error);
    res.status(500).json(buildResponse(false, error.message, {}));
  }
}

/**
 * Complete checkout and create transaction
 * POST /api/booking/checkout
 * Body: { masuat, seatIds, makhuyenmai?, paymentMethod, totalAmount }
 */
export async function checkout(req, res) {
  try {
    const { masuat, seatIds, makhuyenmai, paymentMethod, totalAmount } = req.body;
    const matk = req.user?.MATK;

    if (!matk) {
      return res.status(401).json(buildResponse(false, 'Chưa xác thực.'));
    }

    if (!masuat || !seatIds || !Array.isArray(seatIds) || !totalAmount) {
      return res.status(400).json(
        buildResponse(
          false,
          'Thiếu thông tin: masuat, seatIds (array), totalAmount'
        )
      );
    }

    // Apply discount if voucher provided
    let discount = 0;
    if (makhuyenmai) {
      const voucherResult = await validateAndApplyVoucher(
        makhuyenmai,
        totalAmount
      );
      if (voucherResult.valid) {
        discount = voucherResult.discount;
      }
    }

    // Create transaction
    const result = await createTransaction({
      masuat,
      matk,
      seatIds,
      discount,
      paymentMethod,
      totalAmount,
    });

    if (!result.success) {
      return res.status(400).json(buildResponse(false, result.message, result));
    }

    res.status(201).json(buildResponse(true, result.message, result.data));
  } catch (error) {
    console.error('Lỗi checkout:', error);
    res.status(500).json(buildResponse(false, error.message, {}));
  }
}

/**
 * Cancel booking and release held seats
 * POST /api/booking/cancel
 * Body: { datIds: [MADAT1, MADAT2] }
 */
export async function cancelBooking(req, res) {
  try {
    const { datIds } = req.body;

    if (!datIds || !Array.isArray(datIds) || datIds.length === 0) {
      return res.status(400).json(buildResponse(false, 'Thiếu thông tin: datIds (array)'));
    }

    const result = await releaseHeldSeats(datIds);

    res.status(200).json(
      buildResponse(true, `Hủy ${result.released} đặt chỗ thành công.`, result)
    );
  } catch (error) {
    console.error('Lỗi cancelBooking:', error);
    res.status(500).json(buildResponse(false, error.message, {}));
  }
}