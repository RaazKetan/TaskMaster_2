import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import LoadingMascot from './LoadingMascot';
import TaskLoadingCard from './TaskLoadingCard';
import LoadingSpinner from './LoadingSpinner';

const LoadingDemo = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-900 text-center">
              TaskMaster Loading Animations with Shadcn UI
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Loading Mascot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Main Loading Mascot</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingMascot 
                message="Loading your workspace..." 
                size="large"
              />
            </CardContent>
          </Card>
          
          {/* Medium Mascot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Medium Size Mascot</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingMascot 
                message="Processing tasks..." 
                size="medium"
              />
            </CardContent>
          </Card>
          
          {/* Small Mascot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Small Size Mascot</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingMascot 
                message="Quick load..." 
                size="small"
              />
            </CardContent>
          </Card>
          
          {/* Shadcn Progress Components */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Shadcn Progress & Skeleton</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={33} className="h-2" />
              <Progress value={66} className="h-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Button className="w-full" disabled>
                Loading...
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Task Loading Cards */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Task Loading Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TaskLoadingCard title="Setting up your dashboard..." />
            <TaskLoadingCard title="Connecting to team workspace..." />
            <TaskLoadingCard title="Fetching recent activity..." />
            <TaskLoadingCard title="Organizing project priorities..." />
          </CardContent>
        </Card>
        
        {/* Combined Loading State Example */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Combined Loading Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <LoadingMascot 
                message="Getting everything ready for you..." 
                size="medium"
              />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaskLoadingCard title="Loading projects..." />
                <TaskLoadingCard title="Preparing team data..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoadingDemo;