import { getConnection, getOracle } from '../config/db.js';

function mapOracleError(error) {
  if (error?.errorNum === 54 || error?.errorNum === '54' || error?.message?.includes('ORA-00054')) {
    return { status: 409, body: { message: 'Ghế đang có người giao dịch, vui lòng chọn ghế khác.' } };
  }

  return null;
}

export async function holdSeat(req, res) {
  let connection;
  try {
    const { bookingId, showtimeId, seatId } = req.body ?? {};
    if (!bookingId || !showtimeId || !seatId) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId, showtimeId hoặc seatId.' });
    }

    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN
         :p_KetQua := 1;
         :p_Loi := NULL;
       END;`,
      {
        p_KetQua: { dir: getOracle().BIND_OUT, type: getOracle().NUMBER },
        p_Loi: { dir: getOracle().BIND_OUT, type: getOracle().STRING, maxSize: 4000 },
      }
    );

    return res.json({ success: true, data: result.outBinds });
  } catch (error) {
    const mapped = mapOracleError(error);
    if (mapped) {
      return res.status(mapped.status).json(mapped.body);
    }

    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function applyVoucher(req, res) {
  let connection;
  try {
    const { bookingId, voucherId } = req.body ?? {};
    if (!bookingId || !voucherId) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId hoặc voucherId.' });
    }

    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN
         :p_TienGiam := 0;
         :p_Loi := 'Voucher API scaffolding ready.';
       END;`,
      {
        p_TienGiam: { dir: getOracle().BIND_OUT, type: getOracle().NUMBER },
        p_Loi: { dir: getOracle().BIND_OUT, type: getOracle().STRING, maxSize: 4000 },
      }
    );

    return res.json({ success: true, data: result.outBinds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function checkout(req, res) {
  let connection;
  try {
    const { bookingId, paymentMethod, amount } = req.body ?? {};
    if (!bookingId || !paymentMethod || amount == null) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId, paymentMethod hoặc amount.' });
    }

    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN
         :p_KetQua := 1;
         :p_ThongBao := 'Checkout API scaffolding ready.';
       END;`,
      {
        p_KetQua: { dir: getOracle().BIND_OUT, type: getOracle().NUMBER },
        p_ThongBao: { dir: getOracle().BIND_OUT, type: getOracle().STRING, maxSize: 4000 },
      }
    );

    return res.json({ success: true, data: result.outBinds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function cancelBooking(req, res) {
  let connection;
  try {
    const { bookingId, cancelledBy } = req.body ?? {};
    if (!bookingId || !cancelledBy) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId hoặc cancelledBy.' });
    }

    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN
         :p_KetQua := 1;
         :p_ThongBao := 'Cancel booking API scaffolding ready.';
       END;`,
      {
        p_KetQua: { dir: getOracle().BIND_OUT, type: getOracle().NUMBER },
        p_ThongBao: { dir: getOracle().BIND_OUT, type: getOracle().STRING, maxSize: 4000 },
      }
    );

    return res.json({ success: true, data: result.outBinds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}