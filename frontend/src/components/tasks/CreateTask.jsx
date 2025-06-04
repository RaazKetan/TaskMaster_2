import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PRIORITY_LEVELS, TASK_STATUS } from '../../utils/constants';

const CreateTask = ({ projectId, teamMembers, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId,
    assigneeId: '',
    priority: PRIORITY_LEVELS.MEDIUM,
    status: TASK_STATUS.TODO,
    deadline: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const response = await api.post('/tasks', submitData);
      onTaskCreated(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Get team member users
  const teamMemberUsers = users.filter(user => 
    teamMembers.some(member => member.userId === user.id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Task</h2>
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
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Task Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input"
                placeholder="Enter task title"
                value={formData.title}
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
                placeholder="Describe the task..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="assigneeId" className="block text-sm font-medium text-foreground mb-2">
                Assignee
              </label>
              <select
                id="assigneeId"
                name="assigneeId"
                className="input"
                value={formData.assigneeId}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {teamMemberUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
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
                  <option value={TASK_STATUS.TODO}>To Do</option>
                  <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={TASK_STATUS.DONE}>Done</option>
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
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
