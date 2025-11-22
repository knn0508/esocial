import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentorships, createMentorship } from '../store/slices/mentorshipSlice';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  GraduationCap, 
  User, 
  Clock, 
  MapPin,
  Star,
  MessageCircle
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MentorshipPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    subject: '',
    status: ''
  });
  const [newMentorship, setNewMentorship] = useState({
    type: 'offer',
    subject: '',
    description: '',
    meetingFrequency: 'weekly',
    meetingMethod: 'video-call',
    goals: []
  });

  const dispatch = useDispatch();
  const { mentorships, loading, error } = useSelector((state) => state.mentorship);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMentorships(filters));
  }, [dispatch, filters]);

  const handleCreateMentorship = async (e) => {
    e.preventDefault();
    if (!newMentorship.subject.trim() || !newMentorship.description.trim()) return;

    try {
      await dispatch(createMentorship(newMentorship)).unwrap();
      setNewMentorship({
        type: 'offer',
        subject: '',
        description: '',
        meetingFrequency: 'weekly',
        meetingMethod: 'video-call',
        goals: []
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create mentorship:', error);
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

  if (loading && mentorships.length === 0) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mentorship Network
        </h1>
        <p className="text-gray-600">
          Connect with mentors and mentees to accelerate your learning journey
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Types</option>
            <option value="offer">Mentorship Offers</option>
            <option value="request">Mentorship Requests</option>
          </select>
          
          <select
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Subjects</option>
            <option value="computer-science">Computer Science</option>
            <option value="mathematics">Mathematics</option>
            <option value="business">Business</option>
            <option value="engineering">Engineering</option>
            <option value="medicine">Medicine</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentorships..."
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Mentorship</span>
          </button>
        </div>
      </div>

      {/* Mentorship Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentorships.map((mentorship) => (
          <motion.div
            key={mentorship._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="post-card hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {mentorship.mentorId?.profilePicture ? (
                  <img
                    src={mentorship.mentorId.profilePicture}
                    alt={mentorship.mentorId.firstName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {mentorship.mentorId?.firstName} {mentorship.mentorId?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {mentorship.mentorId?.university}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  mentorship.type === 'offer' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {mentorship.type === 'offer' ? 'Offering' : 'Seeking'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  mentorship.status === 'active' 
                    ? 'bg-green-100 text-green-600'
                    : mentorship.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {mentorship.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {mentorship.subject}
              </h4>
              <p className="text-gray-600 text-sm line-clamp-3">
                {mentorship.description}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>{mentorship.meetingFrequency}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{mentorship.meetingMethod}</span>
              </div>
              {mentorship.rating && (
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                  <span>{mentorship.rating}/5</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Contact</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Save</span>
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                {formatTimeAgo(mentorship.createdAt)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {mentorships.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <GraduationCap className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorships found</h3>
          <p className="text-gray-600 mb-4">Be the first to create a mentorship opportunity!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Mentorship
          </button>
        </div>
      )}

      {/* Create Mentorship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Mentorship</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateMentorship}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="offer"
                        checked={newMentorship.type === 'offer'}
                        onChange={(e) => setNewMentorship(prev => ({ ...prev, type: e.target.value }))}
                        className="mr-2"
                      />
                      <span>Offering Mentorship</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="request"
                        checked={newMentorship.type === 'request'}
                        onChange={(e) => setNewMentorship(prev => ({ ...prev, type: e.target.value }))}
                        className="mr-2"
                      />
                      <span>Seeking Mentorship</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newMentorship.subject}
                    onChange={(e) => setNewMentorship(prev => ({ ...prev, subject: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Computer Science, Mathematics"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newMentorship.description}
                    onChange={(e) => setNewMentorship(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Describe your mentorship opportunity..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Frequency
                    </label>
                    <select
                      value={newMentorship.meetingFrequency}
                      onChange={(e) => setNewMentorship(prev => ({ ...prev, meetingFrequency: e.target.value }))}
                      className="input-field"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="as-needed">As needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Method
                    </label>
                    <select
                      value={newMentorship.meetingMethod}
                      onChange={(e) => setNewMentorship(prev => ({ ...prev, meetingMethod: e.target.value }))}
                      className="input-field"
                    >
                      <option value="video-call">Video Call</option>
                      <option value="in-person">In Person</option>
                      <option value="phone">Phone</option>
                      <option value="text">Text/Email</option>
                    </select>
                  </div>
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
                  Create Mentorship
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading && mentorships.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
