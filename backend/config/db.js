import oracledb from 'oracledb';

let pool;

const poolConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
  poolMax: Number(process.env.ORACLE_POOL_MAX || 10),
  poolIncrement: Number(process.env.ORACLE_POOL_INCREMENT || 1),
  poolAlias: 'cinemoon',
};

export async function initPool() {
  if (pool) {
    return pool;
  }

  if (!poolConfig.user || !poolConfig.password || !poolConfig.connectString) {
    throw new Error('Missing Oracle environment variables: ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING');
  }

  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  pool = await oracledb.createPool(poolConfig);
  return pool;
}

export async function getConnection() {
  await initPool();
  return oracledb.getConnection('cinemoon');
}

export async function closePool() {
  if (!pool) {
    return;
  }

  await pool.close(0);
  pool = undefined;
}

export function getOracle() {
  return oracledb;
}