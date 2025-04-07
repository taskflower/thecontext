// components/ui/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="text-gray-500 text-sm italic">{message}</div>
);