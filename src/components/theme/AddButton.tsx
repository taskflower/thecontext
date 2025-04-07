// components/theme/AddButton.tsx
import React from 'react';

interface AddButtonProps {
  onClick: () => void;
  title?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({ onClick, title }) => (
  <button 
    onClick={onClick}
    className="btn-add"
    title={title}
  >+</button>
);