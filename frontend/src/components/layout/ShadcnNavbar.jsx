import React, { useState } from 'react';
        import { Link, useLocation } from 'react-router-dom';
        import { useAuth } from '../../context/AuthContext';
        import { Button } from '../ui/button';
        import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
        import NotificationBell from '../ui/NotificationBell';


        const ShadcnNavbar = () => {
          const { user, logout } = useAuth();
          const location = useLocation();
          const [isDropdownOpen, setIsDropdownOpen] = useState(false);


          const handleLogout = () => {
            logout();
            setIsDropdownOpen(false);
          };


          const navigationItems = [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/projects', label: 'Projects' },
            { href: '/tasks', label: 'Tasks' },
            { href: '/teams', label: 'Teams' },
          ];


          const isActive = (path) => location.pathname === path;


          return (
            <>
              <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
                <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                  {/* Logo */}
                  <Link to="/" className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md">
                      <span className="text-sm font-bold text-white">T</span>
                    </div>
                    <span className="hidden text-xl font-bold text-gray-900 sm:inline-block">TaskMaster</span>
                  </Link>


                  {/* Navigation */}
                  <nav className="items-center hidden space-x-6 md:flex">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>


                  {/* User menu */}
                  <div className="flex items-center gap-4">
                    {user && (
                      <>
                        <NotificationBell />
                        <div className="relative">
                          <Button
                            variant="ghost"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center px-3 py-2 space-x-2 text-sm group"
                          >
                            <i className="text-2xl text-blue-700 ri-account-circle-fill"></i>
                            <Link to="/dashboard" className="hidden font-medium text-gray-700 md:block hover:text-gray-900">
                              {user.firstName} {user.lastName}
                            </Link>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </Button>


                          {/* Dropdown Menu */}
                          {isDropdownOpen && (
                            <div className="absolute right-0 z-50 w-56 py-1 mt-2 bg-white border border-gray-200 rounded-md shadow-lg animate-fade-in">
                              <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </p>
                              </div>


                              <Link
                                to="/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <User className="w-4 h-4 mr-2 text-blue-600" />
                                Profile
                              </Link>


                              <Link
                                to="/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <Settings className="w-4 h-4 mr-2 text-blue-600" />
                                Settings
                              </Link>


                              <div className="mt-1 border-t border-gray-100">
                                <button
                                  onClick={handleLogout}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                                >
                                  <LogOut className="w-4 h-4 mr-2" />
                                  Log out
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>


              {/* Click outside to close dropdown */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}
            </>
          );
        };


        export default ShadcnNavbar;


