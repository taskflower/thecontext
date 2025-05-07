// src/components/AppLoading.tsx
import React from 'react';

const AppLoading: React.FC<{ message?: string }> = ({ message = "Ładowanie aplikacji..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="p-6 rounded-lg">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-center text-gray-700">{message}</p>
    </div>
  </div>
);

export default AppLoading;