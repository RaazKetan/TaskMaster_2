import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';

const RealTimeIndicator = ({ isConnected = true, activeUsers = 0, className = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Connection Status */}
      <motion.div 
        className="flex items-center space-x-1"
        variants={pulseVariants}
        animate={isAnimating ? "pulse" : ""}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-green-500" />
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-500" />
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
          </>
        )}
      </motion.div>

      {/* Active Users Count */}
      {activeUsers > 0 && (
        <div className="flex items-center space-x-1 text-xs text-slate-600">
          <Users className="w-3 h-3" />
          <span>{activeUsers}</span>
        </div>
      )}

      {/* Activity Indicator */}
      <motion.div
        animate={{
          rotate: isConnected ? [0, 360] : 0
        }}
        transition={{
          duration: 2,
          repeat: isConnected ? Infinity : 0,
          ease: "linear"
        }}
      >
        <Activity className={`w-3 h-3 ${isConnected ? 'text-blue-500' : 'text-gray-400'}`} />
      </motion.div>
    </div>
  );
};

export default RealTimeIndicator;