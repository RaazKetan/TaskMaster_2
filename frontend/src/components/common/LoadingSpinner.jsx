import React from 'react';

const LoadingSpinner = ({ size = "medium", message = "Loading..." }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="task-progress-bar w-full">
          <div className="task-progress-fill"></div>
        </div>
      </div>
      {message && (
        <span className="ml-3 text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;