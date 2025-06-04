import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProjects, getTeamProjects } from '../../services/auth';
import { formatDate, PRIORITY_COLORS, PROJECT_STATUS } from '../../utils/constants';

const ProjectList = () => {
  const { teamId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchProjects();
    // Initialize feather icons
    if (window.feather) {
      window.feather.replace();
    }
  }, [teamId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = teamId ? await getTeamProjects(teamId) : await getProjects();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Projects fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'ALL') return true;
    return project.status === filter;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    archived: projects.filter(p => p.status === 'ARCHIVED').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {teamId ? 'Team Projects' : 'Projects'}
          </h1>
          <p className="text-gray-600">
            {teamId ? 'Manage projects for your team' : 'Manage all your projects'}
          </p>
        </div>
        <Link
          to="/projects/create"
          className="btn btn-primary flex items-center"
        >
          <i data-feather="plus" className="h-4 w-4 mr-2" />
          Create Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <i data-feather="alert-circle" className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i data-feather="folder" className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i data-feather="activity" className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <i data-feather="check-circle" className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <i data-feather="archive" className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-xl font-bold text-gray-900">{stats.archived}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex space-x-2">
            {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i data-feather="folder" className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'ALL' ? 'No projects yet' : `No ${filter.toLowerCase()} projects`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'ALL' 
              ? 'Create your first project to get started with task management.' 
              : `You don't have any ${filter.toLowerCase()} projects.`
            }
          </p>
          {filter === 'ALL' && (
            <Link
              to="/projects/create"
              className="btn btn-primary"
            >
              <i data-feather="plus" className="h-4 w-4 mr-2" />
              Create Your First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
                    {project.priority}
                  </span>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <i data-feather="calendar" className="h-4 w-4 mr-1" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center">
                        <i data-feather="clock" className="h-4 w-4 mr-1" />
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/projects/${project.id}/kanban`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      <i data-feather="columns" className="h-4 w-4 mr-1" />
                      Kanban Board
                    </Link>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
