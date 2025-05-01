// src/templates/default/layouts/SimpleLayout.tsx
import React from "react";
import { X } from "lucide-react";
import { LayoutProps } from "@/types";
import { useFlow } from "@/hooks";

const SimpleLayout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  stepTitle, 
  onBackClick 
}) => {
  const navigation = useFlow();
  const handleCloseClick = onBackClick || navigation.navigateToWorkspaces;

  return (
    <div className="flex flex-col bg-white rounded-lg mx-auto w-full max-w-4xl h-full md:min-h-[95vh] md:max-h-[95vh] px-4 md:px-6">
      {/* Nagłówek - stała pozycja */}
      <div className="py-4 bg-white sticky top-0 z-10">
        <div className="w-full flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter text-gray-900">
            WiseAds
          </div>
          <button 
            onClick={handleCloseClick}
            className="inline-flex items-center justify-center text-sm font-medium h-8 w-8 rounded-full text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {title && (
          <div className="my-4">
            <h2 className="text-2xl font-normal text-gray-900">{title}</h2> 
            {stepTitle && <p className="text-sm text-gray-500 mt-1">{stepTitle}</p>}
          </div>
        )}
      </div>

      {/* Przewijalna zawartość */}
      <div className="overflow-y-auto flex-1 pt-4 pb-6">
        {children}
      </div>
    </div>
  );
};

export default SimpleLayout;