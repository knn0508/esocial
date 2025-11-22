const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts/:id/comments
// @desc    Get post comments
// @access  Private
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
      postId: req.params.id,
      isDeleted: false,
      parentCommentId: null // Only top-level comments
    })
    .populate('userId', 'firstName lastName profilePicture')
    .populate({
      path: 'replies',
      populate: {
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Add like status for current user
    const commentsWithLikes = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.isLiked = comment.likes.includes(req.user._id);
      return commentObj;
    });

    const total = await Comment.countDocuments({ 
      postId: req.params.id,
      isDeleted: false,
      parentCommentId: null 
    });

    res.json({
      comments: commentsWithLikes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add comment
// @access  Private
router.post('/:id/comments', [
  auth,
  body('content').notEmpty().withMessage('Content is required'),
  body('parentCommentId').optional().isMongoId().withMessage('Invalid parent comment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if post exists
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content, parentCommentId } = req.body;

    const comment = new Comment({
      postId: req.params.id,
      userId: req.user._id,
      content,
      parentCommentId: parentCommentId || null
    });

    await comment.save();
    await comment.populate('userId', 'firstName lastName profilePicture');

    // Update post comments count
    post.commentsCount += 1;
    await post.save();

    // If this is a reply, update parent comment replies count
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 }
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    // Update post comments count
    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentsCount: -1 }
    });

    // If this is a reply, update parent comment replies count
    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(comment.parentCommentId, {
        $inc: { repliesCount: -1 }
      });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/unlike comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isLiked = comment.likes.includes(req.user._id);
    
    if (isLiked) {
      comment.likes.pull(req.user._id);
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.json({ 
      isLiked: !isLiked,
      likesCount: comment.likes.length 
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
