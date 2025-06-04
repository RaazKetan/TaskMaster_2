const { useNavigate, Link } = ReactRouterDOM;

function Login() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', formData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName
        }));
        
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (error) {
      setError(error.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  React.useEffect(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }, []);

  return React.createElement('div', { 
    className: 'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8' 
  },
    React.createElement('div', { className: 'max-w-md w-full space-y-8' },
      // Header
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { 
          className: 'mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4' 
        },
          React.createElement('span', { className: 'text-2xl text-white' }, '📋')
        ),
        React.createElement('h2', { 
          className: 'text-3xl font-bold text-gray-900' 
        }, 'Sign in to TaskMaster'),
        React.createElement('p', { 
          className: 'mt-2 text-sm text-gray-600' 
        }, 'Welcome back! Please sign in to your account.')
      ),

      // Form
      React.createElement('form', { 
        className: 'mt-8 space-y-6',
        onSubmit: handleSubmit
      },
        React.createElement('div', { className: 'space-y-4' },
          // Email field
          React.createElement('div', null,
            React.createElement('label', { 
              htmlFor: 'email',
              className: 'form-label'
            }, 'Email address'),
            React.createElement('div', { className: 'relative' },
              React.createElement('input', {
                id: 'email',
                name: 'email',
                type: 'email',
                required: true,
                value: formData.email,
                onChange: handleChange,
                className: 'input pl-10',
                placeholder: 'Enter your email'
              }),
              React.createElement('div', { 
                className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none' 
              },
                React.createElement('i', { 
                  'data-feather': 'mail',
                  className: 'w-5 h-5 text-gray-400'
                })
              )
            )
          ),

          // Password field
          React.createElement('div', null,
            React.createElement('label', { 
              htmlFor: 'password',
              className: 'form-label'
            }, 'Password'),
            React.createElement('div', { className: 'relative' },
              React.createElement('input', {
                id: 'password',
                name: 'password',
                type: 'password',
                required: true,
                value: formData.password,
                onChange: handleChange,
                className: 'input pl-10',
                placeholder: 'Enter your password'
              }),
              React.createElement('div', { 
                className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none' 
              },
                React.createElement('i', { 
                  'data-feather': 'lock',
                  className: 'w-5 h-5 text-gray-400'
                })
              )
            )
          )
        ),

        // Remember me and forgot password
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('input', {
              id: 'remember-me',
              name: 'remember-me',
              type: 'checkbox',
              className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            }),
            React.createElement('label', { 
              htmlFor: 'remember-me',
              className: 'ml-2 block text-sm text-gray-900'
            }, 'Remember me')
          ),
          React.createElement('div', { className: 'text-sm' },
            React.createElement('a', { 
              href: '#',
              className: 'font-medium text-blue-600 hover:text-blue-500'
            }, 'Forgot your password?')
          )
        ),

        // Error message
        error && React.createElement('div', { 
          className: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm' 
        },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('i', { 
              'data-feather': 'alert-circle',
              className: 'w-4 h-4 mr-2'
            }),
            error
          )
        ),

        // Submit button
        React.createElement('button', {
          type: 'submit',
          disabled: loading,
          className: `btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`
        },
          loading ? React.createElement('div', { className: 'flex items-center justify-center' },
            React.createElement('div', { className: 'spinner w-4 h-4 mr-2' }),
            'Signing in...'
          ) : React.createElement('div', { className: 'flex items-center justify-center' },
            React.createElement('i', { 
              'data-feather': 'log-in',
              className: 'w-4 h-4 mr-2'
            }),
            'Sign in'
          )
        ),

        // Sign up link
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-sm text-gray-600' },
            "Don't have an account? ",
            React.createElement(Link, { 
              to: '/register',
              className: 'font-medium text-blue-600 hover:text-blue-500'
            }, 'Sign up here')
          )
        )
      )
    )
  );
}

export default Login;
