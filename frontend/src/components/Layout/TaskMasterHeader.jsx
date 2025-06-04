import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function TaskMasterHeader({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">TaskMaster</span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                location.pathname === '/projects'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/tasks"
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                location.pathname === '/tasks'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              Tasks
            </Link>
            <Link
              to="/calendar"
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                location.pathname === '/calendar'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              Calendar
            </Link>
            <Link
              to="/teams"
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                location.pathname === '/teams'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              Team
            </Link>
          </nav>
        </div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="w-80 pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center focus:outline-none"
            >
              <img
                className="h-8 w-8 rounded-full object-cover"
                src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
              />
            </button>
            
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <div className="font-medium">{user?.displayName || 'User'}</div>
                    <div className="text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TaskMasterHeader;