import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // 🔥 Debug (remove in production)
      console.log("TOKEN:", token);
      console.log("JWT_SECRET (VERIFY):", process.env.JWT_SECRET);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user (exclude password)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      // Attach user to request
      req.user = user;

      return next();
    }

    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
    });

  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired, please login again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token (signature failed)",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Not authorized",
    });
  }
};

export default protect;