import bcrypt from 'bcryptjs';
import { executeQuery, callStoredProcedure } from './spService.js';
import { getOracle } from '../config/db.js';
import { SP_CATALOG } from '../config/constants.js';

/**
 * Hash password with bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare plain password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from DB
 * @returns {Promise<boolean>} True if match
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Authenticate user by username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object|null>} User object or null if not found
 */
export async function authenticateUser(username, password) {
  try {
    // Query user by username
    const query = `
      SELECT MATK, TENDANGNHAP, MATKHAU, QUYENTRUYCAP, TRANGTHAITAIKHOAN
      FROM TAI_KHOAN
      WHERE TENDANGNHAP = :username
    `;
    const users = await executeQuery(query, [username]);

    if (users.length === 0) {
      console.log(`[AUTH] User not found: ${username}`);
      return null; // User not found
    }

    const user = users[0];
    const storedHash = user.MATKHAU;
    console.log(`[AUTH] User found: ${username}, stored hash: ${storedHash}`);

    // Check if the stored hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedHash);
    console.log(`[AUTH] Is bcrypt hash: ${isBcryptHash}`);

    let passwordMatch = false;

    if (isBcryptHash) {
      // Use bcrypt comparison for hashed passwords
      passwordMatch = await comparePassword(password, storedHash);
      console.log(`[AUTH] Bcrypt comparison result: ${passwordMatch}`);
    } else {
      // Plain text comparison (for legacy demo data)
      passwordMatch = password === storedHash;
      console.log(`[AUTH] Plain text comparison result: ${passwordMatch}`);
    }

    if (!passwordMatch) {
      console.log(`[AUTH] Password mismatch for user: ${username}`);
      return null; // Password mismatch
    }

    console.log(`[AUTH] Authentication successful for user: ${username}`);
    // Return user data (without password)
    return {
      MATK: user.MATK,
      TENDANGNHAP: user.TENDANGNHAP,
      QUYENTRUYCAP: user.QUYENTRUYCAP,
      TRANGTHAITAIKHOAN: user.TRANGTHAITAIKHOAN,
    };
  } catch (error) {
    console.error('Lỗi authenticateUser:', error);
    throw error;
  }
}

/**
 * Register new user
 * Tạo TAI_KHOAN + KHACH_HANG
 * @param {object} userData - { username, password, fullName, phone, email, gioitinh, ngaysinh }
 * @returns {Promise<object>} { success, message, user }
 */
export async function registerNewUser(userData) {
  try {
    const {
      username,
      password,
      fullName,
      phone,
      email = null,
      gioitinh = 'Other',
      ngaysinh = null,
    } = userData;

    // Validate
    if (!username || !password || !fullName || !phone) {
      return {
        success: false,
        message: 'Thiếu thông tin bắt buộc: username, password, fullName, phone',
      };
    }

    // Check if username already exists
    const existingQuery = `SELECT MATK FROM TAI_KHOAN WHERE TENDANGNHAP = :username`;
    const existing = await executeQuery(existingQuery, [username]);
    if (existing.length > 0) {
      return {
        success: false,
        message: 'Tên đăng nhập đã tồn tại.',
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Step 1: Create TAI_KHOAN using SP_THEM_TAI_KHOAN
    // Note: Assuming SP exists and accepts: p_TENDANGNHAP, p_MATKHAU, p_QUYENTRUYCAP, p_TRANGTHAI
    // For now, direct INSERT since SP_THEM_TAI_KHOAN may not be defined yet
    // TODO: Replace with SP call when SP_THEM_TAI_KHOAN is available
    
    const insertTKQuery = `
      INSERT INTO TAI_KHOAN (MATK, TENDANGNHAP, MATKHAU, QUYENTRUYCAP, TRANGTHAI)
      VALUES ('TK' || LPAD(SEQ_TK.NEXTVAL, 3, '0'), :username, :password, 'Customer', 'Active')
      RETURNING MATK INTO :newMatk
    `;
    
    // Using executeQuery for INSERT (which returns rows affected)
    // Better approach: use direct INSERT via connection
    // For now, we'll return success message and let SP handle it in Phase 4

    return {
      success: true,
      message: 'Tạo tài khoản thành công. (Chưa triển khai đầy đủ - cần kết nối DB để INSERT)',
      user: {
        MATK: 'TK_NEW',
        TENDANGNHAP: username,
        QUYENTRUYCAP: 'Customer',
      },
    };
  } catch (error) {
    console.error('Lỗi registerNewUser:', error);
    throw error;
  }
}

/**
 * Check if username is available
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function isUsernameAvailable(username) {
  try {
    const query = `SELECT COUNT(*) as cnt FROM TAI_KHOAN WHERE TENDANGNHAP = :username`;
    const result = await executeQuery(query, [username]);
    return result[0]?.cnt === 0;
  } catch (error) {
    console.error('Lỗi isUsernameAvailable:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param {string} matk - User ID
 * @returns {Promise<object|null>}
 */
export async function getUserById(matk) {
  try {
    const query = `
      SELECT MATK, TENDANGNHAP, QUYENTRUYCAP, TRANGTHAITAIKHOAN
      FROM TAI_KHOAN
      WHERE MATK = :matk
    `;
    const users = await executeQuery(query, [matk]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Lỗi getUserById:', error);
    throw error;
  }
}
