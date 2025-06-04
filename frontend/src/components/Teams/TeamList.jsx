import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeams } from '../../services/auth';
import InviteMembers from './InviteMembers';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
    // Initialize feather icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      setError('Failed to load teams');
      console.error('Teams fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClick = (team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    setSelectedTeam(null);
    // Optionally refresh teams list
    fetchTeams();
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
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and collaborate with members</p>
        </div>
        <Link
          to="/teams/create"
          className="btn btn-primary flex items-center"
        >
          <i data-feather="plus" className="h-4 w-4 mr-2" />
          Create Team
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

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i data-feather="users" className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first team to start collaborating with others.
          </p>
          <Link
            to="/teams/create"
            className="btn btn-primary"
          >
            <i data-feather="plus" className="h-4 w-4 mr-2" />
            Create Your First Team
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {team.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleInviteClick(team)}
                      className="btn btn-sm btn-secondary"
                      title="Invite members"
                    >
                      <i data-feather="user-plus" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <i data-feather="users" className="h-4 w-4 mr-1" />
                      <span>{team.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <i data-feather="folder" className="h-4 w-4 mr-1" />
                      <span>{team.projectIds?.length || 0} projects</span>
                    </div>
                  </div>
                </div>

                {/* Member Avatars */}
                {team.members && team.members.length > 0 && (
                  <div className="mt-4">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 5).map((member, index) => (
                        <div
                          key={member.userId || index}
                          className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white text-white text-xs font-medium"
                          title={`Team member`}
                        >
                          {index + 1}
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white text-gray-600 text-xs font-medium">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/projects/team/${team.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Projects
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && selectedTeam && (
        <InviteMembers
          team={selectedTeam}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default TeamList;
