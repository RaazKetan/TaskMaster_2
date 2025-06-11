import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AnimatedTeamDashboard from '../dashboard/AnimatedTeamDashboard';
import FloatingQuickAdd from '../tasks/FloatingQuickAdd';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';

const TaskMasterDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch projects for quick add task
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userId = getCurrentUserId();
        const response = await api.get(`/projects?userId=${userId}`);
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [refreshTrigger]);

  const handleTaskCreated = (newTask) => {
    console.log('New task created:', newTask);
    // Trigger refresh of dashboard data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.userdata?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
        </div>
        <AnimatedTeamDashboard key={refreshTrigger} />
      </div>
      
      {/* Floating Quick Add Task Button */}
      <FloatingQuickAdd 
        projects={projects} 
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default TaskMasterDashboard;