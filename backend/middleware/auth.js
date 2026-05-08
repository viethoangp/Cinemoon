import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cinemoon-secret-key-2026';

export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Thiếu hoặc sai định dạng token.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { MATK, TENDANGNHAP, QUYENTRUYCAP, ... }
    next();
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message);
    res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

export function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAdmin(req, res, next) {
  if (req.user?.QUYENTRUYCAP !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền truy cập.' });
  }
  next();
}
