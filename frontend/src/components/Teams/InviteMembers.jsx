import React, { useState, useEffect } from 'react';
import { inviteTeamMember } from '../../services/auth';
import { TEAM_ROLES } from '../../utils/constants';

const InviteMembers = ({ team, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'MEMBER'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Initialize feather icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      await inviteTeamMember(team.id, formData.email.trim(), formData.role);
      setSuccess('Invitation sent successfully!');
      setFormData({ email: '', role: 'MEMBER' });
      
      // Auto-close after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to send invitation. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Invite Team Member
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i data-feather="x" className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Invite someone to join <strong>{team.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex">
                <i data-feather="alert-circle" className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <div className="flex">
                <i data-feather="check-circle" className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`input ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="label">
                Role *
              </label>
              <select
                id="role"
                name="role"
                required
                className={`input ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                <p><strong>Admin:</strong> Can manage team, projects, and invite members</p>
                <p><strong>Member:</strong> Can create and manage projects and tasks</p>
                <p><strong>Viewer:</strong> Can view projects and tasks only</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <i data-feather="mail" className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-start">
            <i data-feather="info" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p>An invitation email will be sent to the provided address. If they don't have an account, they'll need to register first before accepting the invitation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMembers;
