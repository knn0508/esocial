import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost } from '../store/slices/postsSlice';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text',
    images: [],
    attachments: [],
    links: []
  });
  const [filters, setFilters] = useState({
    role: '',
    mentorship: false,
    type: ''
  });

  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPosts(filters));
  }, [dispatch, filters]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      await dispatch(createPost(newPost)).unwrap();
      setNewPost({
        content: '',
        type: 'text',
        images: [],
        attachments: [],
        links: []
      });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading && posts.length === 0) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Stay connected with your academic community
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Users</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teachers Only</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Types</option>
            <option value="text">Text Posts</option>
            <option value="image">Images</option>
            <option value="link">Links</option>
            <option value="file">Files</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.mentorship}
              onChange={(e) => setFilters(prev => ({ ...prev, mentorship: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Mentorship Posts</span>
          </label>
        </div>
      </div>

      {/* Create Post Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create a new post</span>
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What's on your mind?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="post-card"
          >
            {/* Post Header */}
            <div className="flex items-start space-x-3 mb-4">
              {post.userId?.profilePicture ? (
                <img
                  src={post.userId.profilePicture}
                  alt={post.userId.firstName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {post.userId?.firstName?.[0]}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">
                    {post.userId?.firstName} {post.userId?.lastName}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {post.userId?.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                  </span>
                  {post.isMentorshipPost && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                      Mentorship
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>

              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current text-red-500' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.commentsCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                  <Share2 className={`w-5 h-5 ${post.isReposted ? 'fill-current text-green-500' : ''}`} />
                  <span>{post.repostsCount}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share something with the community!</p>
          </div>
        )}
      </div>

      {loading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default HomePage;
