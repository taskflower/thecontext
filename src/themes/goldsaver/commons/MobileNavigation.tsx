// src/themes/goldsaver/components/layout/MobileNavigation.tsx
import React from "react";
import { NavigationConfig, NavigationItem } from "./NavigationItem";


interface MobileNavigationProps {
  menuItems: NavigationConfig[];
  currentSegment: string;
  navigateTo: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  menuItems,
  currentSegment,
  navigateTo,
}) => {
  const isActive = (slug: string) => slug === currentSegment;
  const visibleItems = menuItems.slice(0, 5); // Only show first 5 items on mobile

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-5 gap-1">
        {visibleItems.map((item) => (
          <NavigationItem
            key={item.slug || "home"}
            icon={item.icon}
            name={item.name}
            isActive={isActive(item.slug)}
            onClick={() => navigateTo(item.href)}
            variant="mobile"
          />
        ))}
      </div>
    </div>
  );
};
