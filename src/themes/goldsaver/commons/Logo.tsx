// src/themes/goldsaver/commons/Logo.tsx
import React from "react";

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">G</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">GoldSaver</h2>
    </div>
  );
};