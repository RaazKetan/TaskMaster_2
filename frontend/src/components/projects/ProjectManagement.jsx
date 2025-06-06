import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingMascot from '../common/LoadingMascot';
import TaskLoadingCard from '../common/TaskLoadingCard';
import CreateProject from './CreateProject';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const projectsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsResponse] = await Promise.all([
        api.get('/teams')
      ]);
      
      const teamsData = teamsResponse.data || [];
      setTeams(teamsData);
      
      // Fetch projects for each team
      const allProjects = [];
      for (const team of teamsData) {
        try {
          const projectsResponse = await api.get(`/projects/team/${team.id}`);
          const teamProjects = projectsResponse.data || [];
          allProjects.push(...teamProjects.map(p => ({ ...p, teamName: team.name })));
        } catch (err) {
          console.error(`Error fetching projects for team ${team.id}:`, err);
        }
      }
      
      setProjects(allProjects);
      setError('');
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    const team = teams.find(t => t.id === newProject.teamId);
    const projectWithTeamName = { ...newProject, teamName: team?.name || 'Unknown Team' };
    setProjects([projectWithTeamName, ...projects]);
    setShowCreateModal(false);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH':
        return { backgroundColor: '#fef2f2', color: '#dc2626' };
      case 'MEDIUM':
        return { backgroundColor: '#fefbeb', color: '#d97706' };
      case 'LOW':
        return { backgroundColor: '#f0fdf4', color: '#16a34a' };
      case 'URGENT':
        return { backgroundColor: '#faf5ff', color: '#9333ea' };
      default:
        return { backgroundColor: '#f9fafb', color: '#6b7280' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: '#eff6ff', color: '#2563eb' };
      case 'COMPLETED':
        return { backgroundColor: '#f0fdf4', color: '#16a34a' };
      case 'ON_HOLD':
        return { backgroundColor: '#f9fafb', color: '#6b7280' };
      default:
        return { backgroundColor: '#f9fafb', color: '#6b7280' };
    }
  };

  // Filter and paginate projects
  const filteredProjects = projects.filter(project => {
    // Safely handle null/undefined values in search
    const projectName = project.name || '';
    const teamName = project.teamName || '';
    const searchTermLower = searchTerm ? searchTerm.toLowerCase() : '';
    
    return projectName.toLowerCase().includes(searchTermLower) ||
           teamName.toLowerCase().includes(searchTermLower);
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">TaskMaster</span>
              </div>
              <nav className="flex gap-8">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/projects" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                  Projects
                </Link>
                <Link to="/tasks" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Tasks
                </Link>
                <Link to="/calendar" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Calendar
                </Link>
                <Link to="/teams" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Teams
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <LoadingMascot 
              message="Fetching your amazing projects..." 
              size="large"
            />
            
            <div className="mt-8 space-y-4">
              <TaskLoadingCard title="Organizing project data..." />
              <TaskLoadingCard title="Loading team information..." />
              <TaskLoadingCard title="Preparing task summaries..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          </div>

          {error && (
            <div style={{ 
              margin: '16px 24px 0', 
              padding: '16px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              borderRadius: '6px' 
            }}>
              {error}
            </div>
          )}

          {/* Table */}
          <div style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Project Name
                  </th>
                  <th style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Team
                  </th>
                  <th style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Priority
                  </th>
                  <th style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'white' }}>
                {currentProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ 
                      padding: '48px 24px', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      {searchTerm ? 'No projects found matching your search.' : 'No projects yet. Create your first project to get started.'}
                    </td>
                  </tr>
                ) : (
                  currentProjects.map((project, index) => (
                    <tr key={project.id} style={{ 
                      borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                      '&:hover': { backgroundColor: '#f9fafb' }
                    }}>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{project.name}</div>
                          {project.description && (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#6b7280', 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '300px'
                            }}>
                              {project.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '500' }}>{project.teamName}</span>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...getPriorityStyle(project.priority)
                        }}>
                          {project.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...getStatusStyle(project.status)
                        }}>
                          {project.status === 'ACTIVE' ? 'In Progress' : 
                           project.status === 'COMPLETED' ? 'Completed' : 
                           project.status === 'ON_HOLD' ? 'Planning' : project.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Link
                            to={`/projects/${project.id}`}
                            style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            style={{ 
                              color: '#dc2626', 
                              fontWeight: '500',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              padding: '24px', 
              borderTop: '1px solid #e5e7eb' 
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '4px 12px',
                  fontSize: '14px',
                  color: '#6b7280',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              {[...Array(Math.min(3, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '14px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: currentPage === pageNum ? '#3b82f6' : 'transparent',
                      color: currentPage === pageNum ? 'white' : '#6b7280'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 3 && (
                <>
                  <span style={{ padding: '4px 12px', fontSize: '14px', color: '#6b7280' }}>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '14px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: currentPage === totalPages ? '#3b82f6' : 'transparent',
                      color: currentPage === totalPages ? 'white' : '#6b7280'
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '4px 12px',
                  fontSize: '14px',
                  color: '#6b7280',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateProject
          teams={teams}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectManagement;