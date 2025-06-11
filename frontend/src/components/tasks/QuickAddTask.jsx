import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';

const QuickAddTask = ({ projects = [], onTaskCreated }) => {
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    try {
      setLoading(true);

      const taskData = {
        title: taskTitle,
        description: '',
        projectId: selectedProject,
        priority: 'MEDIUM',
        status: 'TODO',
        assignedTo: '',
        dueDate: selectedDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        userId: getCurrentUserId()
      };

      const response = await api.post('/tasks', taskData);

      if (response.data) {
        onTaskCreated(response.data);
        setTaskTitle('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-700">Quick Add Task</h3>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What needs to be done? (Press Enter to add)"
            className="flex-1"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!taskTitle.trim() || !selectedProject || loading}
            className="px-4"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Project Selection - Mandatory */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 text-sm"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </form>

      <div className="mt-2 text-xs text-gray-500">
        💡 Tip: Task will be created with medium priority and "To Do" status. You can edit details later.
      </div>
    </div>
  );
};

export default QuickAddTask;