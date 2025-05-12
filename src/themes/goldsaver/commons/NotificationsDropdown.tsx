// src/themes/goldsaver/components/common/NotificationsDropdown.tsx
import React, { useState } from "react";
import { Bell } from "lucide-react";



interface Notification {
  id: number;
  title: string;
  description: string;
  isNew?: boolean;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onViewAll: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onViewAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasNewNotifications = notifications.some((n) => n.isNew);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {hasNewNotifications && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Powiadomienia</h3>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.isNew
                        ? "bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Brak powiadomień</p>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-200">
            <button 
              onClick={() => {
                onViewAll();
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
            >
              Zobacz wszystkie
            </button>
          </div>
        </div>
      )}
    </div>
  );
};