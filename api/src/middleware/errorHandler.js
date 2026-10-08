export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: status >= 500 && !error.status ? "Unexpected server error" : error.message,
    },
  });
}
