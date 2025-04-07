// components/theme/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="empty-state">{message}</div>
);