const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        // In development, accept any email for testing
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        
        // In production, validate educational domains
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
        return educationalDomains.some(domain => 
          email.endsWith(domain) || emailDomain.includes(domain)
        ) || emailDomain.includes('edu') || emailDomain.includes('student') || emailDomain.includes('university');
      },
      message: 'Email must be from an educational institution domain'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  university: {
    type: String,
    required: true,
    trim: true
  },
  faculty: {
    type: String,
    trim: true
  },
  major: {
    type: String,
    trim: true
  },
  group: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  socialLinks: [{
    platform: String,
    url: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);
