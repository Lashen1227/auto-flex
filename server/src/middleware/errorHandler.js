function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Something went wrong";

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
}

module.exports = {
  notFound,
  errorHandler,
};
