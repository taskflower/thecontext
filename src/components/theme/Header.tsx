// components/theme/Header.tsx
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => (
  <h2 className="text-xl font-semibold mb-4 tracking-tight">{title}</h2>
);