import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AnimatedTeamDashboard from '../dashboard/AnimatedTeamDashboard';

const TaskMasterDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-900">
            Welcome back, {user?.userdata?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
        </div>
        <AnimatedTeamDashboard />
      </div>
    </div>
  );
};

export default TaskMasterDashboard;