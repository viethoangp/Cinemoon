import { generateToken } from '../middleware/auth.js';
import { authenticateUser, registerNewUser, isUsernameAvailable } from '../services/authService.js';
import { getConnection } from '../config/db.js';
export async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password.' });
    }

    // Authenticate user
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Username hoặc password không chính xác.' });
    }

    // Check account status
    if (user.TRANGTHAITAIKHOAN === 'Locked') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa.' });
    }

    // Generate JWT token
    const token = generateToken({
      MATK: user.MATK,
      TENDANGNHAP: user.TENDANGNHAP,
      QUYENTRUYCAP: user.QUYENTRUYCAP,
    });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        token,
        user: {
          MATK: user.MATK,
          TENDANGNHAP: user.TENDANGNHAP,
          QUYENTRUYCAP: user.QUYENTRUYCAP,
        }
      }
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
}

export async function register(req, res) {
  try {
    const { username, password, fullName, phone, email, gioitinh, ngaysinh } = req.body || {};
    if (!username || !password || !fullName || !phone) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký bắt buộc.' });
    }

    // Check username availability
    const available = await isUsernameAvailable(username);
    if (!available) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
    }

    // Register new user
    const result = await registerNewUser({
      username,
      password,
      fullName,
      phone,
      email,
      gioitinh,
      ngaysinh,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.',
      data: result.user,
    });
  } catch (error) {
    console.error('Lỗi register:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
}
export async function getUserProfile(req, res) {
  let connection;
  try {
    const matk = req.user.MATK;
    connection = await getConnection();

    // 1. ÁP DỤNG LỖI 2: Đổi tên cột (Alias) cho khớp với sự "ngớ ngẩn" của Frontend
    const userResult = await connection.execute(
      `SELECT kh.MATK, tk.TENDANGNHAP, kh.HOTEN, kh.EMAIL, 
              kh.SDT as SODIENTHOAI, kh.DIEMTICHLUY as DIEMTICHLU, 
              tk.QUYENTRUYCAP, tk.THOIGIANTAO as NGAYTAOTK
       FROM KHACH_HANG kh
       JOIN TAI_KHOAN tk ON kh.MATK = tk.MATK
       WHERE kh.MATK = :matk`,
      { matk }
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin.' });
    }

    // 2. GIỮ NGUYÊN LOGIC CŨ BẢO VỆ DATABASE (Chặn mưu đồ Lỗi 1 của Copilot)
    const ticketsResult = await connection.execute(
      `SELECT 
          MAX(v.MAVE) as MAVE, 
          p.TENPHIM, 
          r.TENRAP, 
          ph.MAPHONG as PHONG,
          sc.NGAYCHIEU, 
          TO_CHAR(sc.GIOBATDAU, 'HH24:MI') as GIOBATDAU, 
          LISTAGG(gn.VITRI, ', ') WITHIN GROUP (ORDER BY gn.VITRI) as DANHSACHGHENGOI,
          gd.TONGTIEN, 
          MAX(tt.PHUONGTHUC) as PHUONGTHUCTHANHTOAN,
          gd.THOIGIANTAO as THOIGIAN,
          gd.TRANGTHAIGD,
          MAX(v.TRANGTHAIVE) as TRANGTHAIVE
       FROM GIAO_DICH gd
       JOIN VE v ON gd.MAGD = v.MAGD
       JOIN SUAT_CHIEU sc ON v.MASUAT = sc.MASUAT
       JOIN PHIM p ON sc.MAPHIM = p.MAPHIM
       JOIN PHONG_CHIEU ph ON sc.MAPHONG = ph.MAPHONG
       JOIN RAP r ON ph.MARAP = r.MARAP
       JOIN GHE_NGOI gn ON v.MAGHE = gn.MAGHE
       LEFT JOIN THANH_TOAN tt ON gd.MAGD = tt.MAGD
       WHERE gd.MAKH = (SELECT MAKH FROM KHACH_HANG WHERE MATK = :matk)
         AND gd.TRANGTHAIGD = 'Paid'
       GROUP BY gd.MAGD, p.TENPHIM, r.TENRAP, ph.MAPHONG, sc.NGAYCHIEU, sc.GIOBATDAU, 
                gd.TONGTIEN, gd.THOIGIANTAO, gd.TRANGTHAIGD
       ORDER BY gd.THOIGIANTAO DESC`,
      { matk }
    );

    // 3. ÁP DỤNG LỖI 3: Trải phẳng (Spread) Object để Frontend đọc được
    res.status(200).json({
      success: true,
      data: {
        ...userResult.rows[0], // Bỏ cái bọc "user:" đi, bung trực tiếp ra
        tickets: ticketsResult.rows || []
      }
    });

  } catch (error) {
    console.error('Lỗi getUserProfile:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin profile.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}