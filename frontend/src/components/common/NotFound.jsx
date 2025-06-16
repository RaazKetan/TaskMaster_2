
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import ShadcnNavbar from '../layout/ShadcnNavbar';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShadcnNavbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="w-80 h-60 bg-gradient-to-br from-orange-300 via-orange-200 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-gray-800 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div className="mb-2">$ ls -la</div>
                <div className="mb-2">drwxr-xr-x  2 user user  4096 Dec 11 12:00 .</div>
                <div className="mb-2">drwxr-xr-x  3 user user  4096 Dec 11 12:00 ..</div>
                <div className="mb-2">-rw-r--r--  1 user user     0 Dec 11 12:00 404.txt</div>
                <div className="mb-2">$ cat 404.txt</div>
                <div className="text-red-400">Page not found!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            It looks like the page you're searching for doesn't exist 
            or has been moved. Don't worry, let's get you back on 
            track.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/teams">
                Help Center
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          © 2024 TaskMaster. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default NotFound;
