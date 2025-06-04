import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CreateTeam from './CreateTeam';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('userData');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (currentUser && currentUser.userId) {
        // Fetch user-specific teams
        const response = await api.get(`/teams/${currentUser.userId}`);
        setTeams(response.data);
      } else {
        // Fallback to general teams endpoint
        const response = await api.get('/teams');
        setTeams(response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeams([newTeam, ...teams]);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teams and collaborate with members
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Team
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first team to start collaborating with others
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-lg"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {team.members?.length || 0} members
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {team.name}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {team.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <i className="fas fa-project-diagram mr-1"></i>
                    {team.projectIds?.length || 0} projects
                  </div>
                  
                  <Link
                    to={`/teams/${team.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Team
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTeam
          onClose={() => setShowCreateModal(false)}
          onTeamCreated={handleTeamCreated}
        />
      )}
    </div>
  );
};

export default TeamList;
