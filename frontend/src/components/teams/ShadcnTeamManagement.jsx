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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [createTeamForm, setCreateTeamForm] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);


  useEffect(() => {
    fetchTeams();
  }, []);


  const fetchTeams = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const res = await api.get('/teams', { params: { userId: currentUser.userId } });
      setTeams(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teams');
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


  const handleEditTeam = (team) => {
    setEditingTeam({ ...team });
    setShowEditModal(true);
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
      setTimeout(() => fetchTeams(), 500);
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
      setError('Failed to delete team: ' + (error.response?.data?.message || error.message));
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingMascot message="Loading your teams..." size="large" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
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
                          <FadeInItem key={teamId} delay={idx * 0.05}>
                            <div
                              className={cn(
                                'p-4 rounded-lg cursor-pointer transition-all border bg-white hover:shadow-md hover:-translate-y-1 flex flex-col gap-2',
                                selectedTeamId === teamId
                                  ? 'border-blue-500 ring-2 ring-blue-100 shadow'
                                  : 'border-slate-200 hover:border-blue-300'
                              )}
                              onClick={() => setSelectedTeam(team)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white bg-blue-600 rounded-full shadow">
                                  {team.name?.charAt(0)?.toUpperCase() || "T"}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold truncate text-slate-900">{team.name || 'Unnamed Team'}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                      Owner: {getOwnerName(team)}
                                    </span>
                                    <span className="text-xs text-slate-400">{Array.isArray(team.members) ? team.members.length : 0} members</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={e => { e.stopPropagation(); handleEditTeam(team); }}
                                    className="w-6 h-6 p-0 text-blue-600 hover:bg-blue-50"
                                    title="Edit team"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={e => { e.stopPropagation(); handleDeleteTeam(teamId); }}
                                    className="w-6 h-6 p-0 text-red-600 hover:bg-red-50"
                                    title="Delete team"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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
                        <Button
                          onClick={() => setShowInviteModal(true)}
                          className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-all bg-blue-600 rounded-lg shadow hover:bg-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </CardContent>
                    </Card>
                    {/* Members List */}
                    <Card className="bg-white border shadow rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Array.isArray(selectedTeam.members) && selectedTeam.members.length > 0 ? (
                          <div className="space-y-2">
                            {selectedTeam.members.map((member, idx) => (
                              <FadeInItem key={member.userId || idx} delay={idx * 0.03}>
                                <div className="flex items-center gap-3 p-2 transition rounded hover:bg-slate-50">
                                  <div className="flex items-center justify-center w-8 h-8 font-bold rounded-full bg-slate-200 text-slate-700">
                                    {member.user?.firstName?.charAt(0)?.toUpperCase() || member.userId?.charAt(0)?.toUpperCase() || 'U'}
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
                              </FadeInItem>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No members yet.</div>
                        )}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md p-6 mx-4 bg-white shadow rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Create New Team</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Ã—
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md p-6 mx-4 bg-white shadow rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Team</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTeam(null);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Ã—
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
        </div>
      </div>
    </div>
  );
};


export default ShadcnTeamManagement;