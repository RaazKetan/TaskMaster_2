import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">TaskMaster</h1>
        <p className="text-center text-gray-600 mb-4">Project Management Tool</p>
        
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Login
          </button>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Register
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">API Status: Connected</p>
        </div>
      </div>
    </div>
  );
}

export default App;