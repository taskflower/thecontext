// components/ui/AddButton.tsx
import React from 'react';

interface AddButtonProps {
  onClick: () => void;
  title?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({ onClick, title }) => (
  <button 
    onClick={onClick}
    className="bg-blue-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
    title={title}
  >+</button>
);