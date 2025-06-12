import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Trash2, Edit, UserPlus, Send, X, UserMinus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import LoadingMascot from '../common/LoadingMascot';
import { cn } from '../../lib/utils';
import { getCurrentUserId } from '../../utils/auth.js';
import InviteMember from './InviteMember';

const ShadcnTeamManagement = () => {
  const { userSpace } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    description: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  useEffect(() => {
    if (userSpace) {
      fetchTeams();
    } else {
      // Create a default user space for demonstration
      const defaultUserSpace = {
        userId: 'demo_user_' + Date.now(),
        userEmail: 'demo@example.com'
      };
      // Since we don't have actual auth, we'll work with a demo user
      fetchTeams();
    }
  }, [userSpace]);

const fetchTeams = async () => {
    try {
        setLoading(true);
        setError(null);

        // Get current user ID from localStorage
        const userData = localStorage.getItem('userData');
        const currentUser = userData ? JSON.parse(userData) : null;

        if (!currentUser || !currentUser.userId) {
            setError('User not authenticated');
            setTeams([]);
            return;
        }

        const response = await api.get('/teams', {
            params: { userId: currentUser.userId }
        });
        const teams = response.data || [];
        setTeams(teams);
        setError(null);
    } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to fetch teams: ' + (err.response?.data?.message || err.message));
        // Don't clear teams on error - keep existing data
    } finally {
        setLoading(false);
    }
};
  const createTeam = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        setCreateLoading(false);
        return;
      }

      const teamData = {
        ...createTeamForm,
        userId: currentUser.userId,
        members: [],
        projectIds: []
      };

      const response = await api.post('/teams', teamData);
      console.log('Team created:', response.data);

      // Add the new team to existing teams
      setTeams(prev => [...prev, response.data]);
      setCreateTeamForm({ name: '', description: '' });
      setShowCreateModal(false);
      setError(null);
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditTeam = async (team) => {
    if (team) {
      setEditingTeam({ ...team });
      setShowEditModal(true);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        return;
      }

      if (!teamId) {
        setError('Invalid team ID');
        return;
      }

      await api.delete(`/teams/${teamId}`, {
        params: { userId: currentUser.userId }
      });

      // Remove from local state with consistent ID handling
      setTeams(prev => prev.filter(team => {
        const currentTeamId = team._id || team.id;
        return currentTeamId !== teamId;
      }));

      // If this was the selected team, clear selection
      if (selectedTeam) {
        const selectedTeamId = selectedTeam._id || selectedTeam.id;
        if (selectedTeamId === teamId) {
          setSelectedTeam(null);
        }
      }

      setError(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateTeam = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        setCreateLoading(false);
        return;
      }

      if (!editingTeam || (!editingTeam._id && !editingTeam.id)) {
        setError('Invalid team data');
        setCreateLoading(false);
        return;
      }

      const teamId = editingTeam._id || editingTeam.id;
      const teamData = {
        ...editingTeam,
        userId: currentUser.userId
      };

      const response = await api.put(`/teams/${teamId}`, teamData);

      // Update local state with consistent ID handling
      setTeams(prev => prev.map(team => {
        const currentTeamId = team._id || team.id;
        return currentTeamId === teamId ? response.data : team;
      }));

      // Update selected team if it was the one being edited
      if (selectedTeam) {
        const selectedTeamId = selectedTeam._id || selectedTeam.id;
        if (selectedTeamId === teamId) {
          setSelectedTeam(response.data);
        }
      }

      setShowEditModal(false);
      setEditingTeam(null);
      setError(null);

      // Refresh teams data to ensure consistency
      setTimeout(() => {
        fetchTeams();
      }, 500);
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const removeTeamMember = async (teamId, userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        return;
      }

      await api.delete(`/teams/${teamId}/members/${userId}`, {
        params: { removedBy: currentUser.userId }
      });

      // Refresh teams to show updated member list
      await fetchTeams();
      setError(null);
    } catch (error) {
      console.error('Error removing team member:', error);
      setError('Failed to remove team member: ' + (error.response?.data?.message || error.message));
    }
  };
  const fetchPendingInvitations = async (teamId) => {
    try {
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId || !teamId) return;

      const response = await api.get(`/teams/${teamId}/pending-invitations`, {
        params: { userId: currentUser.userId }
      });
      
      setPendingInvitations(response.data || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      setPendingInvitations([]);
    }
  };

  const resendInvitation = async (teamId, invitationId, email) => {
    try {
      await api.post(`/teams/${teamId}/resend-invitation`, {
        email: email,
        invitationId: invitationId
      });
      
      alert('Invitation resent successfully!');
      await fetchPendingInvitations(teamId);
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Failed to resend invitation: ' + (error.response?.data?.error || error.message));
    }
  };

  const cancelInvitation = async (invitationId, email) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      await api.delete(`/invitations/${invitationId}/cancel`, {
        params: { email: email }
      });
      
      alert('Invitation cancelled successfully!');
      if (selectedTeam) {
        await fetchPendingInvitations(selectedTeam._id || selectedTeam.id);
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      alert('Failed to cancel invitation: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleMemberInvited = async () => {
    await fetchTeams();
    if (selectedTeam) {
      await fetchPendingInvitations(selectedTeam._id || selectedTeam.id);
    }
  };

  // Fetch pending invitations when team is selected
  useEffect(() => {
    if (selectedTeam) {
      const teamId = selectedTeam._id || selectedTeam.id;
      fetchPendingInvitations(teamId);
    } else {
      setPendingInvitations([]);
    }
  }, [selectedTeam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <LoadingMascot 
              message="Loading your teams..." 
              size="large"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Management</h1>
                <p className="text-slate-600">Manage your teams and invite new members</p>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Teams List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Teams ({teams.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teams.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No teams yet</p>
                      <Button onClick={() => setShowCreateModal(true)} size="sm">
                        Create Your First Team
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teams.map((team) => {
                        const teamId = team._id || team.id;
                        const selectedTeamId = selectedTeam?._id || selectedTeam?.id;

                        return (
                          <div
                            key={teamId}
                            className={cn(
                              'p-4 border rounded-lg cursor-pointer transition-colors',
                              selectedTeamId === teamId
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            )}
                            onClick={() => setSelectedTeam(team)}
                          >
                            <h3 className="font-medium text-slate-900">{team.name || 'Unnamed Team'}</h3>
                            <p className="text-sm text-slate-600 mt-1">{team.description || 'No description'}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">
                                {Array.isArray(team.members) ? team.members.length : 0} members
                              </span>
                              <div className="flex items-center gap-6">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {team.role || 'Member'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTeam(team);
                                  }}
                                  className="text-black-600 hover:bg-yellow-200 h-6 w-8 p-0"
                                  title="Edit team"
                                >
                                  <Edit className="w-3 h-3" />Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTeam(teamId);
                                  }}
                                  
                                  className="text-black-600 hover:bg-red-200 h-6 w-10 p-0"
                                  title="Delete team"
                                >
                                  <Trash2 className="w-3 h-3" />Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Team Details & Invitations */}
            <div className="lg:col-span-2">
              {selectedTeam ? (
                <div className="space-y-6">
                  {/* Team Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {selectedTeam.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">{selectedTeam.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Members:</span> {Array.isArray(selectedTeam.members) ? selectedTeam.members.length : 0}
                        </div>
                        <div>
                          <span className="font-medium">Projects:</span> {Array.isArray(selectedTeam.projectIds) ? selectedTeam.projectIds.length : 0}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(selectedTeam.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Owner:</span> {selectedTeam.ownerId === 'default_user' ? 'You' : 'Other'}
                        </div>
                      </div>

                      {/* Team Members */}
                      {Array.isArray(selectedTeam.members) && selectedTeam.members.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Team Members</h4>
                          <div className="space-y-2">
                            {selectedTeam.members.map((member, index) => {
                              const memberId = typeof member === 'string' ? member : member.userId;
                              const memberRole = typeof member === 'string' ? 'MEMBER' : member.role;
                              return (
                                <div key={`${memberId}-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Users className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <span className="text-sm">
                                        {memberId === 'default_user' ? 'You' : `User ${memberId}`}
                                      </span>
                                      {memberRole && (
                                        <span className="text-xs text-slate-500 block">
                                          {memberRole}
                                        </span>
                                      )}
                                    </div>
                                    {selectedTeam.ownerId === memberId && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        Owner
                                      </span>
                                    )}
                                  </div>
                                  {selectedTeam.ownerId === 'default_user' && memberId !== 'default_user' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeTeamMember(selectedTeam._id || selectedTeam.id, memberId)}
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <Button onClick={() => setShowInviteModal(true)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Member
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pending Invitations */}
                  {pendingInvitations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Pending Invitations ({pendingInvitations.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {pendingInvitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Send className="w-4 h-4 text-yellow-600" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium">
                                    {invitation.invitedUserEmail}
                                  </span>
                                  <div className="text-xs text-slate-500">
                                    Role: {invitation.role} • Sent: {new Date(invitation.invitedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  Pending
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => resendInvitation(
                                    selectedTeam._id || selectedTeam.id, 
                                    invitation.id, 
                                    invitation.invitedUserEmail
                                  )}
                                  className="text-xs"
                                  title="Resend invitation"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelInvitation(invitation.id, invitation.invitedUserEmail)}
                                  className="text-xs text-red-600 hover:bg-red-50"
                                  title="Cancel invitation"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Team</h3>
                      <p className="text-slate-600">Choose a team from the list to view details and manage members</p>
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
          </div>

          {/* Create Team Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 p-6 shadow-md rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Create New Team</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={createTeam} className="space-y-4">
                  <div>
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      required
                      value={createTeamForm.name}
                      onChange={(e) => setCreateTeamForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter team name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamDescription">Description</Label>
                    <Textarea
                      id="teamDescription"
                      value={createTeamForm.description}
                      onChange={(e) => setCreateTeamForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What does this team work on?"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? 'Creating...' : 'Create Team'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Team Modal */}
          {showEditModal && editingTeam && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Edit Team</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTeam(null);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={updateTeam} className="space-y-4">
                  <div>
                    <Label htmlFor="editTeamName">Team Name *</Label>
                    <Input
                      id="editTeamName"
                      required
                      value={editingTeam.name || ''}
                      onChange={(e) => setEditingTeam(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter team name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editTeamDescription">Description</Label>
                    <Textarea
                      id="editTeamDescription"
                      value={editingTeam.description || ''}
                      onChange={(e) => setEditingTeam(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What does this team work on?"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingTeam(null);
                      }}
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? 'Updating...' : 'Update Team'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Invite Member Modal */}
          {showInviteModal && selectedTeam && (
            <InviteMember
              teamId={selectedTeam._id || selectedTeam.id}
              onClose={() => setShowInviteModal(false)}
              onMemberInvited={handleMemberInvited}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShadcnTeamManagement;