import express from 'express';
import { body, validationResult } from 'express-validator';  // ← add validationResult
import { register, login, getProfile, updateProfile, changePassword } from '../controller/authController.js';
import protect from '../middleware/auth.js';  // ← default import, no curly braces

const router = express.Router();

// ── VALIDATION MIDDLEWARE ──────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,  // return first error message
      statusCode: 400,
    });
  }
  next();
};

const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── PUBLIC ─────────────────────────────────────────────────
router.post('/register', registerValidation, handleValidation, register);
router.post('/login', loginValidation, handleValidation, login);

// ── PROTECTED ──────────────────────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;