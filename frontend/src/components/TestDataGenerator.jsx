
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import api from '../services/api';
import { getCurrentUserId } from '../utils/auth';

const TestDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState(null);

  const generateDummyData = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setResult({ error: 'Please login first' });
        return;
      }

      const response = await api.post(`/seed/create-dummy-data?userId=${userId}`);
      setResult({ success: true, data: response.data });
    } catch (error) {
      console.error('Error generating dummy data:', error);
      setResult({ error: error.response?.data || 'Failed to generate dummy data' });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllData = async () => {
    setIsClearing(true);
    setResult(null);
    
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setResult({ error: 'Please login first' });
        return;
      }

      const response = await api.delete(`/seed/clear-all-data?userId=${userId}`);
      setResult({ success: true, data: response.data });
    } catch (error) {
      console.error('Error clearing data:', error);
      setResult({ error: error.response?.data || 'Failed to clear data' });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Data Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={generateDummyData} 
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Dummy Data'}
              </Button>
              
              <Button 
                onClick={clearAllData} 
                disabled={isClearing}
                variant="destructive"
              >
                {isClearing ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>

            {result && (
              <Card>
                <CardContent className="p-4">
                  {result.success ? (
                    <div className="text-green-600">
                      <h3 className="font-semibold mb-2">Success!</h3>
                      <pre className="text-sm bg-green-50 p-3 rounded">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <h3 className="font-semibold mb-2">Error:</h3>
                      <pre className="text-sm bg-red-50 p-3 rounded">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What this generates:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li><strong>4 Teams:</strong> Frontend Squad, Backend Wizards, DevOps Ninjas, QA Champions</li>
                  <li><strong>5 Projects:</strong> E-commerce Platform, Mobile App, API Gateway, Auth System, Analytics Dashboard</li>
                  <li><strong>15 Tasks:</strong> Various tasks with different statuses (TODO, IN_PROGRESS, REVIEW, COMPLETED)</li>
                  <li><strong>Team Members:</strong> Each team has 3 dummy members</li>
                  <li><strong>Assignments:</strong> Tasks are randomly assigned to team members and projects</li>
                  <li><strong>Dates:</strong> Realistic due dates and status timestamps</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestDataGenerator;
