const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/groups
// @desc    Get all groups
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, university, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (category) query.category = category;
    if (university) query.university = { $regex: university, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .populate('creatorId', 'firstName lastName profilePicture')
      .populate('members', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add member count and check if user is member
    const groupsWithDetails = groups.map(group => {
      const groupObj = group.toObject();
      groupObj.memberCount = group.members.length;
      groupObj.isMember = group.members.some(member => 
        member._id.toString() === req.user._id.toString()
      );
      return groupObj;
    });

    const total = await Group.countDocuments(query);

    res.json({
      groups: groupsWithDetails,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups
// @desc    Create group
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['academic', 'social', 'mentorship', 'study', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, isPrivate, university, faculty } = req.body;

    const group = new Group({
      name,
      description,
      category,
      creatorId: req.user._id,
      members: [req.user._id],
      admins: [req.user._id],
      isPrivate: isPrivate || false,
      university: university || req.user.university,
      faculty: faculty || req.user.faculty
    });

    // Generate invite code for private groups
    if (isPrivate) {
      group.generateInviteCode();
    }

    await group.save();
    await group.populate('creatorId', 'firstName lastName profilePicture');
    await group.populate('members', 'firstName lastName profilePicture');

    res.status(201).json({ group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/groups/:id
// @desc    Get group details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creatorId', 'firstName lastName profilePicture')
      .populate('members', 'firstName lastName profilePicture')
      .populate('admins', 'firstName lastName profilePicture');

    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupObj = group.toObject();
    groupObj.memberCount = group.members.length;
    groupObj.isMember = group.members.some(member => 
      member._id.toString() === req.user._id.toString()
    );
    groupObj.isAdmin = group.admins.some(admin => 
      admin._id.toString() === req.user._id.toString()
    );

    res.json({ group: groupObj });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Group name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const group = await Group.findById(req.params.id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin or creator
    const isAdmin = group.admins.includes(req.user._id) || group.creatorId.toString() === req.user._id.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const { name, description, category, isPrivate } = req.body;
    
    if (name) group.name = name;
    if (description) group.description = description;
    if (category) group.category = category;
    if (isPrivate !== undefined) {
      group.isPrivate = isPrivate;
      if (isPrivate && !group.inviteCode) {
        group.generateInviteCode();
      }
    }

    await group.save();
    await group.populate('creatorId', 'firstName lastName profilePicture');
    await group.populate('members', 'firstName lastName profilePicture');

    res.json({ group });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/join
// @desc    Join group
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // For private groups, check invite code
    if (group.isPrivate) {
      const { inviteCode } = req.body;
      if (!inviteCode || inviteCode !== group.inviteCode) {
        return res.status(400).json({ message: 'Invalid invite code' });
      }
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: 'Successfully joined group' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/leave
// @desc    Leave group
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }

    // Remove from members and admins
    group.members.pull(req.user._id);
    group.admins.pull(req.user._id);

    // If creator leaves, make the first admin the new creator
    if (group.creatorId.toString() === req.user._id.toString() && group.admins.length > 0) {
      group.creatorId = group.admins[0];
    }

    await group.save();

    res.json({ message: 'Successfully left group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/groups/:id/posts
// @desc    Get group posts
// @access  Private
router.get('/:id/posts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const group = await Group.findById(req.params.id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const posts = await Post.find({ 
      groupId: req.params.id,
      isDeleted: false 
    })
    .populate('userId', 'firstName lastName profilePicture role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Add like status for current user
    const postsWithLikes = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.includes(req.user._id);
      return postObj;
    });

    const total = await Post.countDocuments({ 
      groupId: req.params.id,
      isDeleted: false 
    });

    res.json({
      posts: postsWithLikes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get group posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
