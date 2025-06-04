import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Trash2, Edit, UserPlus, Send, X } from 'lucide-react';
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
        const userId = getCurrentUserId();
        
        if (!userId) {
            setTeams([]);
            setLoading(false);
            return;
        }

        // Update the endpoint as per new structure
        const response = await api.get(`/api/teams/${userId}`);
        setTeams(response.data);
        setError('');
    } catch (err) {
        setError('Failed to fetch teams: ' + err.message);
        console.error('Error fetching teams:', err);
    } finally {
        setLoading(false);
    }
};
  const createTeam = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      // Use consistent user data
      const currentUserId = 'user_123';
      const currentUserEmail = 'user@taskmaster.com';
      
      // Get current user data from localStorage
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      
      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
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
      
      setTeams(prev => [...prev, response.data]);
      setCreateTeamForm({ name: '', description: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team');
    } finally {
      setCreateLoading(false);
    }
  };

  const removeTeamMember = async (teamId, userId) => {
    try {
      await api.delete(`/team-invitations/team/${teamId}/member/${userId}`, {
        params: { removedBy: 'default_user' }
      });
      fetchTeams(); // Refresh teams to show updated member list
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const deleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone and will also delete all associated projects.')) {
      return;
    }

    try {
      const storedUser = localStorage.getItem('userData');
      const currentUser = storedUser ? JSON.parse(storedUser) : { userId: 'user_123', email: 'user@taskmaster.com' };
      
      await api.delete(`/teams/${teamId}`, {
        params: { userId: currentUser.userId }
      });
      
      // Remove from local state
      setTeams(prev => prev.filter(team => team.id !== teamId));
      
      // If this was the selected team, clear selection
      if (selectedTeam && selectedTeam.id === teamId) {
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team. Please try again.');
    }
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
    <div className="min-h-screen bg-slate-50">
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
                      {teams.map((team) => (
                        <div
                          key={team.id}
                          className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-colors',
                            selectedTeam?.id === team.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                          onClick={() => setSelectedTeam(team)}
                        >
                          <h3 className="font-medium text-slate-900">{team.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{team.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-slate-500">
                              {Array.isArray(team.members) ? team.members.length : 0} members
                            </span>
                            <div className="flex items-center gap-2">
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
                                className="text-blue-600 hover:bg-blue-50 h-6 w-6 p-0"
                                title="Edit team"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTeam(team.id);
                                }}
                                className="text-red-600 hover:bg-red-50 h-6 w-6 p-0"
                                title="Delete team"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                                      onClick={() => removeTeamMember(selectedTeam.id, memberId)}
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
                    </CardContent>
                  </Card>


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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
        </div>
      </div>
    </div>
  );
};

export default ShadcnTeamManagement;