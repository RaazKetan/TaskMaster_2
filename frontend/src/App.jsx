import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import LandingPage from './components/LandingPage.jsx';
import AnimatedTeamDashboard from './components/dashboard/AnimatedTeamDashboard.jsx';
import ShadcnTeamManagement from './components/teams/ShadcnTeamManagement.jsx';
import ShadcnProjectManagement from './components/projects/ShadcnProjectManagement.jsx';
import TeamDetail from './components/teams/TeamDetail.jsx';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AnimatedTeamDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/teams" element={
            <PrivateRoute>
              <ShadcnTeamManagement />
            </PrivateRoute>
          } />
          
          <Route path="/teams/:id" element={
            <PrivateRoute>
              <TeamDetail />
            </PrivateRoute>
          } />
          
          <Route path="/projects" element={
            <PrivateRoute>
              <ShadcnProjectManagement />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
