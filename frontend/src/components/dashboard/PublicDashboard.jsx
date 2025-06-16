
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedTeamDashboard from './AnimatedTeamDashboard';
import api from '../../services/api';

const PublicDashboard = () => {
  const { shareId } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardInfo, setDashboardInfo] = useState(null);

  useEffect(() => {
    const fetchPublicDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch public dashboard data using shareId directly
        const response = await fetch(`/api/public/dashboard/${shareId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Public dashboard data received:', data);
        
        // Transform the data to match what AnimatedTeamDashboard expects
        const transformedData = {
          stats: {
            totalTeams: data.dashboardData.teams || 0,
            totalProjects: data.dashboardData.projects || 0,
            completedTasks: data.dashboardData.tasks || 0,
            activeUsers: 1 // Default for public view
          },
          teamPerformance: [],
          projectStatus: [],
          activityData: [],
          priorityDistribution: []
        };
        
        setDashboardData(transformedData);
        setDashboardInfo(data.dashboardInfo);
      } catch (error) {
        console.error('Error fetching public dashboard:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchPublicDashboard();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-500">Fetching shared dashboard data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            This dashboard may have been removed or the link may be invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TaskMaster Dashboard</h1>
                {dashboardInfo && (
                  <p className="text-sm text-gray-500">
                    Shared by {dashboardInfo.ownerName} • {dashboardInfo.projectCount} Projects
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              📊 Public View • Read Only
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Overview
          </h2>
          <p className="text-gray-600">
            Real-time insights and analytics for ongoing projects
          </p>
        </div>
        
        {/* Render the animated dashboard with public data */}
        <AnimatedTeamDashboard 
          publicData={dashboardData}
          isPublicView={true}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by TaskMaster • This is a shared dashboard view</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicDashboard;
