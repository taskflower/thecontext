/**
 * E-Learning Layout Component
 */
import React from 'react';
import { LayoutProps } from '../../types';

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-b from-blue-50 to-white max-w-4xl mx-auto shadow-xl border border-blue-100 rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Layout;