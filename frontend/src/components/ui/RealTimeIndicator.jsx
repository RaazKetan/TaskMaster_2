import React, { useState, useEffect } from 'react';

const RealTimeIndicator = ({ isActive = true, className = '' }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            isOnline && isActive ? 'bg-green-500' : 'bg-red-500'
          } ${isOnline && isActive ? 'animate-pulse' : ''}`}
        />
        <span className="text-gray-600">
          {isOnline && isActive ? 'Live' : 'Offline'}
        </span>
      </div>
      <span className="text-gray-400">•</span>
      <span className="text-gray-500">
        Updated {formatTime(lastUpdate)}
      </span>
    </div>
  );
};

export default RealTimeIndicator;