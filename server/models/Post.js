const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  links: [{
    url: String,
    title: String,
    description: String,
    image: String
  }],
  type: {
    type: String,
    enum: ['text', 'image', 'link', 'file'],
    default: 'text'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  reposts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  repostsCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isMentorshipPost: {
    type: Boolean,
    default: false
  },
  mentorshipType: {
    type: String,
    enum: ['offer', 'request'],
    default: null
  },
  subject: {
    type: String,
    trim: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ isMentorshipPost: 1, createdAt: -1 });
postSchema.index({ groupId: 1, createdAt: -1 });

// Virtual for like status (will be populated by frontend)
postSchema.virtual('isLiked').get(function() {
  return false; // This will be set by the frontend based on current user
});

// Update counts when likes change
postSchema.pre('save', function(next) {
  this.likesCount = this.likes.length;
  this.repostsCount = this.reposts.length;
  next();
});

module.exports = mongoose.model('Post', postSchema);
