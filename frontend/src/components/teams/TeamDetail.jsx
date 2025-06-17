import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import InviteMember from './InviteMember';
import { TEAM_ROLES } from '../../utils/constants';

const TeamDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamResponse, projectsResponse] = await Promise.all([
        api.get(`/teams/${id}`),
        api.get(`/projects/team/${id}`)
      ]);

      const teamData = teamResponse.data;
      setTeam(teamData);
      setProjects(projectsResponse.data || []);

      // Fetch member details
      if (teamData.members && teamData.members.length > 0) {
        const memberIds = teamData.members.map(member => member.userId);
        const usersResponse = await api.get('/users');
        const allUsers = usersResponse.data;
        
        const teamMembers = teamData.members.map(member => {
          const userInfo = allUsers.find(u => u.id === member.userId);
          return {
            ...member,
            user: userInfo
          };
        });
        
        setMembers(teamMembers);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberInvited = () => {
    fetchTeamData();
    setShowInviteModal(false);
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await api.delete(`/teams/${id}/members/${userId}`);
        fetchTeamData();
      } catch (err) {
        setError('Failed to remove member');
      }
    }
  };

  const isAdmin = () => {
    if (!team || !user) return false;
    return team.ownerId === user.id || 
           members.some(m => m.userId === user.id && m.role === TEAM_ROLES.ADMIN);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4">
          {typeof error === 'string' ? error : error?.message || 'An error occurred while loading team data'}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">Team not found</h3>
          <p className="text-muted-foreground">The team you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mr-4">
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{team.name}</h1>
            <p className="text-muted-foreground">
              {members.length} members • {projects.length} projects
            </p>
          </div>
        </div>
        
        {isAdmin() && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-primary btn-md"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Invite Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Team Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">About</h3>
            </div>
            <div className="card-content">
              <p className="text-muted-foreground">
                {team.description || 'No description provided for this team.'}
              </p>
            </div>
          </div>

          {/* Projects */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Projects</h3>
                <Link to="/projects" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
            </div>
            <div className="card-content">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-project-diagram text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Link to="/projects" className="btn btn-primary btn-sm">
                    Create Project
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{project.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          project.priority === 'HIGH' ? 'priority-high' :
                          project.priority === 'MEDIUM' ? 'priority-medium' :
                          project.priority === 'LOW' ? 'priority-low' : 'priority-urgent'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          project.status === 'ACTIVE' ? 'status-in-progress' :
                          project.status === 'COMPLETED' ? 'status-done' : 'status-todo'
                        }`}>
                          {project.status}
                        </span>
                        <Link 
                          to={`/projects/${project.id}`}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          View Project →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Team Members</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {member.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      member.role === 'MEMBER' ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {member.role}
                    </span>
                    {isAdmin() && member.userId !== team.ownerId && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteMember
          teamId={id}
          onClose={() => setShowInviteModal(false)}
          onMemberInvited={handleMemberInvited}
        />
      )}
    </div>
  );
};

export default TeamDetail;
