/**
 * Alternative Layout Component
 */
import React from 'react';
import { LayoutProps } from '../../types';

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl max-w-4xl mx-auto shadow-lg ${className}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Layout;