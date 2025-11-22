const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('university').notEmpty().withMessage('University is required'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, university, faculty, major, group, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate educational email (more flexible for development)
    const emailDomain = email.split('@')[1]?.toLowerCase() || '';
    const educationalDomains = [
      '.edu',
      '.edu.az',
      '.edu.tr',
      '.edu.au',
      '.edu.uk',
      '.ac.uk',
      '.edu.sg',
      '.edu.ca',
      '.edu.mx',
      '.edu.br',
      '.edu.ae',
      '.edu.sa',
      '.ac.za',
      '.edu.cn',
      '.edu.in',
      '.ac.jp',
      '.edu.pk',
      '.ac.ir',
      'edu.az',
      'aztu.edu.az',
      'student.aztu.edu.az'
    ];
    
    // Check if email ends with educational domain or contains edu in domain
    const isValidEducationalEmail = educationalDomains.some(domain => 
      email.endsWith(domain) || emailDomain.includes(domain)
    ) || emailDomain.includes('edu') || emailDomain.includes('student') || emailDomain.includes('university');
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Signup attempt with email:', email, 'Domain:', emailDomain);
    }
    
    if (!isValidEducationalEmail && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ message: 'Email must be from an educational institution domain' });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      university,
      faculty,
      major,
      group,
      role,
      emailVerificationToken: crypto.randomBytes(20).toString('hex'),
      // Auto-verify in development for easier testing
      verified: process.env.NODE_ENV === 'development'
    });

    await user.save();
    console.log('✅ User created successfully!');
    console.log('   📧 Email:', user.email);
    console.log('   👤 Name:', user.firstName, user.lastName);
    console.log('   🎓 University:', user.university);
    console.log('   ✅ Verified:', user.verified);
    console.log('   🆔 User ID:', user._id);

    // Send verification email (only if user is not already verified and in production)
    let emailSent = false;
    if (!user.verified && process.env.NODE_ENV === 'production') {
      try {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${user.emailVerificationToken}`;
        await sendEmail({
          to: user.email,
          subject: 'Verify your Esocial account',
          html: `
            <h2>Welcome to Esocial!</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
          `
        });
        emailSent = true;
        console.log('✅ Verification email sent to:', user.email);
      } catch (emailError) {
        console.error('⚠️  Email sending failed (account still created):', emailError.message);
        // Continue with registration even if email fails
      }
    } else if (user.verified && process.env.NODE_ENV === 'development') {
      console.log('ℹ️  Email verification skipped - account auto-verified in development mode');
      console.log('   📧 You can log in immediately with your email and password');
    }

    // Customize message based on verification status
    let message;
    if (user.verified && process.env.NODE_ENV === 'development') {
      message = '✅ Account created successfully! Your account is auto-verified in development mode. You can log in immediately with your email and password.';
    } else if (emailSent) {
      message = 'User registered successfully. Please check your email for verification.';
    } else if (user.verified) {
      message = 'User registered successfully! You can now log in.';
    } else {
      message = 'User registered successfully! Email verification is not configured. Please contact support.';
    }

    res.status(201).json({
      message,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ Login attempt failed: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (skip in development for testing)
    if (!user.verified && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }
    
    // Auto-verify in development
    if (!user.verified && process.env.NODE_ENV === 'development') {
      console.log('🔓 Auto-verifying user in development mode:', email);
      user.verified = true;
      await user.save();
    }
    
    console.log('✅ Login attempt for user:', email, 'Verified:', user.verified);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        university: user.university,
        profilePicture: user.profilePicture,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.verified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update offline status
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
