const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');


const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }

  // 1. Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    // Intentionally vague to prevent email enumeration attacks
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // 2. Generate the reset token (unhashed for the URL, hashed in DB)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Build the reset URL using FRONTEND_URL (works with ngrok)
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const htmlMessage = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; padding: 32px; border: 1px solid #e5e5e5; border-radius: 12px;">
      <h2 style="color: #141414; margin-bottom: 8px;">🔑 Password Reset</h2>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        Hi <strong>${user.profile?.name || 'there'}</strong>,
      </p>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        You requested to reset your password for <strong>Poshan Sathi</strong>. Click the button below to set a new password:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetURL}" style="background-color: #141414; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #888; font-size: 13px; line-height: 1.5;">
        This link expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email — your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px;">Poshan Sathi — Your Nepali Nutrition & Budget Tracker</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Poshan Sathi — Password Reset (valid for 10 min)',
      html: htmlMessage,
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    // If email fails, clean up the token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

/**
 * @desc    Reset password using token
 * @route   PATCH /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // 1. Hash the incoming token to compare with DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2. Find user by hashed token AND check expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired. Please request a new reset link.', 400));
  }

  // 3. Update password and clear reset fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // This triggers the pre-save bcrypt hash

  // 4. Send success (don't auto-login — let user go to login page)
  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. You can now log in with your new password.',
  });
});

module.exports = { forgotPassword, resetPassword };
