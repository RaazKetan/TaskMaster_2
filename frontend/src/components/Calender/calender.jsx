import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Flag, Edit2, CheckCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, isWithinInterval, differenceInHours, startOfWeek as getStartOfWeek, endOfWeek as getEndOfWeek } from 'date-fns';
import { Button } from '../ui/button';
import { useTasks } from '../../context/TaskContext';
import PropTypes from 'prop-types';


const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const defaultTask = {
  title: '',
  dueDate: '',
  priority: 'Medium',
  assignedTo: '',
};


const priorities = [
  { value: 'High', label: 'High', color: 'text-red-600' },
  { value: 'Medium', label: 'Medium', color: 'text-orange-600' },
  { value: 'Low', label: 'Low', color: 'text-green-600' },
];


function getWeekDays(selectedDate) {
  const start = getStartOfWeek(selectedDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}


const CalendarModal = ({
  isOpen,
  onClose,
  tasks = [],
  onTaskDateChange,
  onTaskCreate,
  onTaskEdit,
  view = 'month',
  setView,
  selectedDate,
  setSelectedDate,
}) => {
  // Calculate the calendar grid
  let calendarDays = [];
  if (view === 'month') {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const weekStart = startOfWeek(monthStart);
    const weekEnd = endOfWeek(monthEnd);
    let day = weekStart;
    while (day <= weekEnd) {
      calendarDays.push(day);
      day = addDays(day, 1);
    }
  } else {
    calendarDays = getWeekDays(selectedDate);
  }


  // Filter tasks for the current view
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      try {
        if (!task.dueDate) return; // Skip tasks without due dates
        
        let dateObj;
        if (typeof task.dueDate === 'string') {
          // Handle various date string formats
          if (task.dueDate.includes('T')) {
            dateObj = parseISO(task.dueDate);
          } else {
            dateObj = new Date(task.dueDate);
          }
        } else {
          dateObj = new Date(task.dueDate);
        }
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn('Invalid date for task:', task.title, task.dueDate);
          return;
        }
        
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(task);
      } catch (error) {
        console.warn('Error parsing date for task:', task.title, error);
      }
    });
    return map;
  }, [tasks]);


  // Drag and drop handlers
  const [draggedTask, setDraggedTask] = useState(null);


  const handleDragStart = (task) => setDraggedTask(task);
  const handleDrop = (date) => {
    if (draggedTask && onTaskDateChange) {
      onTaskDateChange(draggedTask, date);
      setDraggedTask(null);
    }
  };


  // Add/Edit Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(defaultTask);
  const [addError, setAddError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);


  const handleAddInputChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };


  const handleAddTask = (e) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.dueDate) {
      setAddError('Task name and due date are required');
      return;
    }
    setAddError('');
    if (editMode && onTaskEdit) {
      onTaskEdit({ ...addForm, id: editingTaskId });
    } else if (onTaskCreate) {
      onTaskCreate({
        ...addForm,
        id: Date.now().toString(),
      });
    }
    setShowAddModal(false);
    setAddForm(defaultTask);
    setEditMode(false);
    setEditingTaskId(null);
  };


  const openEditModal = (task) => {
    setAddForm({
      title: task.title,
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : format(task.dueDate, 'yyyy-MM-dd'),
      priority: task.priority,
      assignedTo: task.assignedTo || '',
    });
    setEditMode(true);
    setEditingTaskId(task.id);
    setShowAddModal(true);
  };


  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 }
  };


  // For week navigation
  const handlePrev = () => {
    if (view === 'month') setSelectedDate(subMonths(selectedDate, 1));
    else setSelectedDate(addDays(selectedDate, -7));
  };
  const handleNext = () => {
    if (view === 'month') setSelectedDate(addMonths(selectedDate, 1));
    else setSelectedDate(addDays(selectedDate, 7));
  };


  // Close modal on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('calendar-modal-overlay')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center  bg-gradient-to-br from-blue-800 to-blue-100 p-6 calendar-modal-overlay"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex flex-col relative"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handlePrev}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-lg font-semibold">
                  {view === 'month'
                    ? format(selectedDate, 'MMMM yyyy')
                    : `${format(getStartOfWeek(selectedDate), 'MMM d')} - ${format(getEndOfWeek(selectedDate), 'MMM d, yyyy')}`}
                </span>
                <Button variant="ghost" onClick={handleNext}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={view === 'month' ? 'default' : 'outline'}
                  onClick={() => setView('month')}
                  size="sm"
                >
                  Month
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'outline'}
                  onClick={() => setView('week')}
                  size="sm"
                >
                  Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddModal(true);
                    setEditMode(false);
                    setAddForm(defaultTask);
                  }}
                  title="Add Task"
                >
                  + Add Task
                </Button>
              </div>
            </div>


            {/* Calendar Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
              {view === 'month' ? (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map((d) => (
                      <div key={d} className="text-xs font-semibold text-center text-slate-500">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, idx) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isCurrentMonth = isSameMonth(date, selectedDate);
                      const isToday = isSameDay(date, new Date());
                      return (
                        <div
                          key={dateStr}
                          className={`rounded-lg p-1 min-h-[60px] border transition-all relative group
                            ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}
                            ${isToday ? 'border-blue-500' : 'border-slate-200'}
                            hover:bg-blue-50`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(dateStr)}
                        >
                          <div className="mb-1 text-xs font-medium">{date.getDate()}</div>
                          <div className="space-y-1">
                            {(tasksByDate[dateStr] || []).map((task) => (
                              <motion.div
                                key={task.id}
                                className={`px-2 py-1 text-xs font-medium truncate rounded cursor-move bg-blue-100 text-blue-700 flex items-center justify-between
                                ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => openEditModal(task)}
                                style={{ cursor: 'pointer' }}
                              >
                                <span className="flex items-center">
                                  {task.title}
                                  {task.status === 'COMPLETED' && (
                                    <CheckCircle className="inline w-4 h-4 ml-2 text-green-500" />
                                  )}
                                  {task.priority && (
                                    <span className={`ml-2 text-xs font-bold ${priorities.find(p => p.value === task.priority)?.color || 'text-slate-600'}`}>
                                      <Flag className="inline w-3 h-3 mr-1" />
                                      {task.priority}
                                    </span>
                                  )}
                                </span>
                                <Edit2 className="w-3 h-3 ml-2 text-slate-400 hover:text-blue-600" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                // Vertical week view
                <div className="flex flex-col gap-2">
                  {getWeekDays(selectedDate).map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isToday = isSameDay(date, new Date());
                    return (
                      <div
                        key={dateStr}
                        className={`flex items-start gap-4 rounded-lg border p-3 transition-all relative group
                          ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}
                          hover:bg-blue-50`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(dateStr)}
                      >
                        <div className="flex flex-col items-center flex-shrink-0 w-20 text-xs font-semibold text-slate-700">
                          <span>{daysOfWeek[date.getDay()]}</span>
                          <span className="text-base font-bold">{date.getDate()}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          {(tasksByDate[dateStr] || []).length === 0 && (
                            <span className="text-xs text-slate-400">No tasks</span>
                          )}
                          {(tasksByDate[dateStr] || []).map((task) => (
                            <motion.div
                              key={task.id}
                              className={`flex items-center justify-between px-2 py-1 text-xs font-medium truncate rounded cursor-move bg-blue-100 text-blue-700
                              ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`}
                              draggable
                              onDragStart={() => handleDragStart(task)}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => openEditModal(task)}
                              style={{ cursor: 'pointer' }}
                            >
                              <span className="flex items-center">
                                {task.title}
                                {task.status === 'COMPLETED' && (
                                  <CheckCircle className="inline w-4 h-4 ml-2 text-green-500" />
                                )}
                                {task.priority && (
                                  <span className={`ml-2 text-xs font-bold ${priorities.find(p => p.value === task.priority)?.color || 'text-slate-600'}`}>
                                    <Flag className="inline w-3 h-3 mr-1" />
                                    {task.priority}
                                  </span>
                                )}
                              </span>
                              <Edit2 className="w-3 h-3 ml-2 text-slate-400 hover:text-blue-600" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Add/Edit Task Modal */}
            <AnimatePresence>
              {showAddModal && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-100 p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="relative w-full max-w-sm p-6 bg-white rounded-lg shadow-lg"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                  >
                    <button
                      className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditMode(false);
                        setEditingTaskId(null);
                        setAddForm(defaultTask);
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="mb-4 text-lg font-semibold">{editMode ? 'Edit Task' : 'Add Task'}</h2>
                    {addError && (
                      <div className="mb-2 text-sm text-red-600">{addError}</div>
                    )}
                    <form onSubmit={handleAddTask} className="space-y-3">
                      <div>
                        <label htmlFor="task-name" className="block mb-1 text-sm font-medium">Task Name</label>
                        <input
                          id="task-name"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={addForm.title}
                          onChange={e => handleAddInputChange('title', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="due-date" className="block mb-1 text-sm font-medium">Due Date</label>
                        <input
                          id="due-date"
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={addForm.dueDate}
                          onChange={e => handleAddInputChange('dueDate', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="task-priority" className="block mb-1 text-sm font-medium">Priority</label>
                        <select
                          id="task-priority"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={addForm.priority}
                          onChange={e => handleAddInputChange('priority', e.target.value)}
                        >
                          {priorities.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="assigned-to" className="block mb-1 text-sm font-medium">Assigned To</label>
                        <input
                          id="assigned-to"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={addForm.assignedTo}
                          onChange={e => handleAddInputChange('assignedTo', e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full mt-2">
                        {editMode ? 'Update Task' : 'Add Task'}
                      </Button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const TeamCalendar = ({
  iconClassName = '',
  notifications = [],
  setNotifications,
  setHasUnseenNotifications,
}) => {
  const { tasks, addTask, updateTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());


  // Add task handler for global state
  const handleTaskCreate = async (task) => {
    await addTask(task);
  };


  // Edit task handler for global state
  const handleTaskEdit = async (task) => {
    await updateTask(task.id || task._id, task);
  };


  // Drag handler for global state
  const handleTaskDateChange = async (task, newDate) => {
    await updateTask(task.id || task._id, { ...task, dueDate: newDate });
  };


  // Notification logic
  useEffect(() => {
    if (!setNotifications || !setHasUnseenNotifications) return;
    const now = new Date();
    let newNotifications = [];
    tasks.forEach((task) => {
      try {
        if (!task.dueDate || task.status === 'COMPLETED') return;
        
        let due;
        if (typeof task.dueDate === 'string') {
          if (task.dueDate.includes('T')) {
            due = parseISO(task.dueDate);
          } else {
            due = new Date(task.dueDate);
          }
        } else {
          due = new Date(task.dueDate);
        }
        
        // Check if date is valid
        if (isNaN(due.getTime())) {
          console.warn('Invalid due date for notification:', task.title, task.dueDate);
          return;
        }
        
        const dueDateTime = new Date(`${format(due, 'yyyy-MM-dd')}T23:59`);
        const hoursLeft = (dueDateTime - now) / (1000 * 60 * 60);
        if (hoursLeft <= 48 && hoursLeft > 0) { // 2 days = 48 hours
          const lastNotified = task.lastNotified || 0;
          const hoursSinceLast = (Date.now() - lastNotified) / (1000 * 60 * 60);
          if (hoursSinceLast >= 3 || !lastNotified) {
            newNotifications.push({
              id: `${task.id}-${Date.now()}`,
              taskId: task.id,
              title: task.title,
              deadline: `${format(due, 'yyyy-MM-dd')}`,
              priority: task.priority,
              seen: false,
            });
            task.lastNotified = Date.now();
          }
        }
      } catch (error) {
        console.warn('Error processing notification for task:', task.title, error);
      }
    });
    if (newNotifications.length > 0) {
      setNotifications((prev) => [...prev, ...newNotifications]);
      setHasUnseenNotifications(true);
    }
    // eslint-disable-next-line
  }, [tasks, setNotifications, setHasUnseenNotifications]);


  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center justify-center"
        onClick={() => setIsOpen(true)}
        aria-label="Open Team Calendar"
      >
        <CalendarIcon className={`w-6 h-6 ${iconClassName}`} />
      </Button>
      <CalendarModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tasks={tasks}
        onTaskDateChange={handleTaskDateChange}
        onTaskCreate={handleTaskCreate}
        onTaskEdit={handleTaskEdit}
        view={view}
        setView={setView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </>
  );
};


CalendarModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tasks: PropTypes.array,
  onTaskDateChange: PropTypes.func,
  onTaskCreate: PropTypes.func,
  onTaskEdit: PropTypes.func,
  view: PropTypes.string,
  setView: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func,
};


TeamCalendar.propTypes = {
  iconClassName: PropTypes.string,
  notifications: PropTypes.array,
  setNotifications: PropTypes.func,
  setHasUnseenNotifications: PropTypes.func,
};
export default TeamCalendar;
