import { generateToken } from '../middleware/auth.js';
import { authenticateUser, registerNewUser, isUsernameAvailable } from '../services/authService.js';

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