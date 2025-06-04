const { useNavigate } = ReactRouterDOM;

function Header({ onMenuClick, user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  return React.createElement('header', { 
    className: 'header flex items-center justify-between px-4 lg:px-6' 
  },
    // Left side - Menu button and logo
    React.createElement('div', { className: 'flex items-center space-x-4' },
      // Menu button for mobile
      React.createElement('button', {
        onClick: onMenuClick,
        className: 'lg:hidden p-2 rounded-md hover:bg-gray-100 focus-ring',
        'aria-label': 'Toggle menu'
      },
        React.createElement('i', { 
          'data-feather': 'menu',
          className: 'w-5 h-5'
        })
      ),
      
      // Logo and title
      React.createElement('div', { 
        className: 'flex items-center space-x-3 cursor-pointer',
        onClick: () => navigate('/dashboard')
      },
        React.createElement('div', { 
          className: 'w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center' 
        },
          React.createElement('span', { className: 'text-white font-bold text-lg' }, '📋')
        ),
        React.createElement('h1', { 
          className: 'text-xl font-bold text-gray-900 hidden sm:block' 
        }, 'TaskMaster')
      )
    ),

    // Right side - User menu
    React.createElement('div', { className: 'flex items-center space-x-4' },
      // Notifications button
      React.createElement('button', {
        className: 'p-2 rounded-md hover:bg-gray-100 focus-ring relative',
        'aria-label': 'Notifications'
      },
        React.createElement('i', { 
          'data-feather': 'bell',
          className: 'w-5 h-5'
        }),
        // Notification badge
        React.createElement('span', { 
          className: 'absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center' 
        }, '3')
      ),

      // User dropdown
      React.createElement('div', { 
        className: 'relative',
        ref: dropdownRef
      },
        React.createElement('button', {
          onClick: () => setDropdownOpen(!dropdownOpen),
          className: 'flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 focus-ring'
        },
          React.createElement('div', { 
            className: 'avatar avatar-md bg-blue-600' 
          }, getUserInitials(user)),
          React.createElement('div', { className: 'hidden md:block text-left' },
            React.createElement('p', { className: 'text-sm font-medium text-gray-900' }, 
              user ? `${user.firstName} ${user.lastName}` : 'User'
            ),
            React.createElement('p', { className: 'text-xs text-gray-500' }, 
              user ? user.email : 'user@example.com'
            )
          ),
          React.createElement('i', { 
            'data-feather': 'chevron-down',
            className: 'w-4 h-4 text-gray-400'
          })
        ),

        // Dropdown menu
        dropdownOpen && React.createElement('div', { 
          className: 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 fade-in' 
        },
          React.createElement('a', {
            href: '#',
            onClick: (e) => {
              e.preventDefault();
              navigate('/profile');
              setDropdownOpen(false);
            },
            className: 'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          },
            React.createElement('i', { 
              'data-feather': 'user',
              className: 'w-4 h-4 mr-3'
            }),
            'Profile'
          ),
          React.createElement('a', {
            href: '#',
            onClick: (e) => {
              e.preventDefault();
              navigate('/settings');
              setDropdownOpen(false);
            },
            className: 'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          },
            React.createElement('i', { 
              'data-feather': 'settings',
              className: 'w-4 h-4 mr-3'
            }),
            'Settings'
          ),
          React.createElement('hr', { className: 'my-1' }),
          React.createElement('button', {
            onClick: handleLogout,
            className: 'flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50'
          },
            React.createElement('i', { 
              'data-feather': 'log-out',
              className: 'w-4 h-4 mr-3'
            }),
            'Sign out'
          )
        )
      )
    )
  );
}

// Initialize Feather icons after component renders
React.useEffect(() => {
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
}, []);

export default Header;
