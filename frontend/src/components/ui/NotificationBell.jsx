import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';


const NotificationBell = ({ notifications = [], onSeen, iconClassName = '', hasUnseen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const unseenCount = notifications.filter(n => !n.seen).length;
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);


  const handleClick = () => {
    setShowDropdown((prev) => !prev);
    if (onSeen) onSeen();
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);


  return (
    <div className="relative flex items-center">
      <button
        ref={buttonRef}
        className="relative flex items-center justify-center"
        onClick={handleClick}
        aria-label="Show notifications"
        type="button"
        tabIndex={0}
      >
        <Bell className={`w-5 h-5 align-middle ${iconClassName}`} />
        {unseenCount > 0 && (
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
        )}
      </button>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-80 animate-fade-in"
        >
          <div className="p-3 font-semibold text-gray-700 border-b">Notifications</div>
          <div className="overflow-y-auto max-h-60">
            {notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-2 text-sm border-b last:border-b-0 ${n.seen ? 'bg-white' : 'bg-blue-50 font-semibold'}`}
                >
                  <div>
                    <span className="font-bold">{n.title}</span>
                    <span className="ml-2 text-xs text-slate-500">{n.priority}</span>
                  </div>
                  <div className="text-xs text-slate-500">Deadline: {n.deadline}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default NotificationBell;
