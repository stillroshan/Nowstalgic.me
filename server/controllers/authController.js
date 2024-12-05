import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  generateToken,
  generateVerificationToken,
  generateResetToken,
} from '../utils/tokenUtils.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

// Register user
export const register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return res.status(400).json({
      message: 'User already exists',
    });
  }

  // Generate verification token
  const { token, expires } = generateVerificationToken();

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    verificationToken: token,
    verificationTokenExpires: expires,
  });

  // Generate JWT
  const jwt = generateToken(user._id);

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await sendVerificationEmail(user, verificationUrl);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Continue with registration even if email fails
  }

  res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
    token: jwt,
  });
});

// Login user
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
    token,
  });
});

// Google OAuth callback
export const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
};

// Verify email
export const verifyEmail = catchAsync(async (req, res) => {
  const user = await User.findOne({
    verificationToken: req.params.token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

// Forgot password
export const forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { token, expires } = generateResetToken();
  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendPasswordResetEmail(user, resetUrl);

  res.json({ message: 'Password reset email sent' });
});

// Reset password
export const resetPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

// Get current user
export const getCurrentUser = catchAsync(async (req, res) => {
  res.json(req.user);
}); 