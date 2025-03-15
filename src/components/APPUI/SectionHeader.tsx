// components/ui/SectionHeader.tsx
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onAddClick: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onAddClick }) => (
  <div className="flex items-center justify-between mb-2">
    <div className="text-sm font-medium">{title}</div>
    <button className="p-1 rounded-md hover:bg-gray-100 text-gray-700" onClick={onAddClick}>
      <PlusCircle className="h-4 w-4" />
    </button>
  </div>
);