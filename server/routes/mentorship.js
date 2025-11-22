const express = require('express');
const { body, validationResult } = require('express-validator');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/mentorship
// @desc    Get mentorship listings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      subject, 
      status, 
      university,
      role 
    } = req.query;
    
    const skip = (page - 1) * limit;
    let query = { isActive: true };

    // Apply filters
    if (type) query.type = type;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (status) query.status = status;
    if (university) query.university = { $regex: university, $options: 'i' };

    // If filtering by role, we need to populate and filter
    let mentorships;
    if (role) {
      mentorships = await Mentorship.find(query)
        .populate({
          path: 'mentorId',
          match: { role: role },
          select: 'firstName lastName profilePicture role university faculty'
        })
        .populate('menteeId', 'firstName lastName profilePicture role university faculty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Filter out mentorships where mentor doesn't match role
      mentorships = mentorships.filter(mentorship => mentorship.mentorId);
    } else {
      mentorships = await Mentorship.find(query)
        .populate('mentorId', 'firstName lastName profilePicture role university faculty')
        .populate('menteeId', 'firstName lastName profilePicture role university faculty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Mentorship.countDocuments(query);

    res.json({
      mentorships,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get mentorships error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentorship
// @desc    Create mentorship offer/request
// @access  Private
router.post('/', [
  auth,
  body('type').isIn(['offer', 'request']).withMessage('Type must be offer or request'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      type, 
      subject, 
      description, 
      meetingFrequency, 
      meetingMethod,
      goals 
    } = req.body;

    // For offers, the current user is the mentor
    // For requests, we need to find a mentor
    let mentorId, menteeId;
    
    if (type === 'offer') {
      mentorId = req.user._id;
      menteeId = null; // Will be set when someone accepts
    } else {
      menteeId = req.user._id;
      mentorId = null; // Will be set when a mentor accepts
    }

    const mentorship = new Mentorship({
      mentorId,
      menteeId,
      subject,
      description,
      meetingFrequency: meetingFrequency || 'weekly',
      meetingMethod: meetingMethod || 'video-call',
      goals: goals || [],
      status: type === 'offer' ? 'pending' : 'pending'
    });

    await mentorship.save();
    await mentorship.populate('mentorId', 'firstName lastName profilePicture role university faculty');
    await mentorship.populate('menteeId', 'firstName lastName profilePicture role university faculty');

    res.status(201).json({ mentorship });
  } catch (error) {
    console.error('Create mentorship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentorship/:id
// @desc    Get mentorship details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate('mentorId', 'firstName lastName profilePicture role university faculty bio')
      .populate('menteeId', 'firstName lastName profilePicture role university faculty bio');

    if (!mentorship || !mentorship.isActive) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    // Check if user is involved in this mentorship
    const isInvolved = mentorship.mentorId._id.toString() === req.user._id.toString() || 
                      mentorship.menteeId._id.toString() === req.user._id.toString();
    
    if (!isInvolved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this mentorship' });
    }

    res.json({ mentorship });
  } catch (error) {
    console.error('Get mentorship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/mentorship/:id/status
// @desc    Update mentorship status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'active', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, startDate, endDate } = req.body;

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship || !mentorship.isActive) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    // Check if user is involved in this mentorship
    const isInvolved = mentorship.mentorId.toString() === req.user._id.toString() || 
                      mentorship.menteeId.toString() === req.user._id.toString();
    
    if (!isInvolved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this mentorship' });
    }

    mentorship.status = status;
    if (startDate) mentorship.startDate = startDate;
    if (endDate) mentorship.endDate = endDate;

    // If accepting a mentorship, set the other party
    if (status === 'active' && !mentorship.mentorId) {
      mentorship.mentorId = req.user._id;
    } else if (status === 'active' && !mentorship.menteeId) {
      mentorship.menteeId = req.user._id;
    }

    await mentorship.save();
    await mentorship.populate('mentorId', 'firstName lastName profilePicture role university faculty');
    await mentorship.populate('menteeId', 'firstName lastName profilePicture role university faculty');

    res.json({ mentorship });
  } catch (error) {
    console.error('Update mentorship status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentorship/:id/notes
// @desc    Add note to mentorship
// @access  Private
router.post('/:id/notes', [
  auth,
  body('content').notEmpty().withMessage('Note content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship || !mentorship.isActive) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    // Check if user is involved in this mentorship
    const isInvolved = mentorship.mentorId.toString() === req.user._id.toString() || 
                      mentorship.menteeId.toString() === req.user._id.toString();
    
    if (!isInvolved) {
      return res.status(403).json({ message: 'Not authorized to add notes to this mentorship' });
    }

    mentorship.notes.push({
      content,
      addedBy: req.user._id
    });

    await mentorship.save();

    res.json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Add mentorship note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentorship/:id/rating
// @desc    Rate mentorship
// @access  Private
router.post('/:id/rating', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, feedback } = req.body;

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship || !mentorship.isActive) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    // Check if user is involved in this mentorship
    const isInvolved = mentorship.mentorId.toString() === req.user._id.toString() || 
                      mentorship.menteeId.toString() === req.user._id.toString();
    
    if (!isInvolved) {
      return res.status(403).json({ message: 'Not authorized to rate this mentorship' });
    }

    // Only allow rating completed mentorships
    if (mentorship.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed mentorships' });
    }

    mentorship.rating = rating;
    if (feedback) mentorship.feedback = feedback;

    await mentorship.save();

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rate mentorship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
