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

    // DEBUG: Log dữ liệu nhận được
    console.log('[holdSeat Controller] Dữ liệu nhận được:', {
      body: req.body,
      masuat,
      seatIds,
      matk,
      req_user: req.user,
      MATK_from_token: req.user?.MATK,
    });

    // Validate required fields
    if (!masuat || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      console.error('[holdSeat Controller] Validation failed:', { masuat, seatIds, isArray: Array.isArray(seatIds) });
      return res.status(400).json(
        buildResponse(false, 'Thiếu thông tin: masuat, seatIds (array)')
      );
    }

    // Use authenticated user ID if not provided
    const userId = matk || req.user?.MATK;
    if (!userId) {
      console.error('[holdSeat Controller] Không có userId');
      return res.status(401).json(buildResponse(false, 'Chưa xác thực.'));
    }

    console.log('[holdSeat Controller] Gọi holdSeats service với:', { masuat, seatIds, userId });
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
    // DEBUG: Log everything received
    console.log('\n=== [checkout Controller] START ===');
    console.log('[checkout] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[checkout] Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? '✓ Present' : '✗ Missing',
    });
    
    const { masuat, seatIds, makhuyenmai, paymentMethod, totalAmount } = req.body;
    const matk = req.user?.MATK;

    console.log('[checkout] Extracted from body:', {
      masuat: masuat ? `"${masuat}"` : 'UNDEFINED',
      seatIds: seatIds ? `[${seatIds}]` : 'UNDEFINED',
      seatIds_isArray: Array.isArray(seatIds),
      totalAmount: totalAmount,
      totalAmount_type: typeof totalAmount,
      makhuyenmai: makhuyenmai || 'none',
      paymentMethod: paymentMethod || 'UNDEFINED',
      matk: matk || 'UNDEFINED (NO AUTH)',
    });

    if (!matk) {
      console.error('[checkout] ERROR: No MATK - user not authenticated');
      return res.status(401).json(buildResponse(false, 'Chưa xác thực.'));
    }

    // Validation check
    const validationFails = {
      masuat_missing: !masuat,
      seatIds_missing: !seatIds,
      seatIds_notArray: !Array.isArray(seatIds),
      totalAmount_missing: !totalAmount,
    };

    console.log('[checkout] Validation checks:', validationFails);

    if (!masuat || !seatIds || !Array.isArray(seatIds) || !totalAmount) {
      console.error('[checkout] VALIDATION FAILED:', validationFails);
      return res.status(400).json(
        buildResponse(
          false,
          'Thiếu thông tin: masuat, seatIds (array), totalAmount'
        )
      );
    }

    console.log('[checkout] ✓ All validations passed, proceeding with checkout...');

    // Apply discount if voucher provided
    let discount = 0;
    if (makhuyenmai) {
      console.log('[checkout] Validating voucher:', makhuyenmai);
      const voucherResult = await validateAndApplyVoucher(
        makhuyenmai,
        totalAmount
      );
      if (voucherResult.valid) {
        discount = voucherResult.discount;
        console.log('[checkout] Voucher applied - discount:', discount);
      }
    }

    // Create transaction
    console.log('[checkout] Calling createTransaction with data:', {
      masuat, matk, seatIds, discount, paymentMethod, totalAmount
    });
    
    const result = await createTransaction({
      masuat,
      matk,
      seatIds,
      discount,
      paymentMethod,
      totalAmount,
    });

    console.log('[checkout] createTransaction result:', result);

    if (!result.success) {
      console.error('[checkout] Transaction failed:', result.message);
      return res.status(400).json(buildResponse(false, result.message, result));
    }

    console.log('[checkout] ✓ Checkout successful, returning:', result.data);
    res.status(201).json(buildResponse(true, result.message, result.data));
  } catch (error) {
    console.error('[checkout] EXCEPTION:', error.message);
    console.error('[checkout] Stack:', error.stack);
    res.status(500).json(buildResponse(false, error.message, {}));
  }
  console.log('=== [checkout Controller] END ===\n');
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