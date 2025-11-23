/* eslint-disable no-unused-vars */
module.exports = (err, req, res, _next) => {
  console.error('Error:', err);

  if (res.headersSent) {
    return res.end();
  }

  // Validation errors (express-validator)
  if (err.name === 'ValidationError' || err.errors) {
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: Array.isArray(err.errors) ? err.errors : [err.message]
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate entry. This record already exists.'
    });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      status: 'error',
      message: 'Referenced record does not exist'
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  return res.status(status).json({
    status: 'error',
    message
  });
};

