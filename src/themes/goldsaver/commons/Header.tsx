// src/themes/goldsaver/components/layout/Header.tsx
import React from "react";
import { NavigationConfig } from "./NavigationItem";
import { Logo } from "./Logo";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface HeaderProps {
  menuItems: NavigationConfig[];
  currentSegment: string;
  notifications: any[];
  onViewAllNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  menuItems,
  currentSegment,
  notifications,
  onViewAllNotifications,
}) => {
  const getCurrentPageName = () => {
    return (
      menuItems.find((item) => item.slug === currentSegment)?.name ||
      "Dashboard"
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 py-0.5">
      <div className="flex items-center justify-between px-4 py-3 lg:py-4">
        <div className="flex items-center lg:hidden">
          <Logo />
        </div>

        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-gray-900">
            {getCurrentPageName()}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <NotificationsDropdown
            notifications={notifications}
            onViewAll={onViewAllNotifications}
          />

          <button className="lg:hidden w-8 h-8 bg-gray-200 rounded-full">
            {/* Avatar image would go here */}
          </button>
        </div>
      </div>
    </header>
  );
};
