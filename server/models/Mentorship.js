const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  startDate: Date,
  endDate: Date,
  meetingFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed'],
    default: 'weekly'
  },
  meetingMethod: {
    type: String,
    enum: ['in-person', 'video-call', 'phone', 'text'],
    default: 'video-call'
  },
  goals: [{
    type: String,
    maxlength: 200
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
mentorshipSchema.index({ mentorId: 1, status: 1, createdAt: -1 });
mentorshipSchema.index({ menteeId: 1, status: 1, createdAt: -1 });
mentorshipSchema.index({ subject: 1, status: 1 });
mentorshipSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
