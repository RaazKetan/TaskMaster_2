import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded mr-2"></div>
              <span className="text-xl font-semibold text-gray-900">TaskMaster</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogin}
                className="text-gray-600 hover:text-gray-900"
              >
                Login
              </button>
              <button 
                onClick={handleSignup}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Organize your work and life, effortlessly.
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Become focused, organized, and calm with TaskMaster. The world's #1 task 
                manager and to-do list app. Used by 30 million people to stay organized 
                and get more done.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleSignup}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
                >
                  Sign Up Free
                </button>
                <button 
                  onClick={handleLogin}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
                >
                  Login
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <div className="w-8 h-8 bg-orange-400 rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Daily Tasks</h3>
                    <p className="text-gray-500">Today's priorities</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3"></div>
                    <span className="text-gray-700">Review project proposals</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3"></div>
                    <span className="text-gray-700">Team meeting at 2 PM</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3"></div>
                    <span className="text-gray-700">Update client documentation</span>
                  </div>
                </div>
              </div>
              {/* Decorative plants */}
              <div className="absolute -top-8 -left-8 w-24 h-32 opacity-70">
                <div className="w-full h-full bg-green-600 rounded-full transform rotate-12"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-28 opacity-70">
                <div className="w-full h-full bg-green-500 rounded-full transform -rotate-12"></div>
              </div>
              <div className="absolute top-1/2 -right-8 w-16 h-24 opacity-60">
                <div className="w-full h-full bg-green-400 rounded-full transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage your success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              TaskMaster offers a comprehensive suite of features designed to streamline your workflow, 
              enhance productivity, and help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-2xl p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-4 left-4 w-12 h-16 bg-green-600 rounded-full opacity-70"></div>
                <div className="absolute bottom-4 right-4 w-8 h-12 bg-green-500 rounded-full opacity-60"></div>
                <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-orange-400 rounded mb-4 mx-auto"></div>
                  <h4 className="font-semibold text-gray-900 mb-2">Project Overview</h4>
                  <p className="text-sm text-gray-600">Visual progress tracking</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Projects & Task Management</h3>
              <p className="text-gray-600">
                Effortlessly manage projects and tasks with intuitive tools for organization, prioritization, 
                and progress tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-green-100 rounded-2xl p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-14 bg-green-600 rounded-full opacity-70"></div>
                <div className="absolute bottom-4 left-4 w-6 h-10 bg-green-500 rounded-full opacity-60"></div>
                <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full h-8 bg-blue-200 rounded"></div>
                    <div className="w-full h-8 bg-green-200 rounded"></div>
                    <div className="w-full h-8 bg-orange-200 rounded"></div>
                    <div className="w-full h-8 bg-purple-200 rounded"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Foster seamless team collaboration with shared workspaces, real-time updates, and 
                communication tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-orange-50 rounded-2xl p-8 mb-6 relative overflow-hidden">
                <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg">
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-4/5 h-3 bg-gray-200 rounded"></div>
                    <div className="w-full h-3 bg-blue-400 rounded"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor progress with insightful dashboards, customizable reports, and visual analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features, Simplified
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the core functionalities that make TaskMaster an indispensable tool for individuals and 
              teams seeking to boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kanban Boards</h3>
              <p className="text-gray-600">
                Visualize workflow with customizable kanban boards for effective task management.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Calendar</h3>
              <p className="text-gray-600">
                Coordinate schedules and deadlines with an integrated team calendar.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dashboard & Analytics</h3>
              <p className="text-gray-600">
                Gain insights with data-driven performance and project progress with comprehensive analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* And There's More Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              And There's More...
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover additional features that enhance productivity and streamline your workflow, making 
              TaskMaster your ultimate productivity partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Task Assignment */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-2xl p-8 mb-6 relative overflow-hidden h-48">
                <div className="absolute top-4 left-4 w-8 h-12 bg-green-600 rounded-full opacity-70"></div>
                <div className="relative z-10 bg-white rounded-xl p-4 shadow-lg mt-8">
                  <div className="w-8 h-8 bg-orange-400 rounded-full mx-auto mb-2"></div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Assignment</h3>
              <p className="text-gray-600">
                Assign tasks to team members with clear deadlines and responsibilities.
              </p>
            </div>

            {/* Daily Summaries */}
            <div className="text-center">
              <div className="bg-green-100 rounded-2xl p-8 mb-6 relative overflow-hidden h-48">
                <div className="absolute bottom-4 right-4 w-12 h-8 bg-green-500 rounded-full opacity-60"></div>
                <div className="relative z-10 bg-white rounded-xl p-4 shadow-lg mt-8">
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <div className="w-full h-6 bg-blue-200 rounded"></div>
                    <div className="w-full h-6 bg-green-200 rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Summaries</h3>
              <p className="text-gray-600">
                Receive daily summaries of completed tasks and upcoming deadlines.
              </p>
            </div>

            {/* Time Tracking */}
            <div className="text-center">
              <div className="bg-orange-50 rounded-2xl p-8 mb-6 relative overflow-hidden h-48">
                <div className="relative z-10 bg-white rounded-xl p-4 shadow-lg mt-8">
                  <div className="w-16 h-16 bg-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Tracking</h3>
              <p className="text-gray-600">
                Track time spent on projects for accurate project management and billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to supercharge your productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of individuals and teams who trust TaskMaster to organize their work, 
            manage their projects, and achieve their goals. Start your journey to peak productivity today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignup}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100"
            >
              Sign Up for Free
            </button>
            <button 
              onClick={handleLogin}
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">© 2024 TaskMaster. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;