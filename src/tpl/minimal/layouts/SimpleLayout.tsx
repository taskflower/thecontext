// src/tpl/minimal/layouts/SimpleLayout.tsx
import React from "react";
import { X } from "lucide-react";
import { LayoutProps } from "@/types";

const SimpleLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  onBackClick 
}) => (
  <div className="flex flex-col bg-white rounded-lg mx-auto w-full max-w-4xl h-full md:min-h-[95vh] md:max-h-[95vh] px-4 md:px-6">
    {/* Header Section */}
    <div className="py-6 bg-white">
      <div className="w-full flex items-center justify-between">
        <div className="font-black text-xl tracking-tighter text-gray-900">
          WiseAds
        </div>
        <button className="inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:text-gray-700 h-8 w-8 rounded-full text-gray-900 hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {title && (
        <div className="mt-10 mb-8">
          <h2 className="text-3xl font-normal text-gray-900">
            {title}
          </h2> 
        </div>
      )}
    </div>

    {/* Content Section */}
    <div className="overflow-y-auto flex-1 flex flex-col justify-center">
      {children}
    </div>
  </div>
);

export default SimpleLayout;