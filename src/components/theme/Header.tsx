// components/ui/Header.tsx
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => (
  <h2 className="text-lg font-semibold mb-4">{title}</h2>
);