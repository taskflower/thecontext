// src/components/SharedLoader.tsx
import React from 'react';

interface SharedLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const SharedLoader: React.FC<SharedLoaderProps> = ({
  message = 'Ładowanie...',
  size = 'md',
  fullScreen = false,
}) => {
  // Mapowanie rozmiarów dla spinnera
  const spinnerSize = 
    size === 'sm' ? 'w-6 h-6 border-2' :
    size === 'md' ? 'w-8 h-8 border-2' :
    'w-10 h-10 border-2';
  
  // Rozmiar tekstu
  const textSize = 
    size === 'sm' ? 'text-xs' :
    size === 'md' ? 'text-sm' :
    'text-base';
  
  // Kontener - zawsze na środku, różnica tylko w fixed vs static
  const container = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50" 
    : "w-full h-full absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-40";

  return (
    <div className={container}>
      <div className="flex flex-col items-center gap-3">
        <div 
          className={`${spinnerSize} rounded-full border-neutral-300 border-t-neutral-800 animate-spin`}
          aria-label="Ładowanie"
        ></div>
        {message && (
          <p className={`${textSize} text-neutral-600 font-normal tracking-tight`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SharedLoader;