export function errorHandler(err, req, res, next) {
  console.error('Lỗi:', err);

  const status = err.status || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
