import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt'
    },
    {
      path: '/teams',
      label: 'Teams',
      icon: 'fas fa-users'
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: 'fas fa-project-diagram'
    },
    {
      path: '/tasks',
      label: 'My Tasks',
      icon: 'fas fa-tasks'
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: 'fas fa-calendar'
    }
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <i className={`${item.icon} mr-3`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
