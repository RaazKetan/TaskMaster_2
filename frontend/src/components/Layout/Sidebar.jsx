const { useNavigate, useLocation } = ReactRouterDOM;

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Teams', href: '/teams', icon: 'users' },
    { name: 'Projects', href: '/projects', icon: 'folder' },
    { name: 'Tasks', href: '/tasks', icon: 'check-square' },
    { name: 'Reports', href: '/reports', icon: 'bar-chart-2' },
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleNavigation = (href) => {
    navigate(href);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  React.useEffect(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }, []);

  return React.createElement(React.Fragment, null,
    // Overlay for mobile
    open && React.createElement('div', {
      className: 'fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden',
      onClick: onClose
    }),

    // Sidebar
    React.createElement('aside', {
      className: `sidebar ${open ? 'sidebar-open' : 'sidebar-closed'} lg:sidebar-open`
    },
      React.createElement('div', { className: 'flex flex-col h-full' },
        // Sidebar header
        React.createElement('div', { className: 'flex items-center justify-between p-4 border-b border-gray-200 lg:hidden' },
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('div', { 
              className: 'w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center' 
            },
              React.createElement('span', { className: 'text-white font-bold text-lg' }, '📋')
            ),
            React.createElement('h2', { className: 'text-lg font-bold text-gray-900' }, 'TaskMaster')
          ),
          React.createElement('button', {
            onClick: onClose,
            className: 'p-2 rounded-md hover:bg-gray-100 focus-ring'
          },
            React.createElement('i', { 
              'data-feather': 'x',
              className: 'w-5 h-5'
            })
          )
        ),

        // Navigation
        React.createElement('nav', { className: 'flex-1 px-4 py-6 space-y-2' },
          navigationItems.map(item =>
            React.createElement('button', {
              key: item.name,
              onClick: () => handleNavigation(item.href),
              className: `w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActiveRoute(item.href)
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            },
              React.createElement('i', { 
                'data-feather': item.icon,
                className: 'w-5 h-5 mr-3'
              }),
              item.name
            )
          )
        ),

        // Quick actions
        React.createElement('div', { className: 'p-4 border-t border-gray-200' },
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('button', {
              onClick: () => handleNavigation('/teams/new'),
              className: 'w-full flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors'
            },
              React.createElement('i', { 
                'data-feather': 'plus',
                className: 'w-4 h-4 mr-2'
              }),
              'New Team'
            ),
            React.createElement('button', {
              onClick: () => handleNavigation('/projects/new'),
              className: 'w-full flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors'
            },
              React.createElement('i', { 
                'data-feather': 'plus',
                className: 'w-4 h-4 mr-2'
              }),
              'New Project'
            ),
            React.createElement('button', {
              onClick: () => handleNavigation('/tasks/new'),
              className: 'w-full flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors'
            },
              React.createElement('i', { 
                'data-feather': 'plus',
                className: 'w-4 h-4 mr-2'
              }),
              'New Task'
            )
          )
        ),

        // Footer
        React.createElement('div', { className: 'p-4 border-t border-gray-200' },
          React.createElement('div', { className: 'text-xs text-gray-500 text-center' },
            React.createElement('p', null, 'TaskMaster v1.0.0'),
            React.createElement('p', null, '© 2024 TaskMaster')
          )
        )
      )
    )
  );
}

export default Sidebar;
