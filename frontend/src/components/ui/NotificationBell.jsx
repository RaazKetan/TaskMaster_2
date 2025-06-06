
import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Users, Clock } from 'lucide-react';
import api from '../../services/api';
import { Button } from './button';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      
      if (!currentUser || !currentUser.userId) return;

      const response = await api.get('/invitations', {
        params: { userId: currentUser.userId }
      });
      
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      
      if (!currentUser || !currentUser.userId) return;

      await api.post(`/invitations/${invitationId}/accept`, null, {
        params: { userId: currentUser.userId }
      });

      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      
      if (!currentUser || !currentUser.userId) return;

      await api.post(`/invitations/${invitationId}/decline`, null, {
        params: { userId: currentUser.userId }
      });

      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingInvitations = notifications.filter(notif => notif.status === 'pending');

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {pendingInvitations.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {pendingInvitations.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {pendingInvitations.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          Team Invitation
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                          You've been invited to join <span className="font-medium">{invitation.teamName}</span> as a {invitation.role}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                          <Clock className="w-3 h-3" />
                          {new Date(invitation.invitedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            disabled={loading}
                            className="text-xs px-3 py-1 h-auto"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvitation(invitation.id)}
                            disabled={loading}
                            className="text-xs px-3 py-1 h-auto"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
