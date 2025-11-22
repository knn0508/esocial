import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroup, fetchGroupPosts, joinGroup, leaveGroup } from '../store/slices/groupsSlice';
import { motion } from 'framer-motion';
import { 
  Users, 
  Lock, 
  Unlock, 
  Calendar,
  MessageCircle,
  Star,
  Plus,
  Heart,
  Share2
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GroupDetailPage = () => {
  const { id } = useParams();
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text'
  });
  const [showCreatePost, setShowCreatePost] = useState(false);

  const dispatch = useDispatch();
  const { currentGroup, groupPosts, loading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroup(id));
      dispatch(fetchGroupPosts({ groupId: id }));
    }
  }, [dispatch, id]);

  const handleJoinGroup = async () => {
    try {
      await dispatch(joinGroup({ groupId: id })).unwrap();
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await dispatch(leaveGroup(id)).unwrap();
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      // This would need to be implemented in the backend
      console.log('Creating post:', newPost);
      setNewPost({ content: '', type: 'text' });
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

  if (loading && !currentGroup) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!currentGroup) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
          <p className="text-gray-600">The group you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Group Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h1>
              <p className="text-gray-600">{currentGroup.university}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{currentGroup.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{currentGroup.posts?.length || 0} posts</span>
                </div>
                {currentGroup.isPrivate && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentGroup.isMember ? (
              <button
                onClick={handleLeaveGroup}
                className="btn-secondary"
              >
                Leave Group
              </button>
            ) : (
              <button
                onClick={handleJoinGroup}
                className="btn-primary"
              >
                Join Group
              </button>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              <Star className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{currentGroup.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created {formatTimeAgo(currentGroup.createdAt)}</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            {currentGroup.category}
          </span>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        {/* Create Post Button */}
        {currentGroup.isMember && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create a post</span>
            </button>
          </div>
        )}

        {/* Posts */}
        {groupPosts[id]?.posts.map((post) => (
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
                </div>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
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

        {groupPosts[id]?.posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share something in this group!</p>
          </div>
        )}
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

              <div className="flex justify-end space-x-3">
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
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;
