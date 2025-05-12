// src/themes/goldsaver/components/layout/Sidebar.tsx
import React from "react";
import { Logo } from "./Logo";
import { GoldPriceIndicator } from "./GoldPriceIndicator";
import { NavigationConfig, NavigationItem } from "./NavigationItem";
import { UserProfile } from "./UserProfile";


interface SidebarProps {
  menuItems: NavigationConfig[];
  currentSegment: string;
  navigateTo: (path: string) => void;
  goldPrice: { price: number; change: number };
  onSettings: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  currentSegment,
  navigateTo,
  onSettings,
  onLogout,
}) => {
  const isActive = (slug: string) => slug === currentSegment;

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center space-x-2 sticky top-0 bg-white">
        <Logo />
      </div>

      <GoldPriceIndicator  />

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavigationItem
            key={item.slug || "home"}
            icon={item.icon}
            name={item.name}
            isActive={isActive(item.slug)}
            onClick={() => navigateTo(item.href)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 sticky bottom-0">
        <UserProfile
          name="Jan Kowalski"
          email="jan.kowalski@example.com"
          onLogout={onLogout}
          onSettings={onSettings}
        />
      </div>
    </aside>
  );
};