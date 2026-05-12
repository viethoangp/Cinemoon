import { getConnection, getOracle } from '../config/db.js';

/**
 * Gọi một Stored Procedure với OUT parameters
 * @param {string} spName - Tên SP (VD: SP_THEM_LOAI_GHE)
 * @param {object} params - Object chứa tất cả parameters (IN và OUT)
 *   VD: { p_TENLOAI: 'Standard', p_KetQua: { dir: 1 }, p_Loi: { dir: 1 } }
 * @returns {Promise<{success: number, message: string, outParams: object}>}
 */
export async function callStoredProcedure(spName, params) {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();

    // Xây dựng chuỗi PL/SQL gọi SP
    const paramNames = Object.keys(params);
    const paramPlaceholders = paramNames.map(p => `:${p}`).join(', ');
    const plSql = `BEGIN ${spName}(${paramPlaceholders}); END;`;

    // Chuẩn bị bindParams cho execute
    const bindParams = {};
    paramNames.forEach(key => {
      const value = params[key];
      if (value && typeof value === 'object' && value.dir) {
        // OUT parameter - don't specify type, let Oracle infer it
        bindParams[key] = {
          dir: value.dir === 1 ? oracledb.BIND_OUT : oracledb.BIND_IN,
          maxSize: value.maxSize || 4000,
        };
      } else {
        // IN parameter
        bindParams[key] = value;
      }
    });

    const result = await connection.execute(plSql, bindParams);

    // Trích OUT parameters từ result.outBinds
    const outParams = result.outBinds || {};

    return {
      success: outParams.p_KetQua || 0,
      message: outParams.p_Loi || null,
      outParams: outParams,
    };
  } catch (error) {
    console.error(`Lỗi khi gọi SP ${spName}:`, error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Lỗi khi đóng kết nối:', err);
      }
    }
  }
}

/**
 * Gọi một Stored Procedure với SELECT result (nếu SP có CURSOR OUT)
 * @param {string} spName - Tên SP
 * @param {object} params - Object chứa parameters
 * @returns {Promise<array>} Mảng kết quả từ CURSOR
 */
export async function callStoredProcedureWithCursor(spName, params) {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();

    const paramNames = Object.keys(params);
    const paramPlaceholders = paramNames.map(p => `:${p}`).join(', ');
    const plSql = `BEGIN ${spName}(${paramPlaceholders}); END;`;

    const bindParams = {};
    paramNames.forEach(key => {
      bindParams[key] = params[key];
    });

    const result = await connection.execute(plSql, bindParams);
    return result.outBinds?.cursor || [];
  } catch (error) {
    console.error(`Lỗi khi gọi SP ${spName} với CURSOR:`, error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Lỗi khi đóng kết nối:', err);
      }
    }
  }
}

/**
 * Thực thi query SELECT thường
 * @param {string} query - SQL query
 * @param {array} params - Parameters nếu có
 * @returns {Promise<array>} Mảng kết quả
 */
export async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(query, params);
    return result.rows || [];
  } catch (error) {
    console.error('Lỗi khi thực thi query:', error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Lỗi khi đóng kết nối:', err);
      }
    }
  }
}
