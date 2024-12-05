import express from 'express';
import passport from 'passport';
import {
  registerRules,
  loginRules,
  resetPasswordRules,
  validate,
} from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again after 15 minutes'
});

// Auth routes
router.post('/register', registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
);

// Email verification route
router.get('/verify-email/:token', authController.verifyEmail);

// Password reset routes
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post(
  '/reset-password/:token',
  resetPasswordRules,
  validate,
  authController.resetPassword
);

// Get current user route
router.get('/me', protect, authController.getCurrentUser);

export default router; 