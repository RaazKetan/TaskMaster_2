
import React, { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';

const FloatingQuickAdd = ({ projects = [], onTaskCreated, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) return;
    
    const projectId = projects[0]?._id || projects[0]?.id;
    
    if (!projectId) {
      alert('Please create a project first');
      return;
    }

    try {
      setLoading(true);
      
      const taskData = {
        title: taskTitle,
        description: '',
        projectId: projectId,
        priority: 'MEDIUM',
        status: 'TODO',
        assignedTo: '',
        dueDate: '',
        userId: getCurrentUserId()
      };

      const response = await api.post('/tasks', taskData);
      
      if (response.data) {
        onTaskCreated(response.data);
        setTaskTitle('');
        setIsExpanded(false);
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
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setTaskTitle('');
    }
  };

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          title="Quick Add Task"
        >
          <Zap className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-w-[calc(100vw-3rem)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Quick Task</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setTaskTitle('');
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What needs to be done?"
            className="w-full"
            autoFocus
            disabled={loading}
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!taskTitle.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>

        <div className="mt-2 text-xs text-gray-500">
          Press Enter to save, Esc to cancel
        </div>
      </div>
    </div>
  );
};

export default FloatingQuickAdd;
