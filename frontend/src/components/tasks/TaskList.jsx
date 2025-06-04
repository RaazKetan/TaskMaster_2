import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TaskDetail from './TaskDetail';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // First get user's teams
      const teamsResponse = await api.get('/teams');
      const teams = teamsResponse.data || [];
      
      // Get all projects from user's teams
      const allProjects = [];
      for (const team of teams) {
        try {
          const projectsResponse = await api.get(`/projects/team/${team.id}`);
          const teamProjects = projectsResponse.data || [];
          allProjects.push(...teamProjects.map(p => ({ ...p, teamName: team.name })));
        } catch (err) {
          console.error(`Error fetching projects for team ${team.id}:`, err);
        }
      }
      setProjects(allProjects);
      
      // Get all tasks from all projects
      const allTasks = [];
      for (const project of allProjects) {
        try {
          const tasksResponse = await api.get(`/tasks/project/${project.id}`);
          const projectTasks = tasksResponse.data || [];
          allTasks.push(...projectTasks.map(t => ({ 
            ...t, 
            projectName: project.name,
            teamName: project.teamName 
          })));
        } catch (err) {
          console.error(`Error fetching tasks for project ${project.id}:`, err);
        }
      }
      
      setTasks(allTasks);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'assigned') return task.assigneeId === user?.id;
    if (filter === 'created') return task.reporterId === user?.id;
    return task.status === filter;
  });

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? { ...updatedTask, projectName: task.projectName, teamName: task.teamName } : task
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your assigned and created tasks
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'assigned', label: 'Assigned to Me' },
          { key: 'created', label: 'Created by Me' },
          { key: 'TODO', label: 'To Do' },
          { key: 'IN_PROGRESS', label: 'In Progress' },
          { key: 'DONE', label: 'Done' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-tasks text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {filter === 'all' ? 'No tasks found' : `No ${filter.toLowerCase()} tasks`}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'all' 
              ? 'No tasks available in your projects'
              : `No tasks matching the ${filter.toLowerCase()} filter`
            }
          </p>
          <Link to="/projects" className="btn btn-primary btn-lg">
            <i className="fas fa-plus mr-2"></i>
            Go to Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div className="card-content p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[task.status]}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {task.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <i className="fas fa-project-diagram mr-1"></i>
                        {task.projectName}
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-users mr-1"></i>
                        {task.teamName}
                      </div>
                      {task.deadline && (
                        <div className="flex items-center">
                          <i className="fas fa-calendar mr-1"></i>
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {task.assigneeId === user?.id && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Assigned to me
                      </span>
                    )}
                    {task.reporterId === user?.id && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Created by me
                      </span>
                    )}
                    <i className="fas fa-chevron-right text-muted-foreground"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default TaskList;
