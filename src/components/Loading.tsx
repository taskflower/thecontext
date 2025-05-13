// src/components/Loading.tsx

import { FCWithChildren } from "@/core";

const Loading: FCWithChildren<{ message?: string }> = ({ message = "Ładowanie..." }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
    <div className="p-6 rounded-lg text-center">
      <div className="w-8 h-8 border-8 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-700 text-xs">{message}</p>
    </div>
  </div>
);

export default Loading;
