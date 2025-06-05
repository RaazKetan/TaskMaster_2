
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingMascot from '../common/LoadingMascot';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teams: 0,
    projects: 0,
    tasks: 0,
    completedTasks: 0
  });
  const [recentTeams, setRecentTeams] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get current user data from localStorage (same pattern as team management)
        const userData = localStorage.getItem('userData');
        const currentUser = userData ? JSON.parse(userData) : null;

        if (!currentUser || !currentUser.userId) {
          setError('User not authenticated. Please log in again.');
          setLoading(false);
          return;
        }

        const userId = currentUser.userId;
        console.log('Fetching dashboard data for userId:', userId);

        // Fetch all data from MongoDB APIs
        const [teamsResponse, projectsResponse, tasksResponse] = await Promise.all([
          api.get('/teams', { params: { userId } }),
          api.get('/projects', { params: { userId } }),
          api.get('/tasks', { params: { userId } })
        ]);
        
        console.log('Dashboard API responses:', {
          teams: teamsResponse.data?.length || 0,
          projects: projectsResponse.data?.length || 0,
          tasks: tasksResponse.data?.length || 0
        });

        const teams = teamsResponse.data || [];
        const projects = projectsResponse.data || [];
        const tasks = tasksResponse.data || [];

        // Calculate task completion stats
        const completedTasks = tasks.filter(task => 
          task.status === 'COMPLETED' || 
          task.status === 'Done' || 
          task.status === 'completed'
        ).length;

        // Update stats with real data from MongoDB
        setStats({
          teams: teams.length,
          projects: projects.length,
          tasks: tasks.length,
          completedTasks: completedTasks
        });

        // Set recent items (latest 3)
        setRecentTeams(teams.slice(0, 3));
        setRecentProjects(projects.slice(0, 3));
        
        setError('');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data from MongoDB');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingMascot message="Loading your dashboard from MongoDB..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Teams',
      value: stats.teams,
      icon: 'fas fa-users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Projects',
      value: stats.projects,
      icon: 'fas fa-project-diagram',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Tasks',
      value: stats.tasks,
      icon: 'fas fa-tasks',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: 'fas fa-check-circle',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.userdata?.firstName || user?.firstName || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today (data from MongoDB).
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <i className={`${stat.icon} ${stat.color} text-xl`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Teams */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Recent Teams (MongoDB)</h3>
              <Link to="/teams" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="card-content">
            {recentTeams.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-4">No teams found in MongoDB</p>
                <Link to="/teams" className="btn btn-primary btn-sm">
                  Create your first team
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTeams.map((team) => (
                  <div key={team._id || team.id} className="flex items-center p-3 bg-muted rounded-lg">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-foreground">{team.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {Array.isArray(team.members) ? team.members.length : 0} members
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link 
                      to="/teams"
                      className="text-primary hover:text-primary/80"
                    >
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Recent Projects (MongoDB)</h3>
              <Link to="/projects" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="card-content">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-project-diagram text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-4">No projects found in MongoDB</p>
                <Link to="/projects" className="btn btn-primary btn-sm">
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project._id || project.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">{project.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        project.priority === 'HIGH' ? 'priority-high' :
                        project.priority === 'MEDIUM' ? 'priority-medium' :
                        project.priority === 'LOW' ? 'priority-low' : 'priority-urgent'
                      }`}>
                        {project.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        project.status === 'ACTIVE' ? 'status-in-progress' :
                        project.status === 'COMPLETED' ? 'status-done' : 'status-todo'
                      }`}>
                        {project.status || 'PLANNING'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
