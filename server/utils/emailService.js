import mg from '../config/mailgun.js';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Nowstalgic.me <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
      html,
    });
    return response;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

export const sendVerificationEmail = async (user, verificationUrl) => {
  const html = `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Email Verification - Nowstalgic.me',
    text: `Please verify your email by clicking: ${verificationUrl}`,
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <h1>Reset Your Password</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset - Nowstalgic.me',
    text: `Reset your password by clicking: ${resetUrl}`,
    html,
  });
}; 