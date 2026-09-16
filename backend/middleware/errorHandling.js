const errorHandler = (err, req, res, next) => {
  // 1. Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // 2. Mongoose Cast Error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Resource not found";
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field} field, please choose another value`;
    statusCode = 400;
  }
  // 4. Mongoose Validation Error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // 5. Multer File Size Error
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size exceeds the maximum limit of 10MB";
    statusCode = 400;
  }

  // 6. JWT Invalid Token
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token, please login again";
    statusCode = 401;
  }

  // 7. JWT Expired Token
  if (err.name === "TokenExpiredError") {
    message = "Your token has expired, please login again";
    statusCode = 401;
  }

  // 8. Log error (development only)
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // 9. Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
