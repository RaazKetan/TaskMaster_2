import React, { useState } from 'react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ column, tasks, onTaskMove, onTaskUpdate, teamMembers }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('text/plain');
    const newPosition = tasks.length; // Add to end of column

    onTaskMove(taskId, column.status, newPosition);
  };

  const getColumnColor = () => {
    switch (column.status) {
      case 'TODO':
        return 'border-gray-300 bg-gray-50';
      case 'IN_PROGRESS':
        return 'border-blue-300 bg-blue-50';
      case 'DONE':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getHeaderColor = () => {
    switch (column.status) {
      case 'TODO':
        return 'text-gray-700';
      case 'IN_PROGRESS':
        return 'text-blue-700';
      case 'DONE':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div
      className={`flex flex-col h-full rounded-lg border-2 p-4 transition-colors ${
        isDragOver ? 'drag-over' : getColumnColor()
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-lg ${getHeaderColor()}`}>
          {column.title}
        </h3>
        <span className="text-sm text-muted-foreground bg-white rounded-full px-2 py-1">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-inbox text-3xl text-muted-foreground mb-2"></i>
            <p className="text-sm text-muted-foreground">
              {column.status === 'TODO' && 'No tasks to do'}
              {column.status === 'IN_PROGRESS' && 'No tasks in progress'}
              {column.status === 'DONE' && 'No completed tasks'}
            </p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onTaskUpdate={onTaskUpdate}
              teamMembers={teamMembers}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
