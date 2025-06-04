import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <i className="fas fa-tasks text-primary text-xl mr-2"></i>
              <span className="text-xl font-bold text-foreground">TaskMaster</span>
            </Link>
            
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </Link>
              
              <Link
                to="/teams"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/teams')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Teams
              </Link>
              
              <Link
                to="/projects"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/projects')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <i className="fas fa-project-diagram mr-2"></i>
                Projects
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="ml-3 text-foreground font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <i className="fas fa-chevron-down ml-2 text-muted-foreground"></i>
              </button>
              
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                      {user?.email}
                    </div>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                    >
                      <i className="fas fa-user mr-2"></i>
                      Profile
                    </button>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                    >
                      <i className="fas fa-cog mr-2"></i>
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
