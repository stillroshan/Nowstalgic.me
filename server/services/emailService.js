import nodemailer from 'nodemailer';
import mailgun from 'nodemailer-mailgun-transport';

// At the top of the file, after imports
if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.EMAIL_FROM) {
  console.error('Missing required email configuration. Please check your .env file for MAILGUN_API_KEY, MAILGUN_DOMAIN, and EMAIL_FROM');
}

// Configure mailgun
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const transporter = nodemailer.createTransport(mailgun(auth));

export const sendVerificationEmail = async (user, verificationUrl) => {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM environment variable is not set');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify your Nowstalgic.me account',
    html: `
      <h1>Welcome to Nowstalgic.me!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Reset your Nowstalgic.me password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Error sending password reset email');
  }
};

export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Nowstalgic.me!',
    html: `
      <h1>Welcome to Nowstalgic.me!</h1>
      <p>Hi ${user.username},</p>
      <p>Thank you for joining Nowstalgic.me! We're excited to have you as part of our community.</p>
      <p>Start creating your timelines and sharing your memories today!</p>
      <p>Best regards,<br>The Nowstalgic.me Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Error sending welcome email');
  }
};

const sendEmailWithRetry = async (mailOptions, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}; 