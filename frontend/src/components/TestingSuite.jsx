
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import api from '../services/api';
import { getCurrentUserId } from '../utils/auth';

const TestingSuite = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const addResult = (testName, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      testName,
      status, // 'success', 'error', 'info'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const userId = getCurrentUserId();
    if (!userId) {
      addResult('Authentication', 'error', 'User not logged in');
      setIsRunning(false);
      return;
    }

    // Test 1: Generate Dummy Data
    setCurrentTest('Generating dummy data...');
    try {
      const response = await api.post(`/seed/create-dummy-data?userId=${userId}`);
      addResult('Dummy Data Generation', 'success', 'Dummy data created successfully', response.data);
      await sleep(1000);
    } catch (error) {
      addResult('Dummy Data Generation', 'error', error.response?.data || error.message);
    }

    // Test 2: Fetch Teams
    setCurrentTest('Testing team functionality...');
    try {
      const teamsResponse = await api.get('/teams', { params: { userId } });
      addResult('Team Fetch', 'success', `Fetched ${teamsResponse.data.length} teams`, teamsResponse.data);
      await sleep(500);
    } catch (error) {
      addResult('Team Fetch', 'error', error.response?.data || error.message);
    }

    // Test 3: Fetch Projects
    setCurrentTest('Testing project functionality...');
    try {
      const projectsResponse = await api.get('/projects', { params: { userId } });
      addResult('Project Fetch', 'success', `Fetched ${projectsResponse.data.length} projects`, projectsResponse.data);
      await sleep(500);
    } catch (error) {
      addResult('Project Fetch', 'error', error.response?.data || error.message);
    }

    // Test 4: Fetch Tasks
    setCurrentTest('Testing task functionality...');
    try {
      const tasksResponse = await api.get('/tasks', { params: { userId } });
      addResult('Task Fetch', 'success', `Fetched ${tasksResponse.data.length} tasks`, tasksResponse.data);
      
      // Test task status update if tasks exist
      if (tasksResponse.data.length > 0) {
        const firstTask = tasksResponse.data[0];
        const newStatus = firstTask.status === 'TODO' ? 'IN_PROGRESS' : 'TODO';
        
        const updateResponse = await api.put(`/tasks/${firstTask._id || firstTask.id}`, {
          ...firstTask,
          status: newStatus,
          userId: userId
        });
        addResult('Task Update', 'success', `Updated task status to ${newStatus}`, updateResponse.data);
      }
      await sleep(500);
    } catch (error) {
      addResult('Task Operations', 'error', error.response?.data || error.message);
    }

    // Test 5: Create New Task
    setCurrentTest('Testing task creation...');
    try {
      const projectsResponse = await api.get('/projects', { params: { userId } });
      if (projectsResponse.data.length > 0) {
        const testTask = {
          title: 'Test Task Created by Suite',
          description: 'This is a test task created by the testing suite',
          status: 'TODO',
          priority: 'HIGH',
          projectId: projectsResponse.data[0]._id || projectsResponse.data[0].id,
          userId: userId,
          assignedTo: 'test@example.com',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        const createResponse = await api.post('/tasks', testTask);
        addResult('Task Creation', 'success', 'Created new test task', createResponse.data);
        
        // Test delete the created task
        const taskId = createResponse.data._id || createResponse.data.id;
        await api.delete(`/tasks/${taskId}`, { params: { userId } });
        addResult('Task Deletion', 'success', 'Successfully deleted test task');
      }
      await sleep(500);
    } catch (error) {
      addResult('Task Creation/Deletion', 'error', error.response?.data || error.message);
    }

    // Test 6: Dashboard Data
    setCurrentTest('Testing dashboard functionality...');
    try {
      const dashboardResponse = await api.get('/dashboard/data', { params: { userId } });
      addResult('Dashboard Data', 'success', 'Fetched dashboard data successfully', dashboardResponse.data);
      await sleep(500);
    } catch (error) {
      addResult('Dashboard Data', 'error', error.response?.data || error.message);
    }

    // Test 7: Share Dashboard
    setCurrentTest('Testing share functionality...');
    try {
      const shareResponse = await api.post('/dashboard/share', { userId });
      addResult('Share Dashboard', 'success', 'Created shareable dashboard link', shareResponse.data);
      
      // Test accessing the shared dashboard
      const shareId = shareResponse.data.shareId;
      const publicResponse = await api.get(`/public/dashboard/${shareId}`);
      addResult('Public Dashboard Access', 'success', 'Successfully accessed public dashboard', publicResponse.data);
      await sleep(500);
    } catch (error) {
      addResult('Share Functionality', 'error', error.response?.data || error.message);
    }

    setCurrentTest('');
    setIsRunning(false);
    addResult('Test Suite', 'info', 'All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>TaskMaster Testing Suite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              <Button 
                onClick={clearResults} 
                variant="outline"
                disabled={isRunning}
              >
                Clear Results
              </Button>
            </div>

            {isRunning && currentTest && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">{currentTest}</span>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <Card key={result.id} className={`border-l-4 ${
                  result.status === 'success' ? 'border-green-500 bg-green-50' :
                  result.status === 'error' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${
                        result.status === 'success' ? 'text-green-800' :
                        result.status === 'error' ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {result.testName}
                      </h3>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className={`text-sm mb-2 ${
                      result.status === 'success' ? 'text-green-700' :
                      result.status === 'error' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                          View Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {testResults.length === 0 && !isRunning && (
              <div className="text-center py-8 text-gray-500">
                <p>No test results yet. Click "Run All Tests" to start testing all functionality.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingSuite;
