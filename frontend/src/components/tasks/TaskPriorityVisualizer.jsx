import React, { useState } from 'react';

const TaskPriorityVisualizer = () => {
  const [tasks, setTasks] = useState({
    high: [
      {
        id: '1',
        title: 'Fix critical security vulnerability',
        description: 'Address SQL injection vulnerability in user authentication',
        assignee: 'Sarah Wilson',
        dueDate: 'Today',
        project: 'Security Audit'
      },
      {
        id: '2',
        title: 'Deploy production hotfix',
        description: 'Emergency fix for payment processing issue',
        assignee: 'Mike Chen',
        dueDate: 'Tomorrow',
        project: 'Payment System'
      }
    ],
    medium: [
      {
        id: '3',
        title: 'Update documentation',
        description: 'Revise API documentation for new endpoints',
        assignee: 'Alex Johnson',
        dueDate: 'This week',
        project: 'API Development'
      },
      {
        id: '4',
        title: 'Code review for feature branch',
        description: 'Review pull request for user profile updates',
        assignee: 'Emma Davis',
        dueDate: 'This week',
        project: 'User Management'
      },
      {
        id: '5',
        title: 'Database optimization',
        description: 'Optimize slow queries in reporting module',
        assignee: 'David Kim',
        dueDate: 'Next week',
        project: 'Performance'
      }
    ],
    low: [
      {
        id: '6',
        title: 'Update UI components',
        description: 'Refresh button styles across admin panel',
        assignee: 'Lisa Zhang',
        dueDate: 'Next month',
        project: 'UI Refresh'
      },
      {
        id: '7',
        title: 'Research new frameworks',
        description: 'Evaluate potential migration to React 18',
        assignee: 'Tom Brown',
        dueDate: 'Next month',
        project: 'Research'
      }
    ],
    backlog: [
      {
        id: '8',
        title: 'Implement dark mode',
        description: 'Add dark theme support to application',
        assignee: 'Unassigned',
        dueDate: 'Future',
        project: 'Enhancement'
      }
    ]
  });

  const priorityConfig = {
    high: {
      title: 'High Priority',
      color: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-800',
      count: tasks.high.length
    },
    medium: {
      title: 'Medium Priority',
      color: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800',
      count: tasks.medium.length
    },
    low: {
      title: 'Low Priority',
      color: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-800',
      count: tasks.low.length
    },
    backlog: {
      title: 'Backlog',
      color: 'bg-gray-50 border-gray-200',
      badge: 'bg-gray-100 text-gray-800',
      count: tasks.backlog.length
    }
  };

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const handleDragStart = (e, task, sourceColumn) => {
    setDraggedTask(task);
    setDraggedFrom(sourceColumn);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedFrom || draggedFrom === targetColumn) return;

    const sourceColumn = tasks[draggedFrom];
    const destColumn = tasks[targetColumn];

    const newSourceColumn = sourceColumn.filter(task => task.id !== draggedTask.id);
    const newDestColumn = [...destColumn, draggedTask];

    setTasks({
      ...tasks,
      [draggedFrom]: newSourceColumn,
      [targetColumn]: newDestColumn
    });

    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const TaskCard = ({ task, sourceColumn }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task, sourceColumn)}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm transition-all duration-200 cursor-move hover:shadow-lg hover:border-gray-300 ${
        draggedTask?.id === task.id ? 'opacity-50 rotate-1 scale-105 shadow-xl' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-5 pr-2">{task.title}</h4>
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mb-4 leading-relaxed">{task.description}</p>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
          {task.project}
        </span>
        <span className="text-xs text-gray-500 font-medium">{task.dueDate}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 truncate pr-2">{task.assignee}</span>
        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-xs font-semibold text-white">
            {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
      </div>
    </div>
  );

  const PriorityColumn = ({ priority, config }) => (
    <div 
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, priority)}
      className={`rounded-xl border-2 border-dashed p-4 min-h-96 transition-all duration-300 ${config.color} ${
        draggedTask && draggedFrom !== priority ? 'border-blue-400 bg-blue-50 scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{config.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
            {config.count}
          </span>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="min-h-80 space-y-0">
        {tasks[priority].map((task) => (
          <TaskCard key={task.id} task={task} sourceColumn={priority} />
        ))}
        
        {tasks[priority].length === 0 && (
          <div className="flex items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-center p-4">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm font-medium text-gray-400">Drop tasks here</p>
              <p className="text-xs text-gray-300 mt-1">Drag from other columns</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const totalTasks = Object.values(tasks).reduce((sum, column) => sum + column.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Task Priority Visualizer</h1>
              <p className="text-sm sm:text-base text-gray-600">Drag and drop tasks to organize by priority level</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
                Total Tasks: <span className="font-semibold text-blue-600">{totalTasks}</span>
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(priorityConfig).map(([key, config]) => (
              <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{config.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{config.count}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    key === 'high' ? 'bg-red-400' :
                    key === 'medium' ? 'bg-yellow-400' :
                    key === 'low' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drag and Drop Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {Object.entries(priorityConfig).map(([priority, config]) => (
            <PriorityColumn key={priority} priority={priority} config={config} />
          ))}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 rounded-xl p-4 lg:p-6 border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use the Priority Visualizer</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Drag tasks between priority columns to reorganize your workflow. Tasks will automatically save their new priority level when moved. Use this tool to maintain focus on high-priority items and balance your workload effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPriorityVisualizer;