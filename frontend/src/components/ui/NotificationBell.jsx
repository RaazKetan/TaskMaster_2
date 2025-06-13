// import React, { useState, useRef, useEffect } from 'react';
// import { Bell } from 'lucide-react';


// const NotificationBell = ({ notifications = [], onSeen, iconClassName = '', hasUnseen }) => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const unseenCount = notifications.filter(n => !n.seen).length;
//   const buttonRef = useRef(null);
//   const dropdownRef = useRef(null);


//   const handleClick = () => {
//     setShowDropdown((prev) => !prev);
//     if (onSeen) onSeen();
//   };


//   // Close dropdown when clicking outside
//   useEffect(() => {
//     if (!showDropdown) return;
//     const handleClickOutside = (event) => {
//       if (
//         buttonRef.current &&
//         !buttonRef.current.contains(event.target) &&
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showDropdown]);


//   return (
//     <div className="relative flex items-center">
//       <button
//         ref={buttonRef}
//         className="relative flex items-center justify-center"
//         onClick={handleClick}
//         aria-label="Show notifications"
//         type="button"
//         tabIndex={0}
//       >
//         <Bell className={`w-5 h-5 align-middle ${iconClassName}`} />
//         {unseenCount > 0 && (
//           <span className="absolute top-0 right-0 block w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
//         )}
//       </button>
//       {showDropdown && (
//         <div
//           ref={dropdownRef}
//           className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-80 animate-fade-in"
//         >
//           <div className="p-3 font-semibold text-gray-700 border-b">Notifications</div>
//           <div className="overflow-y-auto max-h-60">
//             {notifications.length === 0 ? (
//               <div className="px-4 py-2 text-sm text-slate-500">No notifications</div>
//             ) : (
//               notifications.map((n) => (
//                 <div
//                   key={n.id}
//                   className={`px-4 py-2 text-sm border-b last:border-b-0 ${n.seen ? 'bg-white' : 'bg-blue-50 font-semibold'}`}
//                 >
//                   <div>
//                     <span className="font-bold">{n.title}</span>
//                     <span className="ml-2 text-xs text-slate-500">{n.priority}</span>
//                   </div>
//                   <div className="text-xs text-slate-500">Deadline: {n.deadline}</div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


// export default NotificationBell;




import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Users, Clock, RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from './button';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
      setProcessingId(invitationId);
      setLoading(true);
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      
      if (!currentUser || !currentUser.userId) return;

      await api.post(`/invitations/${invitationId}/accept`, null, {
        params: { userId: currentUser.userId }
      });

      // Refresh notifications
      await fetchNotifications();
      
      // Show success message
      alert('Invitation accepted successfully! You are now a member of the team.');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    try {
      setProcessingId(invitationId);
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
      alert('Failed to decline invitation. Please try again.');
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const pendingInvitations = notifications.filter(notif => notif.status === 'pending');
  const allInvitations = notifications.filter(notif => notif.type === 'team_invitation');

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {pendingInvitations.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {pendingInvitations.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <span className="text-xs text-slate-500">
                {pendingInvitations.length} pending
              </span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {allInvitations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No invitations</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 bg-blue-50 border-l-4 border-blue-400">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-900">
                            Team Invitation
                          </p>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          You've been invited to join <span className="font-medium">{invitation.teamName}</span> as a <span className="font-medium">{invitation.role}</span>
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          Invited by: {invitation.invitedByEmail}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                          <Clock className="w-3 h-3" />
                          {new Date(invitation.invitedAt).toLocaleDateString()} at {new Date(invitation.invitedAt).toLocaleTimeString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            disabled={loading || processingId === invitation.id}
                            className="text-xs px-3 py-1 h-auto bg-green-600 hover:bg-green-700"
                          >
                            {processingId === invitation.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <Check className="w-3 h-3 mr-1" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvitation(invitation.id)}
                            disabled={loading || processingId === invitation.id}
                            className="text-xs px-3 py-1 h-auto border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show accepted/declined invitations */}
                {notifications.filter(notif => notif.status !== 'pending').map((invitation) => (
                  <div key={invitation.id} className="p-4 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        invitation.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {invitation.status === 'accepted' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-700">
                            Team Invitation
                          </p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            invitation.status === 'accepted' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {invitation.teamName} - {invitation.role}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(invitation.invitedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingInvitations.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                You have {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
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
