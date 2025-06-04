import React from 'react';
import { motion } from 'framer-motion';

const LoadingMascot = ({ message = "Loading your workspace..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="relative"
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        
        {/* Floating dots animation */}
        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-2 w-2 h-2 bg-yellow-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5
          }}
        />
        <motion.div
          className="absolute top-1 -left-3 w-2 h-2 bg-pink-400 rounded-full"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            delay: 1
          }}
        />
      </motion.div>
      
      <motion.p 
        className="mt-4 text-gray-600 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
      
      {/* Progress dots */}
      <div className="flex space-x-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingMascot;