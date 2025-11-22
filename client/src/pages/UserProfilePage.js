import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../store/slices/postsSlice';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar,
  Mail,
  GraduationCap,
  Users,
  MessageCircle,
  Heart,
  Share2,
  UserPlus
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.posts);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    // This would fetch the user data from the backend
    // For now, we'll simulate it
    const fetchUser = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUser({
          _id: id,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@university.edu',
          university: 'Stanford University',
          faculty: 'Computer Science',
          role: 'student',
          bio: 'Passionate about technology and learning new things.',
          profilePicture: null,
          verified: true
        });
        setLoading(false);
      }, 1000);
    };

    if (id) {
      fetchUser();
      dispatch(fetchPosts({ userId: id }));
    }
  }, [dispatch, id]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-2xl">
                    {user.firstName[0]}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">{user.university}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <GraduationCap className="w-4 h-4" />
                  <span>{user.role === 'teacher' ? 'Teacher' : 'Student'}</span>
                </div>
                {user.faculty && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{user.faculty}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="btn-outline flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Connect</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-6">
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'posts'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'mentorship'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mentorship
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'groups'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Groups
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'posts' && (
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

              {posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MessageCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">This user hasn't shared anything yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mentorship' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <GraduationCap className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mentorship activities</h3>
              <p className="text-gray-600">This user's mentorship activities will appear here.</p>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Group memberships</h3>
              <p className="text-gray-600">Groups this user is part of will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
