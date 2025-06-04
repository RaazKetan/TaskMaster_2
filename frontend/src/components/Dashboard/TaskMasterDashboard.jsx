import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const TaskMasterDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const projects = [
    { id: 1, name: "Marketing Campaign", status: "Ongoing", progress: 60, tasks: "15/25", color: "blue" },
    { id: 2, name: "Product Launch", status: "In Progress", progress: 66, tasks: "8/12", color: "orange" },
    { id: 3, name: "Client Onboarding", status: "Completed", progress: 100, tasks: "10/10", color: "green" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-secondary-200 flex flex-col shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-secondary-900">TaskMaster</h1>
          </div>
          {/* Navigation */}
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg border border-primary-200 transition-all duration-200">
              <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Dashboard
            </Link>
            <Link to="/tasks" className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-all duration-200">
              <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              My Tasks
            </Link>
            <Link to="/projects" className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-all duration-200">
              <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Projects
            </Link>
            <Link to="/teams" className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-all duration-200">
              <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Teams
            </Link>
            <Link to="/calendar" className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-all duration-200">
              <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Calendar
            </Link>
          </nav>
        </div>
        
        {/* New Project Button */}
        <div className="mt-auto p-6">
          <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            New Project
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Dashboard</h1>
          <p className="text-secondary-600">Welcome back, {user?.firstName || 'User'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-secondary-200 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Projects</p>
                <p className="text-2xl font-bold text-secondary-900">12</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-secondary-200 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active Tasks</p>
                <p className="text-2xl font-bold text-secondary-900">34</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-secondary-200 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Due Today</p>
                <p className="text-2xl font-bold text-secondary-900">7</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-secondary-200 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Team Members</p>
                <p className="text-2xl font-bold text-secondary-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">Project Overview</h2>
            <button className="text-sm text-secondary-600 hover:text-secondary-900 flex items-center px-3 py-2 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-secondary-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-secondary-900">{project.name}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    project.status === 'Ongoing' ? 'bg-primary-100 text-primary-800' :
                    project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-secondary-600 mb-4">
                  {project.name === 'Marketing Campaign' ? 'Launched new social media ads and email sequences.' :
                   project.name === 'Product Launch' ? 'Finalizing beta testing and preparing launch materials.' :
                   'Successfully onboarded new enterprise client.'}
                </p>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-secondary-600">Progress</span>
                    <span className="text-xs font-bold text-secondary-800">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        project.color === 'blue' ? 'bg-primary-600' :
                        project.color === 'orange' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-500">Tasks: {project.tasks}</span>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Task Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-secondary-200 p-6 shadow-lg">
              <h3 className="font-medium text-secondary-900 mb-4">Completed vs. Pending Tasks</h3>
              <div className="h-64 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">67%</span>
                  </div>
                  <p className="text-secondary-600">Tasks Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-secondary-200 p-6 shadow-lg">
              <h3 className="font-medium text-secondary-900 mb-4">Team Workload Distribution</h3>
              <div className="h-64 bg-gradient-to-br from-green-50 to-primary-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-secondary-600">Workload Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Task Completion Rate (User)</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Line Chart</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Task Completion Rate (Team)</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Bar Chart</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Contribution Activity</h3>
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Activity Grid</p>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Task Summary</h3>
                  <p className="text-sm text-gray-600">Completed 3 tasks today</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Design Reviews</h3>
                  <p className="text-sm text-gray-600">Reviewed and approved 2 design mockups</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Meetings</h3>
                  <p className="text-sm text-gray-600">Scheduled 3 client meetings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskMasterDashboard;