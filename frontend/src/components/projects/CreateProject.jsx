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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-semibold text-slate-800">Create New Project</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in the details below to get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 rounded-md p-3 mb-4">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="project-name">Project Name</label>
            <input className="form-input block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400 py-3 px-4 text-sm" id="project-name" name="name" placeholder="e.g., Website Redesign" type="text" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="description">Description</label>
            <textarea className="form-textarea block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400 min-h-28 py-3 px-4 text-sm" id="description" name="description" placeholder="Provide a brief overview of the project..." value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="team">Team</label>
              <select className="form-select block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-[image:--select-button-svg] py-3 px-4 text-sm text-slate-700" id="team" name="teamId" value={formData.teamId} onChange={handleChange} required>
                <option disabled value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="priority">Priority</label>
              <select className="form-select block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-[image:--select-button-svg] py-3 px-4 text-sm text-slate-700" id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                <option disabled value="">Set priority</option>
                <option value={PRIORITY_LEVELS.HIGH}>High</option>
                <option value={PRIORITY_LEVELS.MEDIUM}>Medium</option>
                <option value={PRIORITY_LEVELS.LOW}>Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="status">Status</label>
              <select className="form-select block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-[image:--select-button-svg] py-3 px-4 text-sm text-slate-700" id="status" name="status" value={formData.status} onChange={handleChange}>
                <option disabled value="">Set status</option>
                <option value={PROJECT_STATUS.ACTIVE}>Planning</option>
                <option value={PROJECT_STATUS.ON_HOLD}>On Hold</option>
                <option value={PROJECT_STATUS.COMPLETED}>Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="deadline">Deadline</label>
              <input className="form-input block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400 py-3 px-4 text-sm text-slate-700" id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-8">
            <button className="rounded-lg h-10 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2" type="button" onClick={onClose}>Cancel</button>
            <button className="rounded-lg h-10 px-5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center"><span className="material-icons animate-spin mr-2">autorenew</span>Creating...</span>
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
