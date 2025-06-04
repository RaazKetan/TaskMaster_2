import React, { useState } from 'react';
import TaskDetail from '../tasks/TaskDetail';
import { PRIORITY_COLORS } from '../../utils/constants';

const TaskCard = ({ task, index, onTaskUpdate, teamMembers }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.style.opacity = '0.5';
  };

  const getAssigneeName = () => {
    if (!task.assigneeId) return 'Unassigned';
    
    // This would typically come from a user lookup
    return `User ${task.assigneeId.slice(-4)}`;
  };

  const isOverdue = () => {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date() && task.status !== 'DONE';
  };

  return (
    <>
      <div
        className="card cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-102"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onClick={() => setShowDetail(true)}
      >
        <div className="card-content p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-foreground text-sm line-clamp-2">
              {task.title}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full border ${PRIORITY_COLORS[task.priority]} ml-2 flex-shrink-0`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {task.assigneeId && (
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    {getAssigneeName().charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">
                    {getAssigneeName()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {task.commentIds && task.commentIds.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <i className="fas fa-comment mr-1"></i>
                  {task.commentIds.length}
                </div>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <i className="fas fa-paperclip mr-1"></i>
                  {task.attachments.length}
                </div>
              )}

              {task.subtaskIds && task.subtaskIds.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <i className="fas fa-list mr-1"></i>
                  {task.subtaskIds.length}
                </div>
              )}
            </div>
          </div>

          {task.deadline && (
            <div className={`flex items-center text-xs mt-2 ${
              isOverdue() ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <i className="fas fa-calendar mr-1"></i>
              {new Date(task.deadline).toLocaleDateString()}
              {isOverdue() && (
                <span className="ml-1 text-destructive font-medium">
                  (Overdue)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Drag indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
          <i className="fas fa-grip-vertical text-muted-foreground"></i>
        </div>
      </div>

      {showDetail && (
        <TaskDetail
          task={task}
          onClose={() => setShowDetail(false)}
          onTaskUpdate={onTaskUpdate}
        />
      )}
    </>
  );
};

export default TaskCard;
