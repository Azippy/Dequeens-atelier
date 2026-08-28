const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(statusCode).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  // Mongoose CastError
  if (err.name === "CastError") {
    statusCode = 400;

    return res.status(statusCode).json({
      status: "fail",
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;

    const field = Object.keys(err.keyPattern)[0];

    return res.status(statusCode).json({
      status: "fail",
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  res.status(statusCode).json({
    status: err.status || "error",
    message,
  });
};

export default errorHandler;