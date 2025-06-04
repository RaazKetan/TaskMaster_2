import React, { useState } from 'react';
import api from '../../services/api';

const CreateTeam = ({ onClose, onTeamCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
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

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem('userData');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser?.userId || 'user_123';

      const response = await api.post(`/teams/${userId}`, formData);

      if (response.data) {
        onTeamCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-md w-full m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Team</h2>
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
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Team Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Enter team name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input resize-none"
                placeholder="Describe your team's purpose..."
                value={formData.description}
                onChange={handleChange}
              />
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
                  Creating...
                </div>
              ) : (
                'Create Team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;