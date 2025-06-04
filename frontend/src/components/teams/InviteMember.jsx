import React, { useState } from 'react';
import api from '../../services/api';
import { TEAM_ROLES } from '../../utils/constants';

const InviteMember = ({ teamId, onClose, onMemberInvited }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: TEAM_ROLES.MEMBER
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/teams/${teamId}/invite`, formData);
      onMemberInvited();
    } catch (err) {
      setError(err.response?.data || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-md w-full m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Invite Team Member</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="Enter member's email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value={TEAM_ROLES.MEMBER}>Member</option>
                <option value={TEAM_ROLES.ADMIN}>Admin</option>
                <option value={TEAM_ROLES.VIEWER}>Viewer</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.role === TEAM_ROLES.ADMIN && 'Can manage team settings and members'}
                {formData.role === TEAM_ROLES.MEMBER && 'Can create and manage projects and tasks'}
                {formData.role === TEAM_ROLES.VIEWER && 'Can view projects and tasks only'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md"
            >
              {loading ? (
                <div className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Inviting...
                </div>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMember;
