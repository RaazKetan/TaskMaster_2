import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import PropTypes from 'prop-types';
import { X, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projects = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        projectId: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assignedTo: '',
        dueDate: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userId = getCurrentUserId();
      const taskData = {
        ...formData,
        userId: userId
      };

      const response = await api.post('/tasks', taskData);

      if (response.data) {
        onTaskCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-800 to-blue-100 p-6 bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
          <CardTitle className="text-lg font-semibold">Create New Task</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            //className="h-12 w-12 p-0 flex items-center justify-center rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Close"
          >
            <X className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-black  focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 px-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="task-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="task-description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Task description..."
                rows={3}
              />
            </div>

            {/* Project */}
            <div>
              <label htmlFor="project-select" className="block text-sm font-medium mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="project-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id || project.id} value={project._id || project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority-select" className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  id="priority-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <div>
                <label htmlFor="status-select" className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  id="status-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label htmlFor="assigned-to" className="block text-sm font-medium mb-1">
                Assigned To
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="assigned-to"
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  placeholder="Assign to someone..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium mb-1">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="due-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

CreateTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskCreated: PropTypes.func.isRequired,
  projects: PropTypes.array
};

export default CreateTaskModal;

