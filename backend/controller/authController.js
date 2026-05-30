import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();


// ── GENERATE TOKEN ────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "25d",
  });
};

// ── REGISTER ──────────────────────────────────────────────
export const register = async (req, res, next) => {
  console.log("register called, next type:", typeof next); 
  try {
    const { username, email, password, leetcodeUsername } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
        statusCode: 400,
      });
    }

    // Username length check
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        error: "Username must be between 3 and 30 characters",
        statusCode: 400,
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
        statusCode: 400,
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          userExists.email === email
            ? "Email already registered"
            : "Username already taken",
        statusCode: 400,
      });
    }

    // Check if leetcodeUsername is already linked to another account
    if (leetcodeUsername) {
      const lcExists = await User.findOne({ leetcodeUsername });

      if (lcExists) {
        return res.status(400).json({
          success: false,
          error: "This LeetCode username is already linked to another account",
          statusCode: 400,
        });
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      leetcodeUsername: leetcodeUsername || null,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          leetcodeUsername: user.leetcodeUsername,
          dailyGoal: user.dailyGoal,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ── LOGIN ─────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Please contact support.",
        statusCode: 403,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          leetcodeUsername: user.leetcodeUsername,
          dailyGoal: user.dailyGoal,
          stats: user.stats,
          role: user.role,
        },
        token,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ── GET PROFILE ───────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        leetcodeUsername: user.leetcodeUsername,
        dailyGoal: user.dailyGoal,
        stats: user.stats,
        role: user.role,
        needsStatsRefresh: user.needsStatsRefresh(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage, leetcodeUsername, dailyGoal } =
      req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    // If changing username, check it's not taken
    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username });

      if (usernameTaken) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
          statusCode: 400,
        });
      }

      user.username = username;
    }

    // If changing email, check it's not taken
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });

      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: "Email already registered",
          statusCode: 400,
        });
      }

      user.email = email;
    }

    // Handle LeetCode username updates
    if (leetcodeUsername !== undefined) {
      // Remove LeetCode username
      if (leetcodeUsername === "") {
        user.leetcodeUsername = null;

        user.stats = {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalSubmissions: 0,
          acceptanceRate: 0,
          ranking: 0,
          contributionPoints: 0,
          streak: 0,
          maxStreak: 0,
          lastFetched: null,
          topicBreakdown: [],
        };
      }

      // Change LeetCode username
      else if (leetcodeUsername !== user.leetcodeUsername) {
        const lcTaken = await User.findOne({
          leetcodeUsername,
          _id: { $ne: user._id },
        });

        if (lcTaken) {
          return res.status(400).json({
            success: false,
            error:
              "This LeetCode username is already linked to another account",
            statusCode: 400,
          });
        }

        user.leetcodeUsername = leetcodeUsername;

        // Reset cached stats
        user.stats = {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalSubmissions: 0,
          acceptanceRate: 0,
          ranking: 0,
          contributionPoints: 0,
          streak: 0,
          maxStreak: 0,
          lastFetched: null,
          topicBreakdown: [],
        };
      }
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    // Validate dailyGoal range before saving
    if (dailyGoal !== undefined) {
      if (dailyGoal < 1 || dailyGoal > 50) {
        return res.status(400).json({
          success: false,
          error: "Daily goal must be between 1 and 50",
          statusCode: 400,
        });
      }

      user.dailyGoal = dailyGoal;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        leetcodeUsername: user.leetcodeUsername,
        dailyGoal: user.dailyGoal,
        stats: user.stats,
        role: user.role,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
        statusCode: 400,
      });
    }

    // New password length check
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long",
        statusCode: 400,
      });
    }

    // Can't reuse the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: "New password cannot be the same as current password",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
        statusCode: 401,
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ── DEACTIVATE ACCOUNT ────────────────────────────────────
export const deactivateAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Please provide your password to deactivate your account",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        statusCode: 404,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Incorrect password",
        statusCode: 401,
      });
    }

    user.isActive = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};