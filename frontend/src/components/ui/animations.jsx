import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fade in animation for new items
export const FadeInItem = ({ children, delay = 0, duration = 0.3 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ 
      duration,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// Scale and fade animation for buttons
export const ScaleButton = ({ children, className = "", onClick, disabled = false, ...props }) => (
  <motion.button
    className={className}
    onClick={onClick}
    disabled={disabled}
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    transition={{ duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.button>
);

// Slide in from right animation for modals
export const SlideInModal = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Success pulse animation
export const SuccessPulse = ({ children, trigger }) => (
  <motion.div
    animate={trigger ? { scale: [1, 1.05, 1] } : {}}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Delete animation with shake
export const DeleteAnimation = ({ children, onAnimationComplete }) => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ 
      opacity: [1, 0.7, 1, 0.7, 0],
      x: [0, -10, 10, -5, 0],
      scale: [1, 0.95, 1, 0.95, 0.8]
    }}
    transition={{ 
      duration: 0.6,
      ease: "easeInOut"
    }}
    onAnimationComplete={onAnimationComplete}
  >
    {children}
  </motion.div>
);

// Stagger animation for lists
export const StaggerContainer = ({ children, className = "" }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    }}
  >
    {children}
  </motion.div>
);

// List item animation
export const StaggerItem = ({ children, className = "" }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: "easeOut"
        }
      }
    }}
  >
    {children}
  </motion.div>
);

// Loading spinner animation
export const LoadingSpinner = ({ size = 24, color = "currentColor" }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    style={{ width: size, height: size }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  </motion.div>
);

// Floating action button animation
export const FloatingButton = ({ children, className = "", onClick }) => (
  <motion.button
    className={className}
    onClick={onClick}
    whileHover={{ 
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(10, 11, 10, 0.2)"
    }}
    whileTap={{ scale: 0.95 }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ 
      type: "spring",
      stiffness: 260,
      damping: 20
    }}
  >
    {children}
  </motion.button>
);

// Progress bar animation
export const ProgressBar = ({ progress, className = "" }) => (
  <div className={`bg-gray-200 rounded-full h-2 ${className}`}>
    <motion.div
      className="bg-blue-600 h-2 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  </div>
);

// Card hover animation
export const HoverCard = ({ children, className = "" }) => (
  <motion.div
    className={className}
    whileHover={{
      y: -5,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);