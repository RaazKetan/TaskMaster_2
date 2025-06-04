import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [teamsResponse, projectsResponse] = await Promise.all([
          api.get('/teams'),
          api.get('/projects')
        ]);

        const teams = teamsResponse.data || [];
        const projects = projectsResponse.data || [];

        // Calculate stats
        setStats({
          teams: teams.length,
          projects: projects.length,
          tasks: 0, // Will be calculated when we have tasks endpoint
          completedTasks: 0
        });

        setRecentTeams(teams.slice(0, 3));
        setRecentProjects(projects.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
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
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
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
              <h3 className="card-title">Recent Teams</h3>
              <Link to="/teams" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="card-content">
            {recentTeams.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-4">No teams yet</p>
                <Link to="/teams" className="btn btn-primary btn-sm">
                  Create your first team
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTeams.map((team) => (
                  <div key={team.id} className="flex items-center p-3 bg-muted rounded-lg">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-foreground">{team.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {team.members?.length || 0} members
                      </p>
                    </div>
                    <Link 
                      to={`/teams/${team.id}`}
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
              <h3 className="card-title">Recent Projects</h3>
              <Link to="/projects" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="card-content">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-project-diagram text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Link to="/projects" className="btn btn-primary btn-sm">
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">{project.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        project.priority === 'HIGH' ? 'priority-high' :
                        project.priority === 'MEDIUM' ? 'priority-medium' :
                        project.priority === 'LOW' ? 'priority-low' : 'priority-urgent'
                      }`}>
                        {project.priority}
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
                        {project.status}
                      </span>
                      <Link 
                        to={`/projects/${project.id}`}
                        className="text-primary hover:text-primary/80"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </Link>
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
