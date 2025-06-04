import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

const TaskLoadingCard = ({ title = "Organizing your tasks..." }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="loading-slide-in">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {/* Mini mascot */}
          <div className="w-12 h-12">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="20" fill="#3b82f6" className="mascot-bounce" />
              <circle cx="45" cy="45" r="2" fill="white" />
              <circle cx="55" cy="45" r="2" fill="white" />
              <path d="M 42 52 Q 50 56 58 52" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-slate-900 mb-2">{title}</h3>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Sparkle effects */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full sparkle" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full sparkle" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full sparkle" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskLoadingCard;