// components/theme/BackButton.tsx
import React from 'react';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button onClick={onClick} className="btn-back">
    ← Powrót
  </button>
);