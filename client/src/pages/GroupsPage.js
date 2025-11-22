import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups, createGroup, joinGroup } from '../store/slices/groupsSlice';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Users, 
  Lock, 
  Unlock, 
  Calendar,
  MessageCircle,
  Star
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GroupsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    university: '',
    search: ''
  });
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'other',
    isPrivate: false,
    university: '',
    faculty: ''
  });
  const [joinCode, setJoinCode] = useState('');

  const dispatch = useDispatch();
  const { groups, loading, error } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchGroups(filters));
  }, [dispatch, filters]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim() || !newGroup.description.trim()) return;

    try {
      await dispatch(createGroup(newGroup)).unwrap();
      setNewGroup({
        name: '',
        description: '',
        category: 'other',
        isPrivate: false,
        university: '',
        faculty: ''
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      // This would need to be implemented in the backend
      // For now, we'll just show a success message
      console.log('Joining group with code:', joinCode);
      setJoinCode('');
      setShowJoinModal(false);
    } catch (error) {
      console.error('Failed to join group:', error);
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

  if (loading && groups.length === 0) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Study Groups
        </h1>
        <p className="text-gray-600">
          Join or create study groups to collaborate with peers
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Categories</option>
            <option value="academic">Academic</option>
            <option value="social">Social</option>
            <option value="mentorship">Mentorship</option>
            <option value="study">Study</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={filters.university}
            onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Universities</option>
            <option value="stanford">Stanford University</option>
            <option value="mit">MIT</option>
            <option value="harvard">Harvard University</option>
            <option value="berkeley">UC Berkeley</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Join Group</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div
            key={group._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="post-card hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.university}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {group.isPrivate ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-gray-400" />
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${
                  group.category === 'academic' 
                    ? 'bg-blue-100 text-blue-600'
                    : group.category === 'social'
                    ? 'bg-green-100 text-green-600'
                    : group.category === 'mentorship'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {group.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {group.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{group.posts?.length || 0} posts</span>
                </div>
              </div>
              <span>{formatTimeAgo(group.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {group.isMember ? (
                <span className="text-sm text-green-600 font-medium">Member</span>
              ) : (
                <button className="btn-primary text-sm py-1 px-3">
                  Join Group
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Star className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
          <p className="text-gray-600 mb-4">Be the first to create a study group!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Study Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Enter group name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Describe your group..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newGroup.category}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="academic">Academic</option>
                      <option value="social">Social</option>
                      <option value="mentorship">Mentorship</option>
                      <option value="study">Study</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      value={newGroup.university}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, university: e.target.value }))}
                      className="input-field"
                      placeholder="University name"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newGroup.isPrivate}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Private group (requires invite code)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Group
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Join Group</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJoinGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="input-field"
                  placeholder="Enter group invite code"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ask the group creator for the invite code
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Join Group
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading && groups.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
