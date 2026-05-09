import { executeQuery, callStoredProcedure } from './spService.js';
import { getConnection, getOracle } from '../config/db.js';

/**
 * Calculate ticket price based on seat type, customer type, day & time
 * @param {string} maloaighe - Seat type ID
 * @param {string} maloaikhach - Customer type ID
 * @param {string} ngaychieu - Show date (YYYY-MM-DD)
 * @param {string} giobatdau - Show time (HH:MM:SS or HH:MM)
 * @returns {Promise<number>} Calculated price
 */
export async function calculatePrice(maloaighe, maloaikhach, ngaychieu, giobatdau) {
  try {
    // Normalize time format to HH:MM for comparison
    const timeNormalized = giobatdau.substring(0, 5); // Extract HH:MM

    // Query to get day of week first (convert 1 to 8 for Sunday)
    const dayQuery = `
      SELECT CASE WHEN TO_NUMBER(TO_CHAR(TO_DATE(:ngaychieu, 'YYYY-MM-DD'), 'D')) = 1 THEN 8 
                  ELSE TO_NUMBER(TO_CHAR(TO_DATE(:ngaychieu, 'YYYY-MM-DD'), 'D')) END as THU_CHIEU
      FROM DUAL
    `;

    const dayResults = await executeQuery(dayQuery, [ngaychieu, ngaychieu]);
    if (!dayResults || dayResults.length === 0) {
      throw new Error('Không thể tính ngày chiếu.');
    }

    const thuChieu = dayResults[0].THU_CHIEU;

    // Now get the price rule
    const query = `
      SELECT qdg.DONGIA, qdg.HESONHAN
      FROM QUY_DINH_GIA qdg
      WHERE qdg.MALOAIGHE = :maloaighe
        AND qdg.MALOAIKHACH = :maloaikhach
        AND qdg.THU = :thu
        AND :giobatdau BETWEEN qdg.GIOBATDAU AND qdg.GIOKETTHUC
      ORDER BY qdg.DONGIA DESC
    `;

    const results = await executeQuery(query, [
      maloaighe,
      maloaikhach,
      thuChieu,
      timeNormalized,
    ]);

    if (results.length === 0) {
      throw new Error('Không tìm thấy quy định giá phù hợp.');
    }

    const rule = results[0];
    const finalPrice = rule.DONGIA * (rule.HESONHAN || 1);
    return Math.round(finalPrice);
  } catch (error) {
    console.error('Lỗi calculatePrice:', error);
    throw error;
  }
}

/**
 * Validate and apply promotion code
 * @param {string} makhuyenmai - Promotion ID
 * @param {number} totalAmount - Total amount before discount
 * @returns {Promise<{valid: boolean, discount: number, message: string}>}
 */
export async function validateAndApplyVoucher(makhuyenmai, totalAmount) {
  try {
    const query = `
      SELECT MAKHUYENMAI, TENCHUONGTRINH, GIATRIGIAM, DIEUKIENAPDUNG, NGAYBATDAU, NGAYKETTHUC
      FROM KHUYEN_MAI
      WHERE MAKHUYENMAI = :makhuyenmai
        AND SYSDATE BETWEEN NGAYBATDAU AND NGAYKETTHUC
    `;

    const results = await executeQuery(query, [makhuyenmai]);
    if (results.length === 0) {
      return {
        valid: false,
        discount: 0,
        message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.',
      };
    }

    const voucher = results[0];
    const discount = Math.min(voucher.GIATRIGIAM, totalAmount);

    return {
      valid: true,
      discount,
      message: `Áp dụng khuyến mãi "${voucher.TENCHUONGTRINH}" thành công. Giảm: ${discount}đ`,
    };
  } catch (error) {
    console.error('Lỗi validateAndApplyVoucher:', error);
    throw error;
  }
}

/**
 * Hold multiple seats with SELECT FOR UPDATE NOWAIT
 * Prevents ORA-00054 by checking availability first
 * @param {string} masuat - Showtime ID
 * @param {array} seatIds - Array of seat IDs [MAGHE1, MAGHE2, ...]
 * @param {string} userId - User ID (MATK)
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export async function holdSeats(masuat, seatIds, userId) {
  let connection;
  try {
    connection = await getConnection();
    // BƯỚC 0: NGƯỜI QUÉT DỌN (TỰ ĐỘNG GIẢI PHÓNG GHẾ HẾT HẠN)
    // Xóa tất cả các ghế của suất chiếu này đã quá 15 phút mà chưa thanh toán
    const cleanupQuery = `
      DELETE FROM DAT_CHO 
      WHERE MASUAT = :masuat 
        AND TRANGTHAICHO = 'Held' 
        AND GIUDEN < CURRENT_TIMESTAMP
    `;
    await connection.execute(cleanupQuery, { masuat });
    // Bước 1: Kiểm tra suất chiếu
    const checkQuery = `
      SELECT sc.MASUAT, sc.MAPHIM, sc.MAPHONG, sc.TRANGTHAISUAT
      FROM SUAT_CHIEU sc
      WHERE sc.MASUAT = :masuat
    `;

    const checkResult = await connection.execute(checkQuery, { masuat });
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return { success: false, message: 'Suất chiếu không tồn tại.' };
    }

    const showtime = checkResult.rows[0];
    const suatId = showtime.MASUAT || showtime[0];
    const phongId = showtime.MAPHONG || showtime[2];
    const trangThaiSuat = showtime.TRANGTHAISUAT || showtime[3];

    if (trangThaiSuat !== 'Showing') {
      return { success: false, message: 'Suất chiếu không khả dụng để đặt vé.' };
    }

    // Bước 2: Lock ghế chống giành giật
    const seatIdList = seatIds.map((_, i) => `:seat${i}`).join(',');
    const seatParams = { maphong: phongId };
    seatIds.forEach((id, i) => {
      seatParams[`seat${i}`] = id;
    });

    const lockQuery = `
      SELECT MAGHE, MAPHONG, MALOAIGHE, VITRI
      FROM GHE_NGOI
      WHERE MAGHE IN (${seatIdList})
        AND MAPHONG = :maphong
      FOR UPDATE NOWAIT
    `;

    try {
      const lockResult = await connection.execute(lockQuery, seatParams);
      if (!lockResult.rows || lockResult.rows.length !== seatIds.length) {
        return { success: false, message: 'Một số ghế không tồn tại trong phòng.' };
      }

      // 🔥 BƯỚC 3 (ĐÃ FIX): TẠO GIAO DỊCH (PENDING) TRƯỚC ĐỂ THỎA MÃN KHÓA NGOẠI
      // Tạo mã GD ngẫu nhiên theo chuẩn (VD: GD_8943_123)
      const maGD = `GD_${Date.now().toString().slice(-4)}_${Math.floor(Math.random()*1000)}`;
      
      const insertGdQuery = `
        INSERT INTO GIAO_DICH (MAGD, THOIGIANTAO, TONGTIEN, TRANGTHAIGD)
        VALUES (:magd, CURRENT_TIMESTAMP, 0, 'Pending')
      `;
      await connection.execute(insertGdQuery, { magd: maGD });

      // BƯỚC 4: LƯU GHẾ VÀO DAT_CHO VỚI MÃ GIAO DỊCH VỪA TẠO
      const heldSeats = [];
      for (const seatId of seatIds) {
        const insertQuery = `
          INSERT INTO DAT_CHO (MASUAT, MAGHE, MAGD, THOIGIANGIU, GIUDEN, TRANGTHAICHO)
          VALUES (:masuat, :maghe, :magd, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15' MINUTE, 'Held')
        `;

        try {
          await connection.execute(insertQuery, {
            masuat: suatId,
            maghe: seatId,
            magd: maGD // Truyền mã giao dịch thật vào
          });
          heldSeats.push(seatId);
        } catch (err) {
          if (err.errorNum === 1 || (err.message && err.message.includes('ORA-00001'))) {
            console.log(`Ghế ${seatId} đã bị giữ trong bảng DAT_CHO.`);
          } else {
            throw err;
          }
        }
      }

      if (heldSeats.length === 0) {
        return { success: false, message: 'Không thể giữ ghế.' };
      }

      // Lưu tất cả thay đổi xuống Database
      await connection.commit();

      return {
        success: true,
        message: `Giữ ${heldSeats.length}/${seatIds.length} ghế thành công.`,
        data: { 
          masuat: suatId, 
          heldSeats,
          magd: maGD // Trả cái mã này lên Frontend để lát sang trang Checkout dùng
        }
      };
      
    } catch (lockError) {
      if (lockError.errorNum === 54 || (lockError.message && lockError.message.includes('ORA-00054'))) {
        return {
          success: false,
          message: 'Ghế bạn chọn vừa có người khác giữ. Vui lòng chọn ghế khác!',
          errorCode: 'ORA-00054',
        };
      }
      throw lockError;
    }
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (rbErr) {}
    }
    console.error('Lỗi holdSeats:', error);
    throw error; 
  } finally {
    if (connection) {
      try { await connection.close(); } catch (closeErr) {}
    }
  }
}

/**
 * Release held seats (used for cancellation or timeout)
 * @param {array} datIds - Array of DAT_CHO IDs to release
 * @returns {Promise<{success: boolean, released: number}>}
 */
export async function releaseHeldSeats(datIds) {
  try {
    if (!datIds || datIds.length === 0) {
      return { success: true, released: 0 };
    }

    const idList = datIds.map((_, i) => `:id${i}`).join(',');
    const params = {};
    datIds.forEach((id, i) => {
      params[`id${i}`] = id;
    });

    const query = `
      DELETE FROM DAT_CHO
      WHERE MADAT IN (${idList})
        AND TRANGTHAICHO = 'Held'
    `;

    // Note: This uses executeQuery which doesn't return row count directly
    // For now, we'll return success assuming all were released
    // TODO: Use connection.execute directly to get rowsAffected
    await executeQuery(query, datIds);

    return { success: true, released: datIds.length };
  } catch (error) {
    console.error('Lỗi releaseHeldSeats:', error);
    throw error;
  }
}

/**
 * Create transaction with tickets
 * @param {object} bookingData - {masuat, matk, seatIds, discount, paymentMethod, totalAmount}
 * @returns {Promise<{success: boolean, transactionId: string, ticketIds: array}>}
 */
export async function createTransaction(bookingData) {
  try {
    const {
      masuat,
      matk,
      seatIds,
      discount = 0,
      paymentMethod = 'Momo',
      totalAmount,
    } = bookingData;

    if (!masuat || !matk || !seatIds || seatIds.length === 0 || !totalAmount) {
      throw new Error('Thiếu thông tin booking bắt buộc.');
    }

    // TODO: Call stored procedures:
    // 1. SP_THEM_GIAO_DICH - Create GIAO_DICH record
    // 2. SP_THEM_VE - Create VE records for each seat
    // 3. SP_THEM_THANH_TOAN - Create THANH_TOAN record

    // For now, return success placeholder
    return {
      success: true,
      message: 'Tạo giao dịch thành công. (Chưa triển khai đầy đủ)',
      data: {
        transactionId: `TX${Date.now()}`,
        ticketIds: seatIds.map((s, i) => `VE${Date.now()}_${i}`),
        totalAmount,
        discount,
        finalAmount: totalAmount - discount,
      },
    };
  } catch (error) {
    console.error('Lỗi createTransaction:', error);
    throw error;
  }
}
