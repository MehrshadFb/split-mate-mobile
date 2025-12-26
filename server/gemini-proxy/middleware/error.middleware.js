const config = require('../config');
const { ValidationError, sanitizeError } = require('../utils/validators');

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function errorHandler(error, req, res, next) {
  console.error('Error:', {
    message: error.message,
    code: error.code,
    stack: config.server.environment === 'development' ? error.stack : undefined,
  });

  let statusCode = error.status || 500;
  if (error instanceof ValidationError) {
    statusCode = 400;
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
  }

  const sanitized = sanitizeError(error);
  res.status(statusCode).json({
    success: false,
    error: sanitized,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
