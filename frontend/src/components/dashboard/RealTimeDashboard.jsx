import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Users, FolderOpen, CheckSquare, TrendingUp, BarChart3, 
  Calendar, Clock, AlertTriangle, Activity, RefreshCw, 
  Plus, ArrowRight, Timer, Target 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';

const RealTimeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    totalTeams: 0,
    recentActivities: [],
    projectProgress: [],
    tasksByPriority: { byPriority: [], byStatus: [], totalActive: 0, totalTasks: 0 },
    upcomingDeadlines: [],
    lastUpdated: null
  });

  const fetchDashboardData = async () => {
    try {
      // Get current user data from localStorage (consistent with team management)
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId) {
        setError('User authentication required - please log in again');
        setLoading(false);
        return;
      }

      const userId = currentUser.userId;
      console.log('Fetching real-time dashboard data for userId:', userId);
      
      const [teamsResponse, projectsResponse, tasksResponse] = await Promise.all([
        api.get('/teams', { params: { userId } }),
        api.get('/projects', { params: { userId } }),
        api.get('/tasks', { params: { userId } })
      ]);
      
      const teams = teamsResponse.data || [];
      const projects = projectsResponse.data || [];
      const tasks = tasksResponse.data || [];

      console.log('Real-time dashboard data fetched from MongoDB:', {
        teams: teams.length,
        projects: projects.length,
        tasks: tasks.length
      });

      // Enhanced calculations with real MongoDB data
      const activeProjects = projects.filter(p => 
        p.status === 'ACTIVE' || p.status === 'In Progress' || p.status === 'Planning'
      );
      const completedProjects = projects.filter(p => 
        p.status === 'COMPLETED' || p.status === 'Done'
      );
      const completedTasks = tasks.filter(t => 
        t.status === 'COMPLETED' || t.status === 'Done'
      );
      const inProgressTasks = tasks.filter(t => 
        t.status === 'IN_PROGRESS' || t.status === 'In Progress' || t.status === 'ACTIVE'
      );
      const todoTasks = tasks.filter(t => 
        t.status === 'TODO' || t.status === 'Planning'
      );
      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && 
        !completedTasks.includes(t)
      );

      setDashboardData({
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        todoTasks: todoTasks.length,
        overdueTasks: overdueTasks.length,
        totalTeams: teams.length,
        recentActivities: generateRecentActivities(projects, tasks),
        projectProgress: calculateProjectProgress(projects, tasks),
        tasksByPriority: calculateTasksByPriority(tasks),
        upcomingDeadlines: getUpcomingDeadlines(tasks),
        lastUpdated: new Date().toLocaleTimeString()
      });

      setError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (projects, tasks) => {
    const activities = [];
    const now = new Date();
    
    // Recent project activities with better timestamps
    projects.forEach(project => {
      const timestamp = project.updatedAt || project.createdAt;
      if (timestamp) {
        const activityTime = new Date(timestamp);
        const timeDiff = now - activityTime;
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        activities.push({
          id: `project-${project._id || project.id}`,
          type: 'project',
          title: `Project "${project.name}" ${project.status === 'COMPLETED' ? 'completed' : 'updated'}`,
          description: `Status: ${project.status}${project.description ? ' - ' + project.description.substring(0, 50) + '...' : ''}`,
          timestamp: timestamp,
          timeAgo: hoursAgo < 24 ? `${hoursAgo}h ago` : new Date(timestamp).toLocaleDateString(),
          user: project.createdBy || 'System',
          status: project.status
        });
      }
    });
    
    // Recent task activities with better context
    tasks.forEach(task => {
      const timestamp = task.updatedAt || task.createdAt;
      if (timestamp) {
        const activityTime = new Date(timestamp);
        const timeDiff = now - activityTime;
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        let actionText = 'updated';
        if (task.status === 'COMPLETED') actionText = 'completed';
        else if (task.status === 'IN_PROGRESS') actionText = 'started work on';
        
        activities.push({
          id: `task-${task._id || task.id}`,
          type: 'task',
          title: `${task.assignedTo || 'Someone'} ${actionText} "${task.title}"`,
          description: `${task.projectName ? `Project: ${task.projectName} • ` : ''}Priority: ${task.priority}`,
          timestamp: timestamp,
          timeAgo: hoursAgo < 24 ? `${hoursAgo}h ago` : new Date(timestamp).toLocaleDateString(),
          user: task.assignedTo || task.createdBy || 'System',
          priority: task.priority,
          status: task.status
        });
      }
    });
    
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
  };

  const calculateProjectProgress = (projects, tasks) => {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === (project._id || project.id));
      const completedTasks = projectTasks.filter(task => 
        task.status === 'COMPLETED' || task.status === 'Done'
      );
      const inProgressTasks = projectTasks.filter(task => 
        task.status === 'IN_PROGRESS' || task.status === 'In Progress' || task.status === 'ACTIVE'
      );
      
      const progress = projectTasks.length > 0 
        ? Math.round((completedTasks.length / projectTasks.length) * 100) 
        : 0;
      
      // Determine project health
      let health = 'good';
      const overdueTasksCount = projectTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && 
        task.status !== 'COMPLETED' && task.status !== 'Done'
      ).length;
      
      if (overdueTasksCount > 0) health = 'at-risk';
      if (progress === 0 && projectTasks.length > 0) health = 'behind';
      if (progress === 100) health = 'completed';
      
      return {
        ...project,
        progress,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasksCount,
        health,
        lastActivity: projectTasks.length > 0 
          ? Math.max(...projectTasks.map(t => new Date(t.updatedAt || t.createdAt || 0).getTime()))
          : new Date(project.updatedAt || project.createdAt || 0).getTime()
      };
    }).sort((a, b) => b.lastActivity - a.lastActivity);
  };

  const calculateTasksByPriority = (tasks) => {
    const activeTasks = tasks.filter(t => 
      t.status !== 'COMPLETED' && t.status !== 'Done'
    );
    
    const priorityCount = {
      HIGH: activeTasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: activeTasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: activeTasks.filter(t => t.priority === 'LOW').length
    };
    
    const statusBreakdown = {
      todo: tasks.filter(t => t.status === 'TODO' || t.status === 'Planning').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'In Progress' || t.status === 'ACTIVE').length,
      completed: tasks.filter(t => t.status === 'COMPLETED' || t.status === 'Done').length
    };
    
    return {
      byPriority: [
        { name: 'High Priority', value: priorityCount.HIGH, color: '#ef4444', percentage: activeTasks.length > 0 ? Math.round((priorityCount.HIGH / activeTasks.length) * 100) : 0 },
        { name: 'Medium Priority', value: priorityCount.MEDIUM, color: '#f59e0b', percentage: activeTasks.length > 0 ? Math.round((priorityCount.MEDIUM / activeTasks.length) * 100) : 0 },
        { name: 'Low Priority', value: priorityCount.LOW, color: '#10b981', percentage: activeTasks.length > 0 ? Math.round((priorityCount.LOW / activeTasks.length) * 100) : 0 }
      ],
      byStatus: [
        { name: 'To Do', value: statusBreakdown.todo, color: '#6b7280' },
        { name: 'In Progress', value: statusBreakdown.inProgress, color: '#3b82f6' },
        { name: 'Completed', value: statusBreakdown.completed, color: '#10b981' }
      ],
      totalActive: activeTasks.length,
      totalTasks: tasks.length
    };
  };

  const getUpcomingDeadlines = (tasks) => {
    const now = new Date();
    const upcomingTasks = tasks
      .filter(task => 
        task.dueDate && 
        task.status !== 'COMPLETED' && task.status !== 'Done'
      )
      .map(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate - now;
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        let urgency = 'normal';
        if (daysUntilDue < 0) urgency = 'overdue';
        else if (daysUntilDue <= 1) urgency = 'critical';
        else if (daysUntilDue <= 3) urgency = 'urgent';
        else if (daysUntilDue <= 7) urgency = 'warning';
        
        return {
          ...task,
          daysUntilDue,
          urgency,
          dueDateFormatted: dueDate.toLocaleDateString(),
          isOverdue: daysUntilDue < 0
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 8);
    
    return upcomingTasks;
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Loading dashboard...</h2>
              <p className="text-slate-500">Fetching real-time data from MongoDB</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Dashboard Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.userdata?.displayName || user?.email}!
              </h1>
              <p className="text-slate-600 mt-1">
                Here's what's happening with your projects and tasks
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-slate-500">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Last updated: {dashboardData.lastUpdated}
              </div>
              <Link to="/tasks">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-900">{dashboardData.totalProjects}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {dashboardData.activeProjects} active, {dashboardData.completedProjects} completed
                  </p>
                </div>
                <div className="relative">
                  <FolderOpen className="h-10 w-10 text-blue-600" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Task Progress</p>
                  <p className="text-3xl font-bold text-green-900">
                    {dashboardData.totalTasks > 0 ? Math.round((dashboardData.completedTasks / dashboardData.totalTasks) * 100) : 0}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {dashboardData.completedTasks} of {dashboardData.totalTasks} completed
                  </p>
                </div>
                <div className="relative">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Active Tasks</p>
                  <p className="text-3xl font-bold text-purple-900">{dashboardData.inProgressTasks}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {dashboardData.todoTasks} pending to start
                  </p>
                </div>
                <div className="relative">
                  <CheckSquare className="h-10 w-10 text-purple-600" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-red-900">{dashboardData.overdueTasks}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Require immediate attention
                  </p>
                </div>
                <div className="relative">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                  {dashboardData.overdueTasks > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-bounce"></div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Progress */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Project Progress
                </h3>
                <Link to="/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Projects
                </Link>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dashboardData.projectProgress.length > 0 ? (
                  dashboardData.projectProgress.slice(0, 6).map((project) => (
                    <div key={project._id || project.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{project.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {project.totalTasks} tasks • {project.completedTasks} completed • {project.inProgressTasks} in progress
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.health === 'completed' ? 'bg-green-100 text-green-700' :
                            project.health === 'good' ? 'bg-blue-100 text-blue-700' :
                            project.health === 'at-risk' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {project.health === 'completed' ? 'Completed' :
                             project.health === 'good' ? 'On Track' :
                             project.health === 'at-risk' ? 'At Risk' : 'Behind'}
                          </span>
                          <Link 
                            to={`/projects/${project._id || project.id}`}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={project.progress} className="flex-1" />
                        <span className="text-sm font-medium text-slate-600 min-w-0">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No projects found</p>
                    <Link to="/projects">
                      <Button className="mt-3" size="sm">Create First Project</Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activities
                </h3>
                <div className="flex items-center text-xs text-slate-500">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Live updates
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'project' ? (
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <FolderOpen className={`h-4 w-4 ${
                              activity.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                          </div>
                        ) : (
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.priority === 'HIGH' ? 'bg-red-100' : 
                            activity.priority === 'MEDIUM' ? 'bg-orange-100' : 'bg-green-100'
                          }`}>
                            <CheckSquare className={`h-4 w-4 ${
                              activity.priority === 'HIGH' ? 'text-red-600' : 
                              activity.priority === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'
                            }`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 leading-5">{activity.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">{activity.timeAgo}</span>
                          <span className="text-xs font-medium text-slate-600">{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activities</p>
                    <p className="text-xs text-slate-400 mt-1">Activity will appear here as you work on projects</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          {dashboardData.upcomingDeadlines.length > 0 && (
            <Card className="mt-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Timer className="h-5 w-5 mr-2 text-orange-600" />
                  Upcoming Deadlines
                </h3>
                <Link to="/tasks" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Manage Tasks
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.upcomingDeadlines.slice(0, 4).map((task) => (
                  <div key={task._id || task.id} className={`p-4 rounded-lg border ${
                    task.urgency === 'overdue' ? 'bg-red-50 border-red-200' :
                    task.urgency === 'critical' ? 'bg-orange-50 border-orange-200' :
                    task.urgency === 'urgent' ? 'bg-yellow-50 border-yellow-200' :
                    task.urgency === 'warning' ? 'bg-blue-50 border-blue-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900 text-sm leading-5">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.urgency === 'overdue' ? 'bg-red-100 text-red-700' :
                        task.urgency === 'critical' ? 'bg-orange-100 text-orange-700' :
                        task.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-700' :
                        task.urgency === 'warning' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.isOverdue ? 'Overdue' : `${task.daysUntilDue}d`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{task.projectName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{task.dueDateFormatted}</span>
                      <span className={`text-xs font-medium ${
                        task.priority === 'HIGH' ? 'text-red-600' :
                        task.priority === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;