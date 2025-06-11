import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import PropTypes from 'prop-types';


import { X, Calendar, User, Flag, Save } from 'lucide-react';


const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated, projects = [] }) => {
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
    if (isOpen && task) {
      // Populate form with task data
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
      setError('');
    }
  }, [isOpen, task]);


  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }


    try {
      setLoading(true);
      setError('');
     
      const updatedData = { ...formData };
      await onTaskUpdated(task._id || task.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Flag className="h-5 w-5 mr-2 text-blue-600" />
            Edit Task
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
       
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium mb-1">Task Title</label>
              <Input
                id="task-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>


            <div>
              <label htmlFor="task-description" className="block text-sm font-medium mb-1">Description</label>
              <textarea
                id="task-description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Task description..."
                rows={3}
              />
            </div>


            <div>
              <label htmlFor="task-project" className="block text-sm font-medium mb-1">Project</label>
              <select
                id="task-project"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                required
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project._id || project.id} value={project._id || project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-priority" className="block text-sm font-medium mb-1">Priority</label>
                <select
                  id="task-priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>


              <div>
                <label htmlFor="task-status" className="block text-sm font-medium mb-1">Status</label>
                <select
                  id="task-status"
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


            <div>
              <label htmlFor="task-assigned-to" className="block text-sm font-medium mb-1">Assigned To</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="task-assigned-to"
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  placeholder="Assign to someone..."
                  className="pl-10"
                />
              </div>
            </div>


            <div>
              <label htmlFor="task-due-date" className="block text-sm font-medium mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="task-due-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>


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
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


EditTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskUpdated: PropTypes.func.isRequired,
  projects: PropTypes.array,
  task: PropTypes.object
};


export default EditTaskModal;
