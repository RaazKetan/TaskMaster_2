import React from 'react';

const TaskPriorityVisualizer = ({ tasks = [] }) => {
  const priorityStats = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityColors = {
    urgent: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' },
    high: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' },
    low: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' }
  };

  const totalTasks = tasks.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
      
      {totalTasks === 0 ? (
        <p className="text-gray-500">No tasks available</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(priorityStats).map(([priority, count]) => {
            const percentage = (count / totalTasks) * 100;
            const colors = priorityColors[priority];
            
            return (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${colors.bg}`}></div>
                  <span className="capitalize font-medium">{priority}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors.bg}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskPriorityVisualizer;