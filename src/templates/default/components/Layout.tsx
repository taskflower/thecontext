/**
 * Default Layout Component
 */
import React from 'react';
import { LayoutProps } from '../../types';

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default Layout;