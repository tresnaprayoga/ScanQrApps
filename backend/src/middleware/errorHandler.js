class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

const errorHandler = (error, req, res, next) => {
  const isMalformedJson = error instanceof SyntaxError && error.status === 400 && 'body' in error;
  const statusCode = isMalformedJson ? 400 : (error.statusCode || 500);
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isMalformedJson
    ? 'Format JSON request tidak valid.'
    : (error.isOperational || !isProduction
    ? error.message
    : 'Terjadi kesalahan pada server.');

  if (statusCode >= 500) {
    console.error('Unhandled server error:', error);
  }

  const response = {
    error: {
      code: isMalformedJson ? 'INVALID_JSON' : (error.code || 'INTERNAL_SERVER_ERROR'),
      message
    }
  };
  if (error.details) response.error.details = error.details;

  res.status(statusCode).json(response);
};

module.exports = { AppError, errorHandler };