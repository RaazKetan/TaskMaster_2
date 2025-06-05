import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, User, Calendar, Flag, Filter, Search, Clock, CheckCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PRIORITY_COLORS, TASK_STATUSES } from '../../utils/constants';
import LoadingMascot, { TaskLoadingCard } from '../ui/LoadingMascot';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';

const TaskManagement = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Fetch projects and tasks
      const [projectsResponse, tasksResponse] = await Promise.all([
        api.get('/projects', { params: { userId } }),
        api.get('/tasks', { params: { userId } })
      ]);

      const projectsData = projectsResponse.data || [];
      const tasksData = tasksResponse.data || [];

      setProjects(projectsData);
      setTasks(tasksData);
      setError('');
    } catch (error) {
      console.error('Error fetching tasks and projects:', error);
      setError('Failed to load tasks and projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
    
    // Real-time updates every 10 seconds
    const interval = setInterval(fetchTasksAndProjects, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const userId = getCurrentUserId();
      
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
        userId: userId
      });
      
      // Update local state immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          (task._id || task.id) === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );

      // Update project status based on task completion
      updateProjectStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task status');
      fetchTasksAndProjects();
    }
  };

  const updateProjectStatus = async (taskId, newTaskStatus) => {
    try {
      const task = tasks.find(t => (t._id || t.id) === taskId);
      if (!task || !task.projectId) return;

      const projectTasks = tasks.filter(t => t.projectId === task.projectId);
      const completedTasks = projectTasks.filter(t => 
        t.status === 'COMPLETED' || t.status === 'Done'
      ).length;
      
      if (newTaskStatus === 'COMPLETED' || newTaskStatus === 'Done') {
        completedTasks += 1;
      }

      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      let projectStatus = 'Planning';
      if (progress === 100) {
        projectStatus = 'COMPLETED';
      } else if (progress > 0) {
        projectStatus = 'IN_PROGRESS';
      }

      // Update project status and progress
      await api.put(`/projects/${task.projectId}`, {
        status: projectStatus,
        progress: progress,
        userId: getCurrentUserId()
      });

    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesSearch = (task.title || task.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesPriority && matchesSearch;
  });

  const TaskCard = ({ task }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'task',
      item: { id: task._id || task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const project = projects.find(p => (p._id || p.id) === task.projectId);
    const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;

    return (
      <div ref={drag}>
        <Card
          className={`cursor-move transition-all duration-200 hover:shadow-md mb-3 ${
            isDragging ? 'opacity-50 rotate-2 scale-105' : ''
          }`}
          style={{ borderLeft: `4px solid ${priorityColor}` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm text-slate-900 leading-tight">
                {task.title || task.name}
              </h3>
              <Badge 
                variant="outline" 
                className="ml-2 text-xs"
                style={{ 
                  backgroundColor: `${priorityColor}20`,
                  borderColor: priorityColor,
                  color: priorityColor 
                }}
              >
                {task.priority}
              </Badge>
            </div>
            
            <p className="text-xs text-slate-600 mb-3 line-clamp-2">
              {task.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                {task.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignedTo}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {project && (
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                  {project.name}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const StatusColumn = ({ status, title, tasks, icon: Icon }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'task',
      drop: (item) => {
        if (item.status !== status) {
          handleTaskStatusUpdate(item.id, status);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div 
        ref={drop}
        className={`flex-1 min-h-[600px] transition-colors duration-200 ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'bg-slate-50'
        } rounded-lg p-4`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task._id || task.id} task={task} />
          ))}
        </div>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No {title.toLowerCase()} tasks</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <LoadingMascot 
              message="Loading your task board..." 
              size="large"
            />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskLoadingCard title="Loading pending tasks..." />
              <TaskLoadingCard title="Organizing in progress..." />
              <TaskLoadingCard title="Counting completed..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchTasksAndProjects}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todoTasks = filteredTasks.filter(task => 
    task.status === 'TODO' || task.status === 'Planning' || task.status === 'PLANNING'
  );
  const inProgressTasks = filteredTasks.filter(task => 
    task.status === 'IN_PROGRESS' || task.status === 'In Progress' || task.status === 'ACTIVE'
  );
  const completedTasks = filteredTasks.filter(task => 
    task.status === 'COMPLETED' || task.status === 'Done' || task.status === 'COMPLETED'
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Task Management</h1>
              <p className="text-slate-600">Organize and track your project tasks</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project._id || project.id} value={project._id || project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="HIGH">High Priority</SelectItem>
                      <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                      <SelectItem value="LOW">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={() => setShowCreateTask(true)}
                    className="ml-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Task Board */}
            <div className="flex gap-6 overflow-x-auto">
              <StatusColumn
                status="TODO"
                title="To Do"
                tasks={todoTasks}
                icon={Clock}
              />
              <StatusColumn
                status="IN_PROGRESS"
                title="In Progress"
                tasks={inProgressTasks}
                icon={Flag}
              />
              <StatusColumn
                status="COMPLETED"
                title="Completed"
                tasks={completedTasks}
                icon={CheckCircle}
              />
            </div>

            {/* Real-time indicator */}
            <div className="fixed bottom-4 right-4">
              <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TaskManagement;