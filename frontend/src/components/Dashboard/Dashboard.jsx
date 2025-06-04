import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProjects, getTeams, getUserTasks } from '../../services/auth';
import { formatDate, isOverdue, getDaysUntilDeadline, PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    projects: [],
    teams: [],
    tasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    // Initialize feather icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, teamsRes, tasksRes] = await Promise.all([
        getProjects(),
        getTeams(),
        getUserTasks()
      ]);

      setData({
        projects: projectsRes,
        teams: teamsRes,
        tasks: tasksRes
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProjects: data.projects.length,
    activeProjects: data.projects.filter(p => p.status === 'ACTIVE').length,
    totalTeams: data.teams.length,
    myTasks: data.tasks.length,
    overdueTasks: data.tasks.filter(t => t.deadline && isOverdue(t.deadline)).length,
    completedTasks: data.tasks.filter(t => t.status === 'DONE').length
  };

  const recentProjects = data.projects.slice(0, 5);
  const urgentTasks = data.tasks
    .filter(t => t.status !== 'DONE' && (t.priority === 'URGENT' || t.priority === 'HIGH'))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects and tasks.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <i data-feather="alert-circle" className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i data-feather="folder" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i data-feather="activity" className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <i data-feather="users" className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <i data-feather="check-square" className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myTasks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link
                to="/projects"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <i data-feather="folder-plus" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Get started by creating your first project.
                </p>
                <Link
                  to="/projects/create"
                  className="btn btn-primary btn-sm"
                >
                  <i data-feather="plus" className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">{project.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Created {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Priority Tasks</h2>
              <Link
                to="/projects"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8">
                <i data-feather="check-circle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No urgent tasks</h3>
                <p className="text-sm text-gray-500">
                  Great! You're all caught up on high-priority items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {urgentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-sm text-gray-500 truncate">{task.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.deadline && (
                          <span className={`text-xs ${isOverdue(task.deadline) ? 'text-red-600' : 'text-gray-500'}`}>
                            {isOverdue(task.deadline) ? 'Overdue' : `${getDaysUntilDeadline(task.deadline)} days left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/projects/create"
            className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg">
              <i data-feather="plus" className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-primary-900">Create Project</p>
              <p className="text-sm text-primary-700">Start a new project</p>
            </div>
          </Link>

          <Link
            to="/teams/create"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <i data-feather="users" className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Create Team</p>
              <p className="text-sm text-green-700">Invite team members</p>
            </div>
          </Link>

          <Link
            to="/teams"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <i data-feather="mail" className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Invite Members</p>
              <p className="text-sm text-purple-700">Add people to teams</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
