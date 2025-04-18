// src/templates/minimal/layouts/SimpleLayout.tsx
import React from "react";
import { LayoutProps } from "../../baseTemplate";
import { X } from "lucide-react";

const SimpleLayout: React.FC<LayoutProps> = ({ children, title }) => (
  <div className="flex flex-col bg-white rounded-lg mx-auto w-full max-w-4xl h-full md:min-h-[95vh] md:max-h-[95vh]">
    {/* Header Section */}
    <div className="py-6 bg-white">
      <div className="w-full flex items-center justify-between">
        <div className="font-black text-xl tracking-tighter text-gray-900">
          WiseAds
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-gray-700 h-8 w-8 rounded-full text-gray-900 hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-10 mb-8">
        <h2 className="text-3xl font-normal text-gray-900">
          Przeprowadzimy
          <br />
          Cię przez Twoją
          <br />
          <span className="font-bold">{title || "pierwszą kampanię"}</span>
        </h2>
      </div>
    </div>

    {/* Content Section */}
    <div className="overflow-y-auto flex-1 flex flex-col justify-center">{children}</div>
  </div>
);

export default SimpleLayout;
