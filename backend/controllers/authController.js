import { getConnection, getOracle } from '../config/db.js';

function buildResponse(result, fallbackMessage) {
  const out = result?.outBinds || {};
  const success = out.p_KetQua === 1 || out.p_KetQua === '1';

  return {
    success,
    message: out.p_ThongBao || fallbackMessage,
    data: out,
  };
}

export async function login(req, res) {
  let connection;
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password.' });
    }

    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN
         :p_KetQua := 1;
         :p_ThongBao := 'Login API scaffolding ready.';
       END;`,
      {
        p_KetQua: { dir: getOracle().BIND_OUT, type: getOracle().NUMBER },
        p_ThongBao: { dir: getOracle().BIND_OUT, type: getOracle().STRING, maxSize: 4000 },
      }
    );

    return res.status(200).json(buildResponse(result, 'Đăng nhập thành công.'));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function register(req, res) {
  let connection;
  try {
    const { username, password, fullName, phone } = req.body ?? {};
    if (!username || !password || !fullName || !phone) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký.' });
    }

    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN
         :p_KetQua := 1;
         :p_ThongBao := 'Register API scaffolding ready.';
       END;`,
      {
        p_KetQua: { dir: getOracle().BIND_OUT, type: getOracle().NUMBER },
        p_ThongBao: { dir: getOracle().BIND_OUT, type: getOracle().STRING, maxSize: 4000 },
      }
    );

    return res.status(200).json(buildResponse(result, 'Đăng ký thành công.'));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}