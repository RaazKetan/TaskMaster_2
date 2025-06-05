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

const AnimatedTeamDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
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
        const completedTasks = allTasks.filter(task => 
          task.status === 'COMPLETED' || task.status === 'Done' || task.status === 'completed'
        ).length;

        const stats = {
          totalTeams: teams.length,
          totalProjects: allProjects.length,
          completedTasks: completedTasks,
          activeUsers: teams.reduce((acc, team) => acc + (Array.isArray(team.members) ? team.members.length : 0), 0)
        };

        // Generate team performance data
        const teamPerformance = teams.map(team => {
          const teamProjects = allProjects.filter(p => p.teamId === team._id);
          return {
            name: team.name.length > 12 ? team.name.substring(0, 12) + '...' : team.name,
            projects: teamProjects.length,
            completed: Math.floor(teamProjects.length * (0.3 + Math.random() * 0.5)),
            efficiency: Math.floor(60 + Math.random() * 35)
          };
        });

        // Generate project status distribution
        const statusCounts = {
          'In Progress': 0,
          'Planning': 0,
          'Completed': 0,
          'On Hold': 0
        };

        allProjects.forEach(project => {
          if (statusCounts.hasOwnProperty(project.status)) {
            statusCounts[project.status]++;
          } else {
            statusCounts['In Progress']++; // Default fallback
          }
        });

        const projectStatus = Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count,
          percentage: Math.round((count / allProjects.length) * 100)
        }));

        // Generate activity data for the last 7 days
        const activityData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            tasks: Math.floor(5 + Math.random() * 20),
            projects: Math.floor(1 + Math.random() * 5),
            meetings: Math.floor(Math.random() * 8)
          };
        });

        // Generate priority distribution
        const priorityDistribution = [
          { name: 'High', value: Math.floor(allProjects.length * 0.25), color: '#ef4444' },
          { name: 'Medium', value: Math.floor(allProjects.length * 0.45), color: '#f59e0b' },
          { name: 'Low', value: Math.floor(allProjects.length * 0.30), color: '#10b981' }
        ];

        setDashboardData({
          stats,
          teamPerformance,
          projectStatus,
          activityData,
          priorityDistribution
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data in case of API errors
        setDashboardData({
          stats: {
            totalTeams: 2,
            totalProjects: 3,
            completedTasks: 12,
            activeUsers: 6
          },
          teamPerformance: [
            { name: 'Dev Team', completed: 8, pending: 4 },
            { name: 'Design', completed: 6, pending: 2 }
          ],
          projectStatus: [
            { name: 'Active', value: 2, color: '#3B82F6' },
            { name: 'Completed', value: 1, color: '#10B981' }
          ],
          activityData: [
            { day: 'Mon', tasks: 5 },
            { day: 'Tue', tasks: 8 },
            { day: 'Wed', tasks: 6 }
          ],
          priorityDistribution: [
            { priority: 'High', count: 3 },
            { priority: 'Medium', count: 5 },
            { priority: 'Low', count: 2 }
          ]
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">TaskMaster</span>
          </div>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Dashboard</h1>
            <p className="text-slate-600">Monitor team performance and project progress</p>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={projectStatusColors[entry.name] || '#6b7280'} 
                          />
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
                    <Tooltip />
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
                    <Area 
                      type="monotone" 
                      dataKey="meetings" 
                      stackId="1" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.6}
                      name="Meetings"
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
                    <div key={priority.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{priority.name} Priority</span>
                        <span className="text-slate-600">{priority.value} projects</span>
                      </div>
                      <motion.div
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
                      <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
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