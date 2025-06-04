import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../../services/auth';

const CreateTeam = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    }

    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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

    try {
      await createTeam(formData.name.trim(), formData.description.trim());
      navigate('/teams', {
        state: {
          message: 'Team created successfully!',
          type: 'success'
        }
      });
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to create team. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Create New Team</h1>
          <p className="text-sm text-gray-600 mt-1">
            Build your team and start collaborating on projects together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex">
                <i data-feather="alert-circle" className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Team Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`input ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter team name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Choose a descriptive name for your team.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`input ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Describe your team's purpose and goals..."
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Optional. Help team members understand the team's purpose.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
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
                  Creating...
                </div>
              ) : (
                <>
                  <i data-feather="users" className="h-4 w-4 mr-2" />
                  Create Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for creating a great team</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose a clear, descriptive name that reflects your team's purpose</li>
          <li>• Add a description to help new members understand the team's goals</li>
          <li>• You can invite members after creating the team</li>
          <li>• As the team owner, you'll have admin privileges to manage the team</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTeam;
