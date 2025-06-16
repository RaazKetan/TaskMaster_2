import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, User, Calendar, Search, Clock, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { PRIORITY_COLORS } from '../../utils/constants';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import QuickAddTask from './QuickAddTask';
import FloatingQuickAdd from './FloatingQuickAdd';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/auth';
import { motion } from 'framer-motion';
import { useTasks } from '../../context/TaskContext';

const TaskManagement = () => {
  const { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTasks();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [inlineEditingTask, setInlineEditingTask] = useState(null);
  const [inlineEditValue, setInlineEditValue] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Only fetch projects here, tasks come from context
  const fetchProjects = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;
      const projectsResponse = await api.get('/projects', { params: { userId } });
      setProjects(projectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleTaskPriorityUpdate = async (taskId, newPriority) => {
    try {
      const userId = getCurrentUserId();
      const task = tasks.find(t => (t._id || t.id) === taskId);

      const updateData = {
        userId: userId,
        priority: newPriority,
        title: task.title,
        description: task.description || '',
        status: task.status,
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate || '',
        projectId: task.projectId
      };

      await api.put(`/tasks/${taskId}`, updateData);
      
      // Update task in context
      await updateTask(taskId, { ...task, priority: newPriority });
    } catch (error) {
      console.error('Error updating task priority:', error);
      // Revert the UI change if API call fails
      fetchTasks();
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => (t._id || t.id) === taskId);
      const userId = getCurrentUserId();
      const currentDate = new Date().toISOString();

      // Determine which date field to update based on status
      let statusDates = {};
      if (newStatus === 'IN_PROGRESS') {
        statusDates.startedAt = currentDate;
      } else if (newStatus === 'REVIEW') {
        statusDates.reviewedAt = currentDate;
      } else if (newStatus === 'COMPLETED') {
        statusDates.completedAt = currentDate;
      }

      const updateData = {
        userId: userId,
        status: newStatus,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        ...statusDates
      };

      // Update in context and backend
      await updateTask(taskId, { ...task, ...updateData });

      // After updating a task status, also update the project progress in the local state
      const updateProjectProgressInState = (projectId, progress, status) => {
        setProjects(prevProjects => prevProjects.map(project => {
          if ((project._id || project.id) === projectId) {
            return { ...project, progress, status };
          }
          return project;
        }));
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
            projectStatus = 'ACTIVE';
          }

          await api.put(`/projects/${task.projectId}`, {
            status: projectStatus,
            progress: progress,
            userId: getCurrentUserId()
          });
          // Update local state immediately
          updateProjectProgressInState(task.projectId, progress, projectStatus);
        } catch (error) {
          console.error('Error updating project status:', error);
        }
      };

      updateProjectStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert the UI change if API call fails
      fetchTasks();
    }
  };


  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      setShowDeleteDialog(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setShowDeleteDialog(false);
      setTaskToDelete(null);
    }
  };
  const cancelDeleteTask = () => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  };

  const handleInlineEdit = (task) => {
    setInlineEditingTask(task._id || task.id);
    setInlineEditValue(task.title || task.name);
  };

  const handleInlineEditSave = async (taskId) => {
    if (!inlineEditValue.trim()) return;
    try {
      const task = tasks.find(t => (t._id || t.id) === taskId);
      const userId = getCurrentUserId();
      
      const updateData = {
        userId: userId,
        title: inlineEditValue.trim(),
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate || '',
        projectId: task.projectId
      };

      // Update in context first
      await updateTask(taskId, { ...task, title: inlineEditValue.trim() });
      
      // Then sync with backend
      await api.put(`/tasks/${taskId}`, updateData);
      
      setInlineEditingTask(null);
      setInlineEditValue('');
    } catch (error) {
      console.error('Error updating task title:', error);
      // Revert if there's an error
      fetchTasks();
    }
  };

  const handleInlineEditCancel = () => {
    setInlineEditingTask(null);
    setInlineEditValue('');
  };

  const handleQuickPriorityChange = async (taskId, newPriority) => {
    await handleTaskPriorityUpdate(taskId, newPriority);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const taskTitle = task.title || task.name || '';
    const taskDescription = task.description || '';
    const searchTermLower = searchTerm ? searchTerm.toLowerCase() : '';
    const matchesSearch = taskTitle.toLowerCase().includes(searchTermLower) ||
                         taskDescription.toLowerCase().includes(searchTermLower);
    return matchesProject && matchesStatus && matchesSearch;
  });

  const TaskCard = ({ task }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'task',
      item: {
        id: task._id || task.id,
        priority: task.priority,
        status: task.status
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const project = projects.find(p => (p._id || p.id) === task.projectId);
    const priorityColor = PRIORITY_COLORS[task.priority] || '#6B7280';
    const isCompleted = task.status === 'COMPLETED';

    const handleCheckboxChange = async (checked) => {
      const newStatus = checked ? 'COMPLETED' : 'TODO';
      await handleTaskStatusUpdate(task._id || task.id, newStatus);
    };

    return (
      <motion.div
        ref={drag}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{  y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.10)" }}
       
      >
        <Card
          className={`cursor-move transition-all duration-200 hover:shadow-lg mb-3 ${
            isDragging ? 'opacity-50 rotate-2 scale-105 shadow-2xl' : ''
          } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
          style={{ borderLeft: `4px solid ${priorityColor}` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-2">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className=" w-4 h-4 mt-1 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  {inlineEditingTask === (task._id || task.id) ? (
                    <div className="flex-1 mr-2">
                      <Input
                        value={inlineEditValue}
                        onChange={(e) => setInlineEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleInlineEditSave(task._id || task.id);
                          } else if (e.key === 'Escape') {
                            handleInlineEditCancel();
                          }
                        }}
                        onBlur={() => handleInlineEditSave(task._id || task.id)}
                        className="text-sm font-semibold"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3 
                      className={`font-semibold text-sm leading-tight cursor-pointer hover:text-blue-600 transition-colors flex-1 ${
                        isCompleted ? 'text-green-700 line-through' : 'text-slate-900'
                      }`}
                      onClick={() => handleInlineEdit(task)}
                      title="Click to edit title"
                    >
                      {task.title || task.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-1">
                    <select
                      value={task.priority}
                      onChange={(e) => handleQuickPriorityChange(task._id || task.id, e.target.value)}
                      className="text-xs font-medium bg-transparent border-0 cursor-pointer"
                      style={{ color: priorityColor }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>
                <p className={`text-xs mb-3 line-clamp-2 ${
                  isCompleted ? 'text-green-600' : 'text-slate-600'
                }`}>
                  {task.description}
                </p>
                <div className="flex items-center justify-between mb-2 text-xs text-slate-500 ">
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
                    <span className="px-2 py-1  text-xs font-medium  text-blue-800 bg-blue-100 rounded    ">
                      {project.name}
                    </span>
                  )}
                </div>
                
                {/* Status Date Information */}
                {(task.startedAt || task.reviewedAt || task.completedAt) && (
                  <div className="mb-2 text-xs text-slate-400 ">
                    {task.status === 'IN_PROGRESS' && task.startedAt && (
                      <span>Started: {new Date(task.startedAt).toLocaleDateString()}</span>
                    )}
                    {task.status === 'REVIEW' && task.reviewedAt && (
                      <span>In Review: {new Date(task.reviewedAt).toLocaleDateString()}</span>
                    )}
                    {task.status === 'COMPLETED' && task.completedAt && (
                      <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${isCompleted ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {task.status === 'IN_PROGRESS' ? 'In Progress' :
                     task.status === 'COMPLETED' ? 'Completed' :
                     task.status === 'REVIEW' ? 'Review' : 'To Do'}
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInlineEdit(task);
                      }}
                      className="px-2 py-1 text-xs  text-blue-500 transition-colors rounded  hover:text-blue-700  bg-blue-50 hover:bg-blue-100 "
                      title="Quick edit title"
                    >
                      Quick Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                      className="px-1 py-1 text-xs transition-colors rounded text-slate-500 hover:text-slate-700  hover:bg-slate-100 "
                      title="Full edit form"
                    >
                      ⚙️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task._id || task.id);
                      }}
                      className="px-1 py-1 text-xs  text-red-500 transition-colors rounded hover:text-red-700  bg-blue-50 hover:bg-red-100 "
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const StatusColumn = ({ status, title, tasks, icon: Icon, color }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'task',
      drop: async (item) => {
        if (item.status !== status) {
          try {
            const currentDate = new Date().toISOString();
            let statusDates = {};
            
            // Determine which date field to update based on status
            if (status === 'IN_PROGRESS') {
              statusDates.startedAt = currentDate;
            } else if (status === 'REVIEW') {
              statusDates.reviewedAt = currentDate;
            } else if (status === 'COMPLETED') {
              statusDates.completedAt = currentDate;
            }

            // Update immediately in UI for better UX
            const taskToUpdate = tasks.find(t => (t._id || t.id) === item.id);
            if (taskToUpdate) {
              await updateTask(item.id, { 
                ...taskToUpdate, 
                status: status, 
                updatedAt: currentDate,
                ...statusDates 
              });
            }
            // Then sync with backend
            await handleTaskStatusUpdate(item.id, status);
          } catch (error) {
            console.error('Error in drag and drop:', error);
            // Revert if there's an error
            fetchTasks();
          }
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
            className="py-8 text-center  text-slate-400"
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
          <div className="mx-auto max-w-7xl ">
            <div className="py-12 text-center ">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600  rounded-full  animate-spin"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h2 className="mb-2 text-xl font-semibold text-slate-700 ">Loading your task board...</h2>
              <p className="text-slate-500">Fetching projects and tasks from database</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" flex items-centerjustify-center  min-h-screen bg-slate-50 ">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-600 ">{error}</p>
            <Button onClick={fetchTasks}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'IN_PROGRESS');
  const reviewTasks = filteredTasks.filter(task => task.status === 'REVIEW');
  const completedTasks = filteredTasks.filter(task => task.status === 'COMPLETED');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="mx-auto max-w-7xl ">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="w-full mb-0 text-3xl font-bold text-slate-900 ">Task Management</h1>
                  <motion.button
                    whileHover={{ scale: 1.04}}
                    whileTap={{ scale:0.97}}                  
                    onClick={() => setShowCreateTask(true)}
                    className="px-3 py-1.5 ml-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md shadow hover:bg-blue-700"
                    style={{ whiteSpace: 'nowrap'}}
                  >
                    <Plus className="inline w-4 h-4 mr-2" />
                    Create Task
                  </motion.button>
                </div>

              {/* Quick Add Task - Inline Version */}
              <QuickAddTask 
                projects={projects} 
                onTaskCreated={(newTask) => {
                  addTask(newTask);
                }}
              />
            </motion.div>

            {/* Filters */}
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.10)" }}
              transition={{ duration: 0.2}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
              
            >
              <Card>
                <CardContent className="flex-items-center justify-center px-4 py-0">
                  <div className="flex flex-wrap items-center justify-center w-full gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400 " />
                      <Input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      className="w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                    >
                      <option value="all">All Projects</option>
                      {projects.map(project => (
                        <option key={project._id || project.id} value={project._id || project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-[180px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
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
                whileHover={{y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.10)"}}
              >
                <Card className="py-12 text-center ">
                  <CardContent>
                    <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="mb-2 text-lg font-semibold text-slate-600 ">No Tasks Yet</h3>
                    <p className="mb-4 text-slate-500 ">Create your first task to get started with priority management</p>
                    <Button onClick={() => setShowCreateTask(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Task
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                className="flex gap-6  pb-6 overflow-x-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StatusColumn
                  status="TODO"
                  title="To Do"
                  tasks={todoTasks}
                  icon={Clock}
                  color="#6B7280"
                />
                <StatusColumn
                  status="IN_PROGRESS"
                  title="In Progress"
                  tasks={inProgressTasks}
                  icon={AlertCircle}
                  color="#3B82F6"
                />
                <StatusColumn
                  status="REVIEW"
                  title="Review"
                  tasks={reviewTasks}
                  icon={AlertTriangle}
                  color="#F59E0B"
                />
                <StatusColumn
                  status="COMPLETED"
                  title="Completed"
                  tasks={completedTasks}
                  icon={CheckCircle}
                  color="#10B981"
                />
              </motion.div>
            )}

            {/* Real-time indicator */}
            <motion.div 
              className="fixed bottom-4 left-4"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center px-3 py-2  space-x-2 text-sm text-green-700 bg-green-100  rounded-full  shadow-lg">
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
          onTaskCreated={addTask}
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

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-sm" onClick={cancelDeleteTask}></div>
            <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto z-10 animate-fade-in-up flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Confirm Task Deletion</h3>
              <p className="text-gray-700 mb-6 text-center">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex w-full justify-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelDeleteTask}
                  className="w-1/2 max-w-[120px] py-2 font-medium rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDeleteTask}
                  className="w-1/2 max-w-[120px] py-2 font-medium rounded-md"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TaskManagement;