const { useNavigate, Link } = ReactRouterDOM;

function Register() {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
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
      setError(error.response?.data || 'Registration failed. Please try again.');
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
        }, 'Create your account'),
        React.createElement('p', { 
          className: 'mt-2 text-sm text-gray-600' 
        }, 'Join TaskMaster and start managing projects efficiently.')
      ),

      // Form
      React.createElement('form', { 
        className: 'mt-8 space-y-6',
        onSubmit: handleSubmit
      },
        React.createElement('div', { className: 'space-y-4' },
          // Name fields
          React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { 
                htmlFor: 'firstName',
                className: 'form-label'
              }, 'First name'),
              React.createElement('input', {
                id: 'firstName',
                name: 'firstName',
                type: 'text',
                required: true,
                value: formData.firstName,
                onChange: handleChange,
                className: 'input',
                placeholder: 'John'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { 
                htmlFor: 'lastName',
                className: 'form-label'
              }, 'Last name'),
              React.createElement('input', {
                id: 'lastName',
                name: 'lastName',
                type: 'text',
                required: true,
                value: formData.lastName,
                onChange: handleChange,
                className: 'input',
                placeholder: 'Doe'
              })
            )
          ),

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
                placeholder: 'john@example.com'
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
            ),
            React.createElement('p', { className: 'form-help' }, 
              'Password must be at least 6 characters long.'
            )
          ),

          // Confirm password field
          React.createElement('div', null,
            React.createElement('label', { 
              htmlFor: 'confirmPassword',
              className: 'form-label'
            }, 'Confirm password'),
            React.createElement('div', { className: 'relative' },
              React.createElement('input', {
                id: 'confirmPassword',
                name: 'confirmPassword',
                type: 'password',
                required: true,
                value: formData.confirmPassword,
                onChange: handleChange,
                className: 'input pl-10',
                placeholder: 'Confirm your password'
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

        // Terms and conditions
        React.createElement('div', { className: 'flex items-center' },
          React.createElement('input', {
            id: 'terms',
            name: 'terms',
            type: 'checkbox',
            required: true,
            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          }),
          React.createElement('label', { 
            htmlFor: 'terms',
            className: 'ml-2 block text-sm text-gray-900'
          }, 
            'I agree to the ',
            React.createElement('a', { 
              href: '#',
              className: 'text-blue-600 hover:text-blue-500'
            }, 'Terms and Conditions'),
            ' and ',
            React.createElement('a', { 
              href: '#',
              className: 'text-blue-600 hover:text-blue-500'
            }, 'Privacy Policy')
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
            'Creating account...'
          ) : React.createElement('div', { className: 'flex items-center justify-center' },
            React.createElement('i', { 
              'data-feather': 'user-plus',
              className: 'w-4 h-4 mr-2'
            }),
            'Create account'
          )
        ),

        // Sign in link
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-sm text-gray-600' },
            'Already have an account? ',
            React.createElement(Link, { 
              to: '/login',
              className: 'font-medium text-blue-600 hover:text-blue-500'
            }, 'Sign in here')
          )
        )
      )
    )
  );
}

export default Register;
