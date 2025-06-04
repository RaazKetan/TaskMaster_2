import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { STATUS_COLORS, PRIORITY_COLORS, TASK_STATUS, PRIORITY_LEVELS } from '../../utils/constants';

const TaskDetail = ({ task, onClose, onTaskUpdate }) => {
  const { user } = useAuth();
  const [taskData, setTaskData] = useState(task);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''
  });

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/tasks/${task.id}/comments`);
      setComments(response.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      const updatedTask = response.data;
      setTaskData(updatedTask);
      onTaskUpdate(updatedTask);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...editForm,
        deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : null
      };

      const response = await api.put(`/tasks/${task.id}`, submitData);
      const updatedTask = response.data;
      setTaskData(updatedTask);
      onTaskUpdate(updatedTask);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/tasks/${task.id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const canEdit = () => {
    return taskData.reporterId === user?.id || taskData.assigneeId === user?.id;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Task Details</h2>
          <div className="flex items-center space-x-3">
            {canEdit() && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="btn btn-outline btn-sm"
              >
                <i className="fas fa-edit mr-2"></i>
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {editMode ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="input"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority
                  </label>
                  <select
                    className="input"
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value={PRIORITY_LEVELS.LOW}>Low</option>
                    <option value={PRIORITY_LEVELS.MEDIUM}>Medium</option>
                    <option value={PRIORITY_LEVELS.HIGH}>High</option>
                    <option value={PRIORITY_LEVELS.URGENT}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    className="input"
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value={TASK_STATUS.TODO}>To Do</option>
                    <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                    <option value={TASK_STATUS.DONE}>Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-md"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Task Header */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-2xl font-bold text-foreground">{taskData.title}</h1>
                  <span className={`text-sm px-3 py-1 rounded-full border ${PRIORITY_COLORS[taskData.priority]}`}>
                    {taskData.priority}
                  </span>
                  <span className={`text-sm px-3 py-1 rounded-full border ${STATUS_COLORS[taskData.status]}`}>
                    {taskData.status}
                  </span>
                </div>

                <p className="text-muted-foreground mb-4">
                  {taskData.description || 'No description provided'}
                </p>

                {taskData.deadline && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <i className="fas fa-calendar mr-2"></i>
                    Deadline: {new Date(taskData.deadline).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Quick Status Update */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(TASK_STATUS.TODO)}
                    className={`btn btn-sm ${taskData.status === TASK_STATUS.TODO ? 'btn-primary' : 'btn-outline'}`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => handleStatusChange(TASK_STATUS.IN_PROGRESS)}
                    className={`btn btn-sm ${taskData.status === TASK_STATUS.IN_PROGRESS ? 'btn-primary' : 'btn-outline'}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(TASK_STATUS.DONE)}
                    className={`btn btn-sm ${taskData.status === TASK_STATUS.DONE ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Comments</h3>
                
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <textarea
                    rows={3}
                    className="input resize-none mb-2"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    Add Comment
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            User {comment.authorId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
