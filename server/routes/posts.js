const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      role, 
      mentorship, 
      groupId,
      userId 
    } = req.query;
    
    const skip = (page - 1) * limit;
    let query = { isDeleted: false };

    // Apply filters
    if (type) query.type = type;
    if (mentorship === 'true') query.isMentorshipPost = true;
    if (groupId) query.groupId = groupId;
    if (userId) query.userId = userId;

    // If filtering by role, we need to populate and filter
    let posts;
    if (role) {
      posts = await Post.find(query)
        .populate({
          path: 'userId',
          match: { role: role },
          select: 'firstName lastName profilePicture role'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Filter out posts where user doesn't match role
      posts = posts.filter(post => post.userId);
    } else {
      posts = await Post.find(query)
        .populate('userId', 'firstName lastName profilePicture role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Add like status for current user
    posts = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.includes(req.user._id);
      return postObj;
    });

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', [
  auth,
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['text', 'image', 'link', 'file']).withMessage('Invalid post type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      content, 
      images, 
      attachments, 
      links, 
      type, 
      isMentorshipPost, 
      mentorshipType, 
      subject,
      groupId 
    } = req.body;

    const post = new Post({
      userId: req.user._id,
      content,
      images: images || [],
      attachments: attachments || [],
      links: links || [],
      type,
      isMentorshipPost: isMentorshipPost || false,
      mentorshipType,
      subject,
      groupId
    });

    await post.save();
    await post.populate('userId', 'firstName lastName profilePicture role');

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'firstName lastName profilePicture role')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture'
        }
      });

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postObj = post.toObject();
    postObj.isLiked = post.likes.includes(req.user._id);

    res.json({ post: postObj });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', [
  auth,
  body('content').optional().notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { content, images, attachments, links } = req.body;
    
    if (content) post.content = content;
    if (images) post.images = images;
    if (attachments) post.attachments = attachments;
    if (links) post.links = links;

    await post.save();
    await post.populate('userId', 'firstName lastName profilePicture role');

    res.json({ post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);
    
    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({ 
      isLiked: !isLiked,
      likesCount: post.likes.length 
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/repost
// @desc    Repost content
// @access  Private
router.post('/:id/repost', auth, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost || originalPost.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isReposted = originalPost.reposts.includes(req.user._id);
    
    if (isReposted) {
      originalPost.reposts.pull(req.user._id);
    } else {
      originalPost.reposts.push(req.user._id);
    }

    await originalPost.save();

    res.json({ 
      isReposted: !isReposted,
      repostsCount: originalPost.reposts.length 
    });
  } catch (error) {
    console.error('Repost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
