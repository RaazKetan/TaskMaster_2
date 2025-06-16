import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Trash2, Edit, UserPlus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import LoadingMascot from '../common/LoadingMascot';
import { cn } from '../../lib/utils';
import InviteMember from './InviteMember';
import { FadeInItem } from '../ui/animations';


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
  const [animatingItems, setAnimatingItems] = useState(new Set()); // Fixed: Removed new after useState

  const [showInviteModal, setShowInviteModal] = useState(false);


  // NEW STATE FOR INLINE CONFIRMATION BOX
  const [showInlineConfirmBox, setShowInlineConfirmBox] = useState(false);
  const [teamToDeleteId, setTeamToDeleteId] = useState(null);
  const [teamToDeleteName, setTeamToDeleteName] = useState(''); // Store name for confirmation message

  useEffect(() => {
    fetchTeams();
  }, []);


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
      setTeams(prev => [...prev, response.data]);
      setCreateTeamForm({ name: '', description: '' });
      setShowCreateModal(false);
      setError(null);
    } catch (error) {
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

  // NEW FUNCTION: Called when delete button is clicked to show inline confirmation
  const handleDeleteTeamClick = (teamId, teamName) => {
    setTeamToDeleteId(teamId); // Store the ID of the team to be deleted
    setTeamToDeleteName(teamName || 'this team'); // Store the name for the message
    setShowInlineConfirmBox(true); // Show the inline confirmation box
  };

  // MODIFIED FUNCTION: Now called when "Delete" is confirmed in the inline box
  const handleConfirmDelete = async () => {
    setShowInlineConfirmBox(false); // Hide the confirmation box immediately
    setError(null); // Clear previous errors

    if (!teamToDeleteId) {
      setError('Invalid team ID for deletion confirmation.');
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

      await api.delete(`/teams/${teamToDeleteId}`, {
        params: { userId: currentUser.userId }
      });

      // Remove from local state with consistent ID handling
      setTeams(prev => prev.filter(team => {
        const currentTeamId = team._id || team.id;
        return currentTeamId !== teamToDeleteId;
      }));

      // If this was the selected team, clear selection
      if (selectedTeam) {
        const selectedTeamId = selectedTeam._id || selectedTeam.id;
        if (selectedTeamId === teamToDeleteId) {
          setSelectedTeam(null);
        }
      }

      setError(null);
      setTeamToDeleteId(null); // Clear the stored ID after successful deletion
      setTeamToDeleteName(''); // Clear the stored name
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team: ' + (error.response?.data?.message || error.message));
      setTeamToDeleteId(null); // Clear the ID even on error
      setTeamToDeleteName(''); // Clear the name
    }
  };

  // NEW FUNCTION: Called when user cancels deletion from the inline confirmation box
  const handleCancelDelete = () => {
    setShowInlineConfirmBox(false);
    setTeamToDeleteId(null); // Clear the stored ID
    setTeamToDeleteName(''); // Clear the stored name
    setError(null); // Clear any pending errors related to deletion
  };


  const updateTeam = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        setCreateLoading(false);
        return;
      }
      const teamId = editingTeam._id || editingTeam.id;
      const teamData = { ...editingTeam, userId: currentUser.userId };
      const response = await api.put(`/teams/${teamId}`, teamData);
      setTeams(prev => prev.map(team => (team._id || team.id) === teamId ? response.data : team));
      if (selectedTeam && (selectedTeam._id || selectedTeam.id) === teamId) {
        setSelectedTeam(response.data);
      }
      setShowEditModal(false);
      setEditingTeam(null);
      setError(null);


    } catch (error) {
      setError('Failed to update team: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateLoading(false);
    }
  };


  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    try {
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        return;
      }
      await api.delete(`/teams/${teamId}`, { params: { userId: currentUser.userId } });
      setTeams(prev => prev.filter(team => (team._id || team.id) !== teamId));
      if (selectedTeam && (selectedTeam._id || selectedTeam.id) === teamId) setSelectedTeam(null);
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


  // Helper to get owner name (never "Unknown")
  const getOwnerName = (team) => {
    if (!team) return '';
    if (team.owner && (team.owner.firstName || team.owner.lastName)) {
      return `${team.owner.firstName || ''} ${team.owner.lastName || ''}`.trim();
    }
    if (team.ownerName) return team.ownerName;
    if (team.ownerEmail) return team.ownerEmail;
    if (team.ownerId === 'default_user') return 'You';
    if (team.ownerId) return team.ownerId; // fallback to ownerId
    return 'Unknown';
  };
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
          <div className="mb-10 bg-white border-b shadow-sm border-slate-200 rounded-t-xl">
            <div className="flex flex-col items-center gap-4 px-4 py-6 text-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Team Management
                </h1>
                <p className="mt-1 text-base text-muted-foreground">
                  Manage your teams and invite new members
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-all bg-blue-600 rounded-lg shadow hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Create Team
                </Button>
              </div>
            </div>
          </div>


          {error && (
            <div className="p-4 mb-6 text-red-700 border-l-4 border-red-400 rounded shadow bg-red-50">
              {error}
            </div>
          )}


          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Teams List */}
            <div className="lg:col-span-1">
              <Card className="bg-white border shadow rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="w-5 h-5" />
                    Your Teams ({teams.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teams.length === 0 ? (
                    <div className="py-8 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="mb-4 text-slate-500">No teams yet</p>
                      <Button onClick={() => setShowCreateModal(true)} size="sm">
                        Create Your First Team
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teams.map((team, idx) => {
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
                                  className="text-black-600 hover:bg-green-200 h-6 w-8 p-0"
                                  title="Edit team"
                                >
                                  <Edit className="w-3 h-3" />Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Call the new function for inline confirmation
                                    handleDeleteTeamClick(teamId, team.name);
                                  }}

                                  className="text-black-600 hover:bg-red-200 h-6 w-10 p-0"
                                  title="Delete team"
                                >
                                  <Trash2 className="w-3 h-3" />Delete
                                </Button>

                              </div>
                              <p className="mt-1 text-sm text-slate-600">{team.description || 'No description'}</p>
                            </div>
                          </FadeInItem>
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
                <FadeInItem>
                  <div className="space-y-6">
                    {/* Team Info */}
                    <Card className="bg-white border shadow rounded-xl">
                      <CardHeader>
                        <CardTitle className="flex flex-col gap-1 text-xl font-bold">
                          <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" />
                            <span>{selectedTeam.name}</span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 w-fit">
                            Owner: {getOwnerName(selectedTeam)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-slate-600">{selectedTeam.description || 'No description provided.'}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="font-medium">Members:</span> {Array.isArray(selectedTeam.members) ? selectedTeam.members.length : 0}
                          </div>
                          <div>
                            <span className="font-medium">Projects:</span> {Array.isArray(selectedTeam.projectIds) ? selectedTeam.projectIds.length : 0}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {selectedTeam.createdAt ? new Date(selectedTeam.createdAt).toLocaleDateString() : 'N/A'}
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
                        <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
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
                                    Role: {invitation.role} â€¢ Sent: {new Date(invitation.invitedAt).toLocaleDateString()}

                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900">
                                      {member.user?.firstName} {member.user?.lastName}
                                    </div>
                                    <div className="text-xs text-slate-500">{member.user?.email || member.email}</div>
                                  </div>
                                  <span className={`ml-auto text-xs px-2 py-1 rounded-full border ${
                                    member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    member.role === 'MEMBER' ? 'bg-green-100 text-green-800 border-green-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}>
                                    {member.role}
                                  </span>
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
                  </div>
                </FadeInItem>
              ) : (
                <Card className="bg-white border shadow rounded-xl">
                  <CardContent className="py-16 text-center">
                    <h3 className="mb-2 text-lg font-medium text-slate-900">Select a Team</h3>
                    <p className="text-slate-600">Choose a team from the list to view details and manage members</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>


          {/* Create Team Modal */}
          {showCreateModal && (

            <div className="fixed inset-0 bg-gradient-to-br from-blue-800 to-blue-100 p-6 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200 p-6 shadow-md rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-lg font-semibold">Create New Team</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >

                    &times;

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

            <div className="fixed inset-0 bg-gradient-to-br from-blue-800 to-blue-100 p-6 flex items-center justify-center z-50">
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

                    &times;

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
              onMemberInvited={fetchTeams}
            />
          )}

          {/* INLINE DELETE CONFIRMATION BOX */}
          {showInlineConfirmBox && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center">
              {/* Overlay for blurring background */}
              {/* The backdrop-blur-sm is a Tailwind CSS utility */}
              <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={handleCancelDelete} // Allows clicking outside to cancel
              ></div>

              {/* Confirmation Box */}
              <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto z-10 animate-fade-in-up">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete **{teamToDeleteName}**? This action cannot be undone and will permanently remove all associated data.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleConfirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default ShadcnTeamManagement;