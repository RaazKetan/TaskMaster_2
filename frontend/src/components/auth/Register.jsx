import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';


// Tile colors for hover effect (not used in this version, but kept for reference)
const tileColors = [
  'from-blue-100 to-blue-200',
  'from-purple-100 to-purple-200',
  'from-pink-100 to-pink-200',
  'from-green-100 to-green-200',
  'from-yellow-100 to-yellow-200',
  'from-orange-100 to-orange-200'
];


const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const { register } = useAuth();
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');


    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }


    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }


    setLoading(true);


    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };


      const registeredUser = await register(userData);


      if (registeredUser) {
        localStorage.setItem('userData', JSON.stringify(registeredUser));
        localStorage.setItem('sessionToken', registeredUser.sessionToken);
      }


      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-white" style={{ background: 'bg-white' }}>
      <div
        className="w-full max-w-md p-8 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-2xl"
      >
        <div className="mb-6 text-center">
          <h2 className="mb-1 text-2xl font-semibold text-gray-900">
            Create your account
          </h2>
          <p className="text-gray-500">
            Join TaskMaster and start collaborating
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded bg-red-50">
              {error}
            </div>
          )}


          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full px-3 py-2 transition bg-transparent border border-gray-300 rounded focus:outline-none focus:border-blue-600 hover:border-blue-400"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="w-full px-3 py-2 transition bg-transparent border border-gray-300 rounded focus:outline-none focus:border-blue-600 hover:border-blue-400"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </div>
          </div>


          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 transition bg-transparent border border-gray-300 rounded focus:outline-none focus:border-blue-600 hover:border-blue-400"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>


          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 transition bg-transparent border border-gray-300 rounded focus:outline-none focus:border-blue-600 hover:border-blue-400"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>


          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 transition bg-transparent border border-gray-300 rounded focus:outline-none focus:border-blue-600 hover:border-blue-400"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full py-2 mt-2 font-medium text-white transition-colors bg-blue-600 rounded shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
          >
            {loading ? (
              <svg className="w-5 h-5 mr-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : null}
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};


export default Register;



