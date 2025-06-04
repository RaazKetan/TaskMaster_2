import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const KanbanBoard = ({ projectId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({
    todo: [
      { id: 1, title: 'Design homepage', priority: 'high', assignee: 'John Doe' },
      { id: 2, title: 'Setup database', priority: 'medium', assignee: 'Jane Smith' }
    ],
    in_progress: [
      { id: 3, title: 'Implement authentication', priority: 'high', assignee: 'Bob Wilson' }
    ],
    review: [
      { id: 4, title: 'Write documentation', priority: 'low', assignee: 'Alice Brown' }
    ],
    done: [
      { id: 5, title: 'Setup project structure', priority: 'medium', assignee: 'John Doe' }
    ]
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Kanban Board</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className={`${column.color} rounded-lg p-4`}>
            <h3 className="font-semibold text-lg mb-4">{column.title}</h3>
            <div className="space-y-3">
              {tasks[column.id]?.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white p-3 rounded-lg shadow-sm border-l-4 ${getPriorityColor(task.priority)}`}
                >
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
                    <span className="capitalize">{task.priority}</span>
                    <span>{task.assignee}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;