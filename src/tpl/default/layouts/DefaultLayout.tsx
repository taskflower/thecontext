// src/templates/default/layouts/DefaultLayout.tsx
import React from "react";
import UserDropdown from "@/_auth/UserDropdown";
import { LayoutProps } from "@/types";

const DefaultLayout: React.FC<LayoutProps> = ({
  children,
  title,
  onBackClick,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-6">
      <div className="container mx-auto">
        <header className="flex justify-between items-center py-4">
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          <div className="ml-auto">
            <UserDropdown />
          </div>
        </header>

        {onBackClick && (
          <button
            onClick={onBackClick}
            className="text-sm text-gray-600 hover:text-gray-800 mb-4"
          >
            Back
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default DefaultLayout;