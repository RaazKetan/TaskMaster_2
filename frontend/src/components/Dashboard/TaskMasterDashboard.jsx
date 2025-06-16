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

  const handleShareDashboard = async () => {
    try {
      const userId = getCurrentUserId();
      const response = await api.post('/dashboard/share', { userId });
      const shareId = response.data.shareId;
      const shareUrl = `${window.location.origin}/public/dashboard/${shareId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert(`Dashboard link copied to clipboard!\n\n${shareUrl}\n\nAnyone with this link can view your dashboard.`);
    } catch (error) {
      console.error('Error sharing dashboard:', error);
      alert('Failed to create shareable link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-yellow-900">
                Welcome back, {user?.userdata?.firstName || user?.email}!
              </h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleShareDashboard}
                data-share-dashboard
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Dashboard
              </button>
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Live Dashboard
              </div>
            </div>
          </div>
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