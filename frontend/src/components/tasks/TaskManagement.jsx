
import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, User, Calendar, Flag, Filter, Search, Clock, CheckCircle, AlertTriangle, AlertCircle, Zap } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PRIORITY_COLORS, TASK_STATUSES } from '../../utils/constants';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';
import { motion } from 'framer-motion';

const TaskManagement = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const [projectsResponse, tasksResponse] = await Promise.all([
        api.get('/projects', { params: { userId } }),
        api.get('/tasks', { params: { userId } })
      ]);

      const projectsData = projectsResponse.data || [];
      const tasksData = tasksResponse.data || [];

      setProjects(projectsData);
      setTasks(tasksData);
      setError('');
      
      console.log('Projects loaded:', projectsData.length);
      console.log('Tasks loaded:', tasksData.length);
    } catch (error) {
      console.error('Error fetching tasks and projects:', error);
      setError('Failed to load tasks and projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
    
    const interval = setInterval(fetchTasksAndProjects, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskPriorityUpdate = async (taskId, newPriority) => {
    try {
      const userId = getCurrentUserId();
      
      await api.put(`/tasks/${taskId}`, {
        priority: newPriority,
        userId: userId
      });
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          (task._id || task.id) === taskId 
            ? { ...task, priority: newPriority } 
            : task
        )
      );

      console.log(`Task ${taskId} priority updated to ${newPriority}`);
    } catch (error) {
      console.error('Error updating task priority:', error);
      setError('Failed to update task priority');
      fetchTasksAndProjects();
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const userId = getCurrentUserId();
      
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
        userId: userId
      });
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          (task._id || task.id) === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );

      updateProjectStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
      fetchTasksAndProjects();
    }
  };

  const updateProjectStatus = async (taskId, newTaskStatus) => {
    try {
      const task = tasks.find(t => (t._id || t.id) === taskId);
      if (!task || !task.projectId) return;

      const projectTasks = tasks.filter(t => t.projectId === task.projectId);
      let completedTasksCount = projectTasks.filter(t => 
        t.status === 'COMPLETED' || t.status === 'Done'
      ).length;
      
      if (newTaskStatus === 'COMPLETED' || newTaskStatus === 'Done') {
        completedTasksCount += 1;
      }

      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
      
      let projectStatus = 'Planning';
      if (progress === 100) {
        projectStatus = 'COMPLETED';
      } else if (progress > 0) {
        projectStatus = 'IN_PROGRESS';
      }

      await api.put(`/projects/${task.projectId}`, {
        status: projectStatus,
        progress: progress,
        userId: getCurrentUserId()
      });

    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const userId = getCurrentUserId();
      await api.delete(`/tasks/${taskId}`, { params: { userId } });
      setTasks(prev => prev.filter(task => (task._id || task.id) !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      setTasks(prev => prev.map(task => 
        (task._id || task.id) === (updatedTask._id || updatedTask.id) ? updatedTask : task
      ));
      fetchTasksAndProjects();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesSearch = (task.title || task.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesStatus && matchesSearch;
  });

  const TaskCard = ({ task }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'task',
      item: { 
        id: task._id || task.id, 
        priority: task.priority,
        status: task.status 
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      begin: () => {
        setDraggedTask(task);
      },
      end: () => {
        setDraggedTask(null);
      }
    });

    const project = projects.find(p => (p._id || p.id) === task.projectId);
    const priorityColor = PRIORITY_COLORS[task.priority] || '#6B7280';

    return (
      <motion.div 
        ref={drag}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`cursor-move transition-all duration-200 hover:shadow-lg mb-3 ${
            isDragging ? 'opacity-50 rotate-2 scale-105 shadow-2xl' : ''
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
                className="ml-2 text-xs font-medium"
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
            
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
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
            
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                {task.status}
              </Badge>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditTask(task)}
                  className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id || task.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const PriorityColumn = ({ priority, title, tasks, icon: Icon, color }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'task',
      drop: (item) => {
        if (item.priority !== priority) {
          handleTaskPriorityUpdate(item.id, priority);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div 
        ref={drop}
        className={`flex-1 min-h-[600px] transition-all duration-300 ${
          isOver ? 'bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-300 border-dashed scale-[1.02]' : 'bg-slate-50'
        } rounded-lg p-4 shadow-sm`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5" style={{ color }} />
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
          <motion.div 
            className="text-center py-8 text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color }} />
            <p>No {title.toLowerCase()} tasks</p>
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <motion.div 
                className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Loading your task board...</h2>
              <p className="text-slate-500">Fetching projects and tasks from database</p>
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

  // Group tasks by priority
  const urgentTasks = filteredTasks.filter(task => task.priority === 'URGENT');
  const highTasks = filteredTasks.filter(task => task.priority === 'HIGH');
  const mediumTasks = filteredTasks.filter(task => task.priority === 'MEDIUM');
  const lowTasks = filteredTasks.filter(task => task.priority === 'LOW');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Task Management</h1>
              <p className="text-slate-600">Organize tasks by priority and drag to update</p>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
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

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
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
            </motion.div>

            {/* Task Priority Board */}
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Tasks Yet</h3>
                    <p className="text-slate-500 mb-4">Create your first task to get started with priority management</p>
                    <Button onClick={() => setShowCreateTask(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Task
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                className="flex gap-6 overflow-x-auto pb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PriorityColumn
                  priority="URGENT"
                  title="Urgent"
                  tasks={urgentTasks}
                  icon={Zap}
                  color="#DC2626"
                />
                <PriorityColumn
                  priority="HIGH"
                  title="High Priority"
                  tasks={highTasks}
                  icon={AlertTriangle}
                  color="#EA580C"
                />
                <PriorityColumn
                  priority="MEDIUM"
                  title="Medium Priority"
                  tasks={mediumTasks}
                  icon={AlertCircle}
                  color="#D97706"
                />
                <PriorityColumn
                  priority="LOW"
                  title="Low Priority"
                  tasks={lowTasks}
                  icon={Clock}
                  color="#059669"
                />
              </motion.div>
            )}

            {/* Real-time indicator */}
            <motion.div 
              className="fixed bottom-4 right-4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm shadow-lg">
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Live sync</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={(newTask) => {
            setTasks(prev => [...prev, newTask]);
            fetchTasksAndProjects();
          }}
          projects={projects}
        />

        {/* Edit Task Modal */}
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onTaskUpdated={updateTask}
          projects={projects}
        />
      </div>
    </DndProvider>
  );
};

export default TaskManagement;
