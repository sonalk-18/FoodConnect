/* eslint-disable no-unused-vars */
module.exports = (err, req, res, _next) => {
  console.error(err);
  if (res.headersSent) {
    return res.end();
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({
    status: 'error',
    message
  });
};

