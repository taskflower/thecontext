// components/ui/BackButton.tsx
import React from 'react';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button onClick={onClick} className="text-blue-500 hover:text-blue-700">
    ← Powrót
  </button>
);