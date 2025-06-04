import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CreateProject from './CreateProject';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

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

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects and track progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Project
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: 'all', label: 'All Projects' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'ON_HOLD', label: 'On Hold' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-project-diagram text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {filter === 'all' ? 'No projects yet' : `No ${filter.toLowerCase()} projects`}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'all' 
              ? 'Create your first project to start organizing your work'
              : `No projects with ${filter.toLowerCase()} status found`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-lg"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.teamName}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${PRIORITY_COLORS[project.priority]}`}>
                    {project.priority}
                  </span>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[project.status]}`}>
                    {project.status}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    {project.taskIds?.length || 0} tasks
                  </div>
                </div>

                {project.deadline && (
                  <div className="text-xs text-muted-foreground mb-4">
                    <i className="fas fa-calendar mr-1"></i>
                    Due: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/projects/${project.id}/kanban`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <i className="fas fa-columns mr-1"></i>
                    Kanban
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default ProjectList;
