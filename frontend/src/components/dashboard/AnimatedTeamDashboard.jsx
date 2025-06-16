import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Users, 
  FolderOpen, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Target,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import RealTimeIndicator from '../ui/RealTimeIndicator';
import LoadingMascot from '../common/LoadingMascot';
import TaskLoadingCard from '../common/TaskLoadingCard';
// Removed collaboration components - not needed for core functionality
import api from '../../services/api';

const AnimatedTeamDashboard = ({ publicData = null, isPublicView = false }) => {
  const [loading, setLoading] = useState(true);
  // Use publicData if provided (for public view), otherwise fetch from API
  const [dashboardData, setDashboardData] = useState(publicData || {
    teams: 0,
    projects: 0,
    tasks: 0
  });

  // Update dashboard data when publicData changes
  useEffect(() => {
    if (publicData && isPublicView) {
      setDashboardData(publicData);
    }
  }, [publicData, isPublicView]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get current user from localStorage
        const userData = localStorage.getItem('userData');
        const currentUser = userData ? JSON.parse(userData) : null;
        console.log('::::::Current user:', currentUser)
        if (!currentUser || !currentUser.userId) {
          setLoading(false);
          return;
        }

        const userId = currentUser.userId;

        // Fetch real data from MongoDB APIs
        const [teamsResponse, projectsResponse, tasksResponse] = await Promise.all([
          api.get('/teams', { params: { userId } }),
          api.get('/projects', { params: { userId } }),
          api.get('/tasks', { params: { userId } })
        ]);

        const teams = teamsResponse.data || [];
        const allProjects = projectsResponse.data || [];
        const allTasks = tasksResponse.data || [];

        console.log('Animated dashboard MongoDB data:', {
          teams: teams.length,
          projects: allProjects.length,
          tasks: allTasks.length
        });

        // Calculate dashboard statistics from real MongoDB data
        // --- Completed Tasks This Month ---
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedTasksThisMonth = allTasks.filter(task => {
          const isCompleted = ['COMPLETED', 'Done', 'completed', 'DONE'].includes((task.status || '').toUpperCase());
          const completedAt = task.completedAt ? new Date(task.completedAt) : (task.updatedAt ? new Date(task.updatedAt) : null);
          return isCompleted && completedAt && completedAt >= startOfMonth && completedAt <= now;
        }).length;

        const stats = {
          totalTeams: teams.length,
          totalProjects: allProjects.length,
          completedTasks: completedTasksThisMonth, // Show only this month's completed tasks
          activeUsers: teams.reduce((acc, team) => acc + (Array.isArray(team.members) ? team.members.length : 0), 0)
        };

        // --- Team Performance ---
        // Build a map of teamId to teamName for quick lookup
        const teamIdToName = {};
        teams.forEach(team => {
          const id = (team._id || team.id || '').toString();
          if (id) teamIdToName[id] = team.name || team.teamName || 'Unknown Team';
        });
        // Collect all unique teamIds from projects (in case some teams are missing)
        const allTeamIds = new Set([
          ...teams.map(t => (t._id || t.id || '').toString()),
          ...allProjects.map(p => (p.teamId || '').toString())
        ]);
        const teamPerformance = Array.from(allTeamIds).map(teamId => {
          const teamName = teamIdToName[teamId] || 'Unknown Team';
          const teamProjects = allProjects.filter(p => (p.teamId || '').toString() === teamId);
          const completedProjects = teamProjects.filter(p => (p.status || '').toLowerCase() === 'completed' || (p.status || '').toLowerCase() === 'done');
          const inProgressProjects = teamProjects.filter(p => {
            const status = (p.status || '').toLowerCase();
            return status === 'in_progress' || status === 'in progress' || status === 'active';
          });
          const completionRate = teamProjects.length > 0 ? Math.round((completedProjects.length / teamProjects.length) * 100) : 0;
          let efficiency = 0;
          if (teamProjects.length > 0) {
            const avgProgress = teamProjects.reduce((sum, project) => sum + (project.progress || 0), 0) / teamProjects.length;
            efficiency = Math.round((completionRate * 0.6) + (avgProgress * 0.4));
          }
          return {
            name: teamName.length > 12 ? teamName.substring(0, 12) + '...' : teamName,
            projects: teamProjects.length,
            completed: completedProjects.length,
            inProgress: inProgressProjects.length,
            efficiency: Math.max(efficiency, 0),
            completionRate
          };
        });

        // --- Completed Progress (overall) ---
        const totalProjects = allProjects.length;
        const totalCompletedProjects = allProjects.filter(p => (p.status || '').toLowerCase() === 'completed' || (p.status || '').toLowerCase() === 'done').length;
        const completedProgressPercent = totalProjects > 0 ? Math.round((totalCompletedProjects / totalProjects) * 100) : 0;

        // --- Weekly Activity ---
        // For each of the last 7 days, count tasks and projects created/updated
        const today = new Date();
        const activityData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          // Tasks created/updated on this day
          const tasksOnDay = allTasks.filter(task => {
            const created = task.createdAt ? new Date(task.createdAt) : null;
            const updated = task.updatedAt ? new Date(task.updatedAt) : null;
            return (created && created.toDateString() === date.toDateString()) ||
                   (updated && updated.toDateString() === date.toDateString());
          });
          // Projects created/updated on this day
          const projectsOnDay = allProjects.filter(project => {
            const created = project.createdAt ? new Date(project.createdAt) : null;
            const updated = project.updatedAt ? new Date(project.updatedAt) : null;
            return (created && created.toDateString() === date.toDateString()) ||
                   (updated && updated.toDateString() === date.toDateString());
          });
          return {
            date: dayStr,
            tasks: tasksOnDay.length,
            projects: projectsOnDay.length
          };
        });

        // --- Team Efficiency ---
        // Already calculated as 'efficiency' in teamPerformance, used in LineChart

        // --- Project Status Distribution ---
        const statusCounts = {
          'In Progress': 0,
          'Planning': 0,
          'Completed': 0,
          'On Hold': 0
        };
        allProjects.forEach(project => {
          const status = (project.status || '').toLowerCase();
          if (status === 'completed' || status === 'done') statusCounts['Completed']++;
          else if (status === 'planning') statusCounts['Planning']++;
          else if (status === 'on hold') statusCounts['On Hold']++;
          else statusCounts['In Progress']++;
        });
        const projectStatus = Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count,
          percentage: allProjects.length > 0 ? Math.round((count / allProjects.length) * 100) : 0
        }));

        // --- Priority Distribution ---
        const priorityCounts = { High: 0, Medium: 0, Low: 0 };
        allProjects.forEach(project => {
          const priority = (project.priority || '').toLowerCase();
          if (priority === 'high') priorityCounts.High++;
          else if (priority === 'low') priorityCounts.Low++;
          else priorityCounts.Medium++;
        });
        const priorityDistribution = [
          { name: 'High', value: priorityCounts.High, color: '#ef4444' },
          { name: 'Medium', value: priorityCounts.Medium, color: '#f59e0b' },
          { name: 'Low', value: priorityCounts.Low, color: '#10b981' }
        ];

        setDashboardData({
          stats: {
            ...stats,
            completedProgressPercent // add this for use in UI if needed
          },
          teamPerformance,
          projectStatus,
          activityData,
          priorityDistribution
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          stats: {
            totalTeams: 0,
            totalProjects: 0,
            completedTasks: 0,
            activeUsers: 0
          },
          teamPerformance: [],
          projectStatus: [],
          activityData: [],
          priorityDistribution: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">TaskMaster</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <LoadingMascot 
              message="Analyzing team performance..." 
              size="large"
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <TaskLoadingCard title="Calculating team metrics..." />
              <TaskLoadingCard title="Processing project data..." />
              <TaskLoadingCard title="Generating visualizations..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <motion.div {...fadeInUp}>
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <div className="text-3xl font-bold text-slate-900">
                <CountUp end={value} duration={2} />
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
          <motion.div 
            className={`absolute bottom-0 left-0 h-1 bg-${color}-500`}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  const projectStatusColors = {
    'In Progress': '#3b82f6',
    'Planning': '#8b5cf6',
    'Completed': '#10b981',
    'On Hold': '#6b7280'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">TaskMaster</span>
          </div> */}
          <div className="flex items-center space-x-4">
            <RealTimeIndicator 
              isConnected={true} 
              activeUsers={dashboardData.stats.activeUsers}
            />
            <div className="text-sm text-slate-600">
              Team Dashboard
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <motion.div 
          className="max-w-7xl mx-auto space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Page Header */}
          <motion.div {...fadeInUp}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Dashboard</h1>
                <p className="text-slate-600">Monitor team performance and project progress</p>
              </div>
              {!isPublicView && (
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const userData = localStorage.getItem('userData');
                        const currentUser = userData ? JSON.parse(userData) : null;

                        if (!currentUser || !currentUser.userId) {
                          alert('Please log in to share your dashboard');
                          return;
                        }

                        const response = await api.post('/dashboard/share', { userId: currentUser.userId });
                        const shareId = response.data.shareId;

                        // Create universal URL
                        const currentOrigin = window.location.origin;
                        const universalShareUrl = `${currentOrigin}/public/dashboard/${shareId}`;

                        await navigator.clipboard.writeText(universalShareUrl);
                        alert(`Dashboard link copied to clipboard!\n\n${universalShareUrl}\n\nAnyone with this link can view your dashboard for 30 days.`);
                      } catch (error) {
                        console.error('Error sharing dashboard:', error);
                        alert('Failed to create shareable link. Please try again.');
                      }
                    }}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            <StatCard
              icon={Users}
              title="Active Teams"
              value={dashboardData.stats.totalTeams}
              subtitle="Teams currently working"
              color="blue"
            />
            <StatCard
              icon={FolderOpen}
              title="Total Projects"
              value={dashboardData.stats.totalProjects}
              subtitle="Projects in progress"
              color="green"
            />
            <StatCard
              icon={CheckCircle}
              title="Completed Tasks"
              value={dashboardData.stats.completedTasks}
              subtitle="Tasks finished this month"
              color="purple"
            />
            <StatCard
              icon={Activity}
              title="Active Users"
              value={dashboardData.stats.activeUsers}
              subtitle="Users online today"
              color="orange"
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Performance Chart */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Team Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.teamPerformance.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">No team performance data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.teamPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value, name, props) => {
                          if (props.dataKey === 'projects') return [`${value}`, 'Total Projects'];
                          if (props.dataKey === 'completed') return [`${value}`, 'Completed Projects'];
                          if (props.dataKey === 'inProgress') return [`${value}`, 'In Progress Projects'];
                          return [`${value}`, name];
                        }} />
                        <Bar dataKey="projects" fill="#3b82f6" name="Total Projects" />
                        <Bar dataKey="completed" fill="#10b981" name="Completed Projects" />
                        <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress Projects" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Status Distribution */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Project Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.projectStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.projectStatus.map((entry, index) => (
                          <Cell key={`cell-${entry.name}-${index}`} fill={projectStatusColors[entry.name] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Timeline */}
          <motion.div {...fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => {
                        if (name === 'Tasks') return [`${value}`, 'Tasks Created/Updated'];
                        if (name === 'Projects') return [`${value}`, 'Projects Created/Updated'];
                        return [`${value}`, name];
                      }} />
                    <Area 
                      type="monotone" 
                      dataKey="tasks" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Tasks"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="projects" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Projects"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
          </Card>
            </motion.div>

          {/* Priority Distribution & Team Efficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.priorityDistribution.map((priority, index) => (
                    <div key={`priority-${priority.name}-${index}`} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{priority.name} Priority</span>
                        <span className="text-slate-600">{priority.value} projects</span>
                      </div>
                      <motion.div
                        key={`progress-${priority.name}-${index}`}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      >
                        <Progress 
                          value={(priority.value / dashboardData.stats.totalProjects) * 100} 
                          className="h-2"
                        />
                      </motion.div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Team Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dashboardData.teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Project Efficiency (Completion Rate + Progress)']} />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedTeamDashboard;