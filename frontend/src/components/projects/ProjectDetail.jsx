import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CreateTask from '../tasks/CreateTask';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectResponse, tasksResponse] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);

      const projectData = projectResponse.data;
      setProject(projectData);
      setTasks(tasksResponse.data || []);

      // Fetch team data
      if (projectData.teamId) {
        const teamResponse = await api.get(`/teams/${projectData.teamId}`);
        setTeam(teamResponse.data);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch project data');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowCreateTaskModal(false);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const canManageProject = () => {
    if (!project || !team || !user) return false;
    return project.ownerId === user.id || 
           team.ownerId === user.id || 
           team.members?.some(m => m.userId === user.id && m.role === 'ADMIN');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">Project not found</h3>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold text-foreground mr-4">{project.name}</h1>
            <span className={`text-sm px-3 py-1 rounded-full border ${PRIORITY_COLORS[project.priority]}`}>
              {project.priority}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full border ml-2 ${STATUS_COLORS[project.status]}`}>
              {project.status}
            </span>
          </div>
          <p className="text-muted-foreground">
            Team: {team?.name || 'Loading...'} • {tasks.length} tasks • {getCompletionPercentage()}% complete
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to={`/projects/${id}/kanban`}
            className="btn btn-outline btn-md"
          >
            <i className="fas fa-columns mr-2"></i>
            Kanban Board
          </Link>
          {canManageProject() && (
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="btn btn-primary btn-md"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Project Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Overview</h3>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground mb-4">
                {project.description || 'No description provided for this project.'}
              </p>
              
              {project.deadline && (
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <i className="fas fa-calendar mr-2"></i>
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progress</span>
                  <span className="text-sm text-muted-foreground">{getCompletionPercentage()}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Task Overview</h3>
            </div>
            <div className="card-content">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-tasks text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground mb-4">No tasks yet</p>
                  {canManageProject() && (
                    <button
                      onClick={() => setShowCreateTaskModal(true)}
                      className="btn btn-primary btn-sm"
                    >
                      Create First Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">To Do</h4>
                    <p className="text-2xl font-bold text-foreground">{getTasksByStatus('TODO').length}</p>
                    <div className="space-y-2 mt-3">
                      {getTasksByStatus('TODO').slice(0, 3).map((task) => (
                        <div key={task.id} className="text-sm text-muted-foreground">
                          {task.title}
                        </div>
                      ))}
                      {getTasksByStatus('TODO').length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{getTasksByStatus('TODO').length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">In Progress</h4>
                    <p className="text-2xl font-bold text-foreground">{getTasksByStatus('IN_PROGRESS').length}</p>
                    <div className="space-y-2 mt-3">
                      {getTasksByStatus('IN_PROGRESS').slice(0, 3).map((task) => (
                        <div key={task.id} className="text-sm text-muted-foreground">
                          {task.title}
                        </div>
                      ))}
                      {getTasksByStatus('IN_PROGRESS').length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{getTasksByStatus('IN_PROGRESS').length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Done</h4>
                    <p className="text-2xl font-bold text-foreground">{getTasksByStatus('DONE').length}</p>
                    <div className="space-y-2 mt-3">
                      {getTasksByStatus('DONE').slice(0, 3).map((task) => (
                        <div key={task.id} className="text-sm text-muted-foreground">
                          {task.title}
                        </div>
                      ))}
                      {getTasksByStatus('DONE').length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{getTasksByStatus('DONE').length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Statistics</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tasks</span>
                  <span className="font-medium text-foreground">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-foreground">{getTasksByStatus('DONE').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-medium text-foreground">{getTasksByStatus('IN_PROGRESS').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">To Do</span>
                  <span className="font-medium text-foreground">{getTasksByStatus('TODO').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Tasks</h3>
            </div>
            <div className="card-content">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[task.status]}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateTaskModal && (
        <CreateTask
          projectId={id}
          teamMembers={team?.members || []}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
