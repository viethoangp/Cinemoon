import { getConnection } from '../config/db.js';

export async function getMovies(req, res) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT MAPHIM AS "movieId", TENPHIM AS "title", THELOAI AS "genre", THOILUONG AS "duration", GIOIHANTUOI AS "ageLimit", TRANGTHAI AS "status"
       FROM PHIM
       ORDER BY NGAYPHATHANH DESC NULLS LAST, TENPHIM`
    );

    return res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function getShowtimes(req, res) {
  let connection;
  try {
    const { movieId, date } = req.query;
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT MASUAT AS "showtimeId", MAPHIM AS "movieId", MAPHONG AS "screenId", NGAYCHIEU AS "showDate", GIOBATDAU AS "startTime", GIOKETTHUC AS "endTime", TRANGTHAISUAT AS "status"
       FROM SUAT_CHIEU
       WHERE (:movieId IS NULL OR MAPHIM = :movieId)
         AND (:date IS NULL OR TRUNC(NGAYCHIEU) = TO_DATE(:date, 'YYYY-MM-DD'))
       ORDER BY GIOBATDAU`,
      { movieId: movieId || null, date: date || null }
    );

    return res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function getSeats(req, res) {
  let connection;
  try {
    const { showtimeId } = req.query;
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT g.MAGHE AS "seatId", g.MAPHONG AS "screenId", g.VITRI AS "position", lg.TENLOAI AS "seatType"
       FROM GHE_NGOI g
       LEFT JOIN LOAI_GHE lg ON lg.MALOAIGHE = g.MALOAIGHE
       WHERE (:showtimeId IS NULL OR g.MAPHONG IN (
         SELECT MAPHONG FROM SUAT_CHIEU WHERE MASUAT = :showtimeId
       ))
       ORDER BY g.VITRI`,
      { showtimeId: showtimeId || null }
    );

    return res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}