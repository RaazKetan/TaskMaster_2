import React, { useState } from 'react';
import api from '../../services/api';
import { PRIORITY_LEVELS, PROJECT_STATUS } from '../../utils/constants';

const CreateProject = ({ teams, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamId: teams.length > 0 ? teams[0].id : '',
    priority: PRIORITY_LEVELS.MEDIUM,
    status: PROJECT_STATUS.ACTIVE,
    deadline: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.teamId) {
      setError('Please select a team');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const response = await api.post('/projects', submitData);
      onProjectCreated(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Project</h2>
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
                Project Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Enter project name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="teamId" className="block text-sm font-medium text-foreground mb-2">
                Team *
              </label>
              <select
                id="teamId"
                name="teamId"
                required
                className="input"
                value={formData.teamId}
                onChange={handleChange}
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
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
                placeholder="Describe your project..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="input"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value={PRIORITY_LEVELS.LOW}>Low</option>
                  <option value={PRIORITY_LEVELS.MEDIUM}>Medium</option>
                  <option value={PRIORITY_LEVELS.HIGH}>High</option>
                  <option value={PRIORITY_LEVELS.URGENT}>Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value={PROJECT_STATUS.ACTIVE}>Active</option>
                  <option value={PROJECT_STATUS.ON_HOLD}>On Hold</option>
                  <option value={PROJECT_STATUS.COMPLETED}>Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-2">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                className="input"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-outline btn-md"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-primary hover:text-primary/80"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
