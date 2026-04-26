import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.js';
import { closePool, initPool } from './config/db.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Cinemoon API ready.' });
});

app.use('/api', apiRouter);

app.use((error, _req, res, _next) => {
  const status = error?.status || 500;
  res.status(status).json({ success: false, message: error?.message || 'Internal Server Error' });
});

async function start() {
  try {
    await initPool();
    app.listen(port, () => {
      console.log(`Cinemoon backend listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exitCode = 1;
  }
}

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

start();