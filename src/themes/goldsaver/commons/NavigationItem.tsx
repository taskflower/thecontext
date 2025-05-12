// src/themes/goldsaver/components/common/NavigationItem.tsx
import React, { ReactNode } from "react";

export interface NavigationConfig {
    name: string;
    slug: string;
    icon: ReactNode;
    href: string;
  }

interface NavigationItemProps {
  icon: React.ReactNode;
  name: string;
  isActive: boolean;
  onClick: () => void;
  variant?: "sidebar" | "mobile";
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  name,
  isActive,
  onClick,
  variant = "sidebar",
}) => {
  if (variant === "mobile") {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-3 ${
          isActive ? "text-yellow-600" : "text-gray-500"
        }`}
      >
        {icon}
        <span className="text-xs mt-1">{name.split(" ")[0]}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-yellow-100 text-yellow-900"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span
        className={`mr-3 ${
          isActive ? "text-yellow-600" : "text-gray-500"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-medium">{name}</span>
    </button>
  );
};