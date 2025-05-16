// src/themes/default/commons/Loader.tsx
import React from "react";

const Loader: React.FC = () => (
  <div className="flex items-center justify-center p-6">
    <div className="w-4 h-4 border-4 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
    <span className="text-gray-900 text-sm">Przetwarzanie...</span>
  </div>
);

export default Loader;