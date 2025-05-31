// src/modules/appTree/AppTreeCard.tsx - Main card component
import React from 'react';
import AppTreeView from './components/AppTreeView';

interface AppTreeCardProps {
  onClose: () => void;
  configName?: string;
}

const AppTreeCard: React.FC<AppTreeCardProps> = ({ onClose, configName = 'exampleTicketApp' }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="fixed left-6 top-10 z-50 w-92 bg-white rounded-lg shadow-xl border border-zinc-200 h-[90vh] flex flex-col animate-in slide-in-from-left-2">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            🌳 Application Tree
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AppTreeView configName={configName}  />
        </div>
      </div>
    </>
  );
};

export default AppTreeCard;