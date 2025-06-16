import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import TaskMasterDashboard from './components/Dashboard/TaskMasterDashboard.jsx';
import TeamList from './components/teams/TeamList.jsx';
import TeamDetail from './components/teams/TeamDetail.jsx';
import ProjectManagement from './components/projects/ProjectManagement.jsx';
import ShadcnProjectManagement from './components/projects/ShadcnProjectManagement.jsx';
import ShadcnTeamManagement from './components/teams/ShadcnTeamManagement.jsx';
import AnimatedTeamDashboard from './components/dashboard/AnimatedTeamDashboard.jsx';
import LoadingDemo from './components/common/LoadingDemo.jsx';
import ProjectDetail from './components/projects/ProjectDetail.jsx';
import KanbanBoard from './components/kanban/KanbanBoard.jsx';
import TaskManagement from './components/tasks/TaskManagement.jsx';
import TaskPriorityVisualizer from './components/tasks/TaskPriorityVisualizer.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import LandingPage from './components/LandingPage.jsx';
import UserProfile from './components/profile/UserProfile.jsx';
import NotFound from './components/common/NotFound.jsx';
import './App.css'
import PublicDashboard from './components/dashboard/PublicDashboard';


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
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Public Dashboard Route - Must come before protected routes */}
          <Route path="/public/dashboard/:shareId" element={<PublicDashboard />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AnimatedTeamDashboard />
            </PrivateRoute>
          } />


          <Route path="/dashboard-old" element={
            <PrivateRoute>
              <TaskMasterDashboard />
            </PrivateRoute>
          } />


          <Route path="/tasks" element={
            <PrivateRoute>
              <TaskManagement />
            </PrivateRoute>
          } />


          <Route path="/tasks-visualizer" element={
            <PrivateRoute>
              <TaskPriorityVisualizer />
            </PrivateRoute>
          } />


          <Route path="/teams" element={
            <PrivateRoute>
              <ShadcnTeamManagement />
            </PrivateRoute>
          } />


          <Route path="/teams-old" element={
            <PrivateRoute>
              <TeamList />
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

          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />


          <Route path="/projects-old" element={
            <PrivateRoute>
              <ProjectManagement />
            </PrivateRoute>
          } />


          <Route path="/projects/:id" element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          } />


          <Route path="/projects/:id/kanban" element={
            <PrivateRoute>
              <KanbanBoard />
            </PrivateRoute>
          } />


          <Route path="/loading-demo" element={<LoadingDemo />} />

          {/* 404 Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}


function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}


export default App;