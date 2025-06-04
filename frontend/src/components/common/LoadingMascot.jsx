import React from 'react';
import { Card, CardContent } from '../ui/card';

const LoadingMascot = ({ message = "Loading tasks...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32"
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="flex flex-col items-center justify-center p-8">
        {/* Animated Task Mascot */}
        <div className={`${sizeClasses[size]} mb-4 relative`}>
        {/* Main mascot body */}
        <div className="mascot-body">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Body - animated bouncing */}
            <circle 
              cx="50" 
              cy="60" 
              r="25" 
              fill="#3b82f6" 
              className="mascot-bounce"
            />
            
            {/* Head */}
            <circle 
              cx="50" 
              cy="35" 
              r="18" 
              fill="#60a5fa" 
              className="mascot-bob"
            />
            
            {/* Eyes */}
            <circle cx="44" cy="32" r="3" fill="white" />
            <circle cx="56" cy="32" r="3" fill="white" />
            <circle cx="44" cy="32" r="1.5" fill="#1f2937" className="mascot-blink" />
            <circle cx="56" cy="32" r="1.5" fill="#1f2937" className="mascot-blink" />
            
            {/* Smile */}
            <path 
              d="M 42 38 Q 50 42 58 38" 
              stroke="#1f2937" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
            />
            
            {/* Arms holding a checklist */}
            <line x1="25" y1="55" x2="35" y2="60" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" className="mascot-wave-left" />
            <line x1="75" y1="55" x2="65" y2="60" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" className="mascot-wave-right" />
            
            {/* Checklist */}
            <rect x="35" y="58" width="12" height="15" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="1" />
            <line x1="37" y1="61" x2="45" y2="61" stroke="#10b981" strokeWidth="1" />
            <line x1="37" y1="64" x2="45" y2="64" stroke="#10b981" strokeWidth="1" />
            <line x1="37" y1="67" x2="45" y2="67" stroke="#6b7280" strokeWidth="1" />
            <circle cx="38" cy="61" r="1" fill="#10b981" />
            <circle cx="38" cy="64" r="1" fill="#10b981" />
            <circle cx="38" cy="67" r="1" fill="#e5e7eb" />
            
            {/* Floating task icons */}
            <g className="mascot-float">
              <rect x="15" y="25" width="6" height="6" fill="#fbbf24" rx="1" opacity="0.8" />
              <rect x="80" y="35" width="5" height="5" fill="#f87171" rx="1" opacity="0.8" />
              <rect x="85" y="20" width="4" height="4" fill="#34d399" rx="1" opacity="0.8" />
            </g>
          </svg>
        </div>
        </div>

        {/* Loading message */}
        <div className="text-center">
          <p className="text-slate-600 font-medium mb-2">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="loading-dot bg-blue-500"></div>
            <div className="loading-dot bg-blue-500" style={{animationDelay: '0.2s'}}></div>
            <div className="loading-dot bg-blue-500" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingMascot;