// Standardized response helpers
exports.success = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    status: 'success',
    message
  };
  if (data !== null) {
    if (Array.isArray(data) || typeof data === 'object') {
      // If data is an object/array, spread it or wrap it
      if (Array.isArray(data)) {
        response.data = data;
      } else {
        Object.assign(response, data);
      }
    } else {
      response.data = data;
    }
  }
  return res.status(statusCode).json(response);
};

exports.error = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = {
    status: 'error',
    message
  };
  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }
  return res.status(statusCode).json(response);
};

